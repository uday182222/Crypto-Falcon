from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime
from typing import Optional
from app.models.wallet import Wallet
from app.models.user import User
from app.schemas.wallet import WalletUpdateRequest, WalletTopUpRequest

class WalletService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_wallet(self, user_id: int) -> Optional[Wallet]:
        """Get user's wallet"""
        return self.db.query(Wallet).filter(Wallet.user_id == user_id).first()
    
    def create_wallet(self, user_id: int, initial_balance: Decimal = None) -> Wallet:
        """Create a new wallet for user with initial balance"""
        # If no initial balance provided, use the user's demo_balance
        if initial_balance is None:
            user = self.db.query(User).filter(User.id == user_id).first()
            initial_balance = user.demo_balance if user else Decimal('100000.0')
        
        wallet = Wallet(
            user_id=user_id,
            balance=initial_balance
        )
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet
    
    def get_or_create_wallet(self, user_id: int) -> Wallet:
        """Get existing wallet or create new one with default balance"""
        wallet = self.get_user_wallet(user_id)
        if not wallet:
            wallet = self.create_wallet(user_id)
        return wallet
    
    def update_balance(self, user_id: int, amount: Decimal, operation: str = 'add') -> dict:
        """Update wallet balance"""
        wallet = self.get_or_create_wallet(user_id)
        previous_balance = wallet.balance
        
        if operation == 'add':
            wallet.balance += amount
        elif operation == 'subtract':
            if wallet.balance < amount:
                raise ValueError(f"Insufficient balance. Available: {wallet.balance}, Required: {amount}")
            wallet.balance -= amount
        else:
            raise ValueError("Invalid operation. Use 'add' or 'subtract'")
        
        wallet.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(wallet)
        
        return {
            'success': True,
            'new_balance': wallet.balance,
            'previous_balance': previous_balance,
            'amount_changed': amount if operation == 'add' else -amount,
            'message': f"Balance {'increased' if operation == 'add' else 'decreased'} by {amount}",
            'timestamp': wallet.updated_at
        }
    
    def top_up_wallet(self, user_id: int, amount: Decimal) -> dict:
        """Top up wallet with specified amount"""
        if amount <= 0:
            raise ValueError("Top-up amount must be greater than 0")
        
        return self.update_balance(user_id, amount, 'add')
    
    def deduct_from_wallet(self, user_id: int, amount: Decimal) -> dict:
        """Deduct amount from wallet"""
        if amount <= 0:
            raise ValueError("Deduction amount must be greater than 0")
        
        return self.update_balance(user_id, amount, 'subtract')
    
    def get_wallet_summary(self, user_id: int) -> dict:
        """Get comprehensive wallet summary"""
        wallet = self.get_or_create_wallet(user_id)
        user = self.db.query(User).filter(User.id == user_id).first()
        
        # Only sync balances if this is the first time or if there's a significant mismatch
        # Don't override wallet balance changes from trades/top-ups
        if user and wallet.balance == Decimal('100000.0') and user.demo_balance == Decimal('100000.0'):
            # This is the initial state, keep it
            pass
        elif user and abs(wallet.balance - user.demo_balance) > Decimal('1000.0'):
            # Only sync if there's a significant mismatch (more than 1000 coins)
            print(f"Significant balance mismatch detected: Wallet={wallet.balance}, User={user.demo_balance}")
            # Use the wallet balance as the source of truth for transactions
            user.demo_balance = wallet.balance
            self.db.commit()
            self.db.refresh(user)
            print(f"Updated user demo_balance to match wallet: {wallet.balance}")
        
        return {
            'wallet_id': wallet.id,
            'user_id': user_id,
            'username': user.username if user else None,
            'balance': wallet.balance,
            'demo_balance': user.demo_balance if user else None,
            'created_at': wallet.created_at,
            'updated_at': wallet.updated_at,
            'currency': 'USD',  # Demo wallet uses USD
            'is_active': True
        }
    
    def reset_wallet(self, user_id: int, new_balance: Decimal = Decimal('1000.0')) -> dict:
        """Reset wallet to initial balance (admin function)"""
        wallet = self.get_or_create_wallet(user_id)
        previous_balance = wallet.balance
        wallet.balance = new_balance
        wallet.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(wallet)
        
        return {
            'success': True,
            'new_balance': wallet.balance,
            'previous_balance': previous_balance,
            'amount_changed': new_balance - previous_balance,
            'message': f"Wallet reset to {new_balance}",
            'timestamp': wallet.updated_at
        } 