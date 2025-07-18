#!/usr/bin/env python3
"""
Script to seed demo coin packages in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal
from app.models.purchase import DemoCoinPackage

def seed_packages():
    """Seed demo coin packages"""
    db = SessionLocal()
    
    try:
        # Check if packages already exist
        existing_packages = db.query(DemoCoinPackage).count()
        if existing_packages > 0:
            print("Packages already exist. Skipping seeding.")
            return
        
        # Define packages
        packages = [
            {
                "name": "Starter Pack",
                "description": "Perfect for beginners. Start your trading journey with 1,000 demo coins.",
                "price": 99.00,  # ₹99
                "coins_per_inr": 10.10,  # 10.1 coins per ₹1
                "bonus_percentage": 0.0,
                "is_active": True
            },
            {
                "name": "Pro Pack",
                "description": "Most popular choice. Get 5,000 demo coins with 10% bonus coins.",
                "price": 399.00,  # ₹399
                "coins_per_inr": 12.50,  # 12.5 coins per ₹1
                "bonus_percentage": 10.0,
                "is_active": True
            },
            {
                "name": "Premium Pack",
                "description": "Best value for serious traders. Get 10,000 demo coins with 20% bonus.",
                "price": 699.00,  # ₹699
                "coins_per_inr": 14.30,  # 14.3 coins per ₹1
                "bonus_percentage": 20.0,
                "is_active": True
            },
            {
                "name": "Ultimate Pack",
                "description": "For power users. Get 25,000 demo coins with 25% bonus coins.",
                "price": 1499.00,  # ₹1499
                "coins_per_inr": 16.70,  # 16.7 coins per ₹1
                "bonus_percentage": 25.0,
                "is_active": True
            }
        ]
        
        # Create packages
        for package_data in packages:
            package = DemoCoinPackage(**package_data)
            db.add(package)
        
        db.commit()
        print(f"Successfully seeded {len(packages)} packages!")
        
        # Display created packages
        created_packages = db.query(DemoCoinPackage).all()
        print("\nCreated packages:")
        for package in created_packages:
            base_coins = package.coins_per_inr * package.price
            bonus_coins = base_coins * (package.bonus_percentage / 100)
            total_coins = base_coins + bonus_coins
            print(f"- {package.name}: ₹{package.price} → {total_coins:.0f} coins (Base: {base_coins:.0f}, Bonus: {bonus_coins:.0f})")
            
    except Exception as e:
        print(f"Error seeding packages: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_packages() 