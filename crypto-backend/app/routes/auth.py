from fastapi import APIRouter, Depends, HTTPException, status
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

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if db.query(User).filter((User.username == user.username) | (User.email == user.email)).first():
        raise HTTPException(
            status_code=400, 
            detail="Username or email already registered"
        )
    
    # Hash password and create user with 100000 DemoCoins
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password,
        demo_balance=100000.0  # Seed with 100000 DemoCoins
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Initialize achievements for new user
    try:
        achievement_service = AchievementService(db)
        achievement_service.initialize_user_achievements(db_user)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Error initializing achievements: {e}")
    
    # Initialize wallet for new user
    try:
        from app.services.wallet_service import WalletService
        wallet_service = WalletService(db)
        wallet_service.create_wallet(db_user.id)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Error initializing wallet: {e}")
    
    return db_user

@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update login streak
    try:
        achievement_service = AchievementService(db)
        await achievement_service.update_login_streak(user)
    except Exception as e:
        # Log error but don't fail login
        print(f"Error updating login streak: {e}")
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

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
        updated_at=current_user.updated_at
    )

@router.get("/test")
def test_auth():
    return {"message": "Auth routes are working!"} 