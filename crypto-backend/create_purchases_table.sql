-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    package_id INTEGER,
    amount NUMERIC(10,2) NOT NULL,
    coins_received NUMERIC(20,8),
    razorpay_order_id VARCHAR NOT NULL,
    razorpay_payment_id VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES demo_coin_packages(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_purchases_id ON purchases(id);
CREATE INDEX IF NOT EXISTS ix_purchases_user_id ON purchases(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_purchases_razorpay_order_id ON purchases(razorpay_order_id);

-- Update alembic version to fix migration issue
UPDATE alembic_version SET version_num = '4b21ee4b95d9' WHERE version_num = '080547417010'; 