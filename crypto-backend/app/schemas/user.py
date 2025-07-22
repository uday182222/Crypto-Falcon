from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from decimal import Decimal

class UserBase(BaseModel):
    username: str
    email: EmailStr
    level: int = 1  # XP system: user level
    xp: int = 0     # XP system: experience points

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    demo_balance: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    level: int
    xp: int
    xp_first_gain_awarded: bool
    xp_lost_all_awarded: bool
    xp_best_rank: Optional[int]

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str 