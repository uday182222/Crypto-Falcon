from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.achievement_service import AchievementService
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# In-memory storage for reset tokens (in production, use Redis or database)
reset_tokens = {}

def send_reset_email(email: str, reset_token: str):
    """Send password reset email"""
    try:
        # Get email configuration from environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        
        # If no email credentials configured, just print the token
        if not smtp_username or not smtp_password:
            print(f"Password reset token for {email}: {reset_token}")
            return True
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email
        msg['Subject'] = "MotionFalcon - Password Reset"
        
        # Email body
        body = f"""
        Hello,
        
        You have requested to reset your password for your MotionFalcon account.
        
        Your password reset token is: {reset_token}
        
        Please use this token to reset your password. This token will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        MotionFalcon Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    print(f"Registration attempt for user: {user.username}, email: {user.email}")
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
        if existing_user:
            print(f"User already exists: {existing_user.username}")
            raise HTTPException(
                status_code=400, 
                detail="Username or email already registered"
            )
        
        print("User does not exist, proceeding with registration")
        
        # Hash password and create user with 100000 DemoCoins
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username, 
            email=user.email, 
            hashed_password=hashed_password,
            demo_balance=100000.0,  # Seed with 100000 DemoCoins
            level=1,                # Start at level 1
            xp=0                    # Start with 0 XP
        )
        
        print("User object created, adding to database")
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User saved to database with ID: {db_user.id}")
        
        # Initialize achievements for new user
        try:
            achievement_service = AchievementService(db)
            achievement_service.initialize_user_achievements(db_user)
            print("Achievements initialized successfully")
        except Exception as e:
            # Log error but don't fail registration
            print(f"Error initializing achievements: {e}")
        
        # Initialize wallet for new user
        try:
            from app.services.wallet_service import WalletService
            wallet_service = WalletService(db)
            wallet_service.create_wallet(db_user.id)
            print("Wallet initialized successfully")
        except Exception as e:
            # Log error but don't fail registration
            print(f"Error initializing wallet: {e}")
        
        # Create access token for the new user
        access_token = create_access_token(data={"sub": db_user.email})
        print("Access token created successfully")
        
        # Prepare response
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "username": db_user.username,
                "email": db_user.email,
                "demo_balance": float(db_user.demo_balance),
                "level": db_user.level,
                "xp": db_user.xp,
                "is_active": db_user.is_active,
                "created_at": db_user.created_at,
                "updated_at": db_user.updated_at,
                "xp_first_gain_awarded": db_user.xp_first_gain_awarded,
                "xp_lost_all_awarded": db_user.xp_lost_all_awarded,
                "xp_best_rank": db_user.xp_best_rank
            }
        }
        
        print(f"Registration successful, returning response: {response_data}")
        return response_data
        
    except Exception as e:
        print(f"Registration error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    print(f"Login attempt for email: {login_data.email}")
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            print(f"User not found for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(login_data.password, user.hashed_password):
            print(f"Invalid password for user: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"User authenticated successfully: {user.username}")
        
        # Update login streak (don't let this fail the login)
        try:
            achievement_service = AchievementService(db)
            await achievement_service.update_login_streak(user)
            print("Login streak updated successfully")
        except Exception as e:
            # Log error but don't fail login
            print(f"Error updating login streak: {e}")
            # Rollback any partial changes
            db.rollback()

        # XP system: Grant XP for login (don't let this fail the login)
        try:
            def xp_needed(level):
                return 100 + (level - 1) * 50
            
            user.xp += 10  # +10 XP for login
            while user.xp >= xp_needed(user.level):
                user.xp -= xp_needed(user.level)
                user.level += 1
            
            db.commit()
            db.refresh(user)
            print(f"XP updated: {user.xp}, Level: {user.level}")
        except Exception as e:
            # Log error but don't fail login
            print(f"Error updating XP: {e}")
            db.rollback()
            # Continue with login even if XP update fails
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        print("Access token created successfully")
        
        # Prepare response
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "demo_balance": float(user.demo_balance),
                "level": user.level,
                "xp": user.xp,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "xp_first_gain_awarded": user.xp_first_gain_awarded,
                "xp_lost_all_awarded": user.xp_lost_all_awarded,
                "xp_best_rank": user.xp_best_rank
            }
        }
        
        print(f"Login successful, returning response: {response_data}")
        return response_data
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Login error: {e}")
        # Ensure we rollback on any unexpected errors
        try:
            db.rollback()
        except:
            pass  # Ignore rollback errors
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset token has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Store token with expiration (1 hour)
    import time
    reset_tokens[reset_token] = {
        "email": request.email,
        "expires_at": time.time() + 3600  # 1 hour
    }
    
    # Send reset email
    send_reset_email(request.email, reset_token)
    
    return {"message": "If the email exists, a password reset token has been sent"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
    import time
    
    # Check if token exists and is valid
    if request.reset_token not in reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    token_data = reset_tokens[request.reset_token]
    
    # Check if token is expired
    if time.time() > token_data["expires_at"]:
        del reset_tokens[request.reset_token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Find user
    user = db.query(User).filter(User.email == token_data["email"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    # Remove used token
    del reset_tokens[request.reset_token]
    
    return {"message": "Password reset successfully"}

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile from JWT token"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        demo_balance=float(current_user.demo_balance),
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        level=current_user.level,
        xp=current_user.xp,
        xp_first_gain_awarded=current_user.xp_first_gain_awarded,
        xp_lost_all_awarded=current_user.xp_lost_all_awarded,
        xp_best_rank=current_user.xp_best_rank,
        bio=current_user.bio,
        location=current_user.location,
        website=current_user.website,
        phone=current_user.phone,
        preferred_currency=current_user.preferred_currency,
        preferences=current_user.preferences
    )

@router.put("/profile")
def update_profile(
    profile_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    try:
        # Update allowed fields
        if 'username' in profile_update:
            # Check if username is already taken by another user
            existing_user = db.query(User).filter(
                User.username == profile_update['username'],
                User.id != current_user.id
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Username already taken"
                )
            current_user.username = profile_update['username']
        
        if 'email' in profile_update:
            # Check if email is already taken by another user
            existing_user = db.query(User).filter(
                User.email == profile_update['email'],
                User.id != current_user.id
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Email already taken"
                )
            current_user.email = profile_update['email']
        
        # Update profile fields
        profile_fields = ['bio', 'location', 'website', 'phone']
        for field in profile_fields:
            if field in profile_update:
                setattr(current_user, field, profile_update[field])
        
        # Update other fields if they exist in the model
        for field, value in profile_update.items():
            if hasattr(current_user, field) and field not in ['id', 'hashed_password', 'created_at']:
                setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Profile updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.put("/change-password")
def change_password(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        current_password = password_data.get('current_password')
        new_password = password_data.get('new_password')
        
        if not current_password or not new_password:
            raise HTTPException(
                status_code=400,
                detail="Current password and new password are required"
            )
        
        # Verify current password
        if not verify_password(current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )
        
        # Hash and update new password
        current_user.hashed_password = get_password_hash(new_password)
        db.commit()
        
        return {"message": "Password changed successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Failed to change password: {str(e)}"
        )

@router.put("/preferences")
def update_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    try:
        # Update preferences (store as JSON in a new field or use existing fields)
        # For now, we'll store in the preferred_currency field as an example
        if 'currency' in preferences:
            current_user.preferred_currency = preferences['currency']
        
        db.commit()
        return {"message": "Preferences updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update preferences: {str(e)}"
        )

@router.put("/trading-settings")
def update_trading_settings(
    settings: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user trading settings"""
    try:
        # Store trading settings (you might want to create a separate table for this)
        # For now, we'll return success
        return {"message": "Trading settings updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update trading settings: {str(e)}"
        )

@router.get("/test")
def test_auth():
    return {"message": "Auth routes are working!"} 