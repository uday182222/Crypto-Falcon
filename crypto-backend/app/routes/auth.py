from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.achievement_service import AchievementService

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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