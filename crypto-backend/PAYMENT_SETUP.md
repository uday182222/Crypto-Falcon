# Payment Integration Setup Guide

## Razorpay Integration

MotionFalcon now includes real payment integration using Razorpay for purchasing demo coins.

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

### Getting Razorpay Keys

1. Sign up for a Razorpay account at https://razorpay.com
2. Go to Settings > API Keys
3. Generate a new key pair
4. Use test keys for development, live keys for production

### Webhook Configuration

For production, configure webhooks in your Razorpay dashboard:

1. Go to Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/purchases/webhook`
3. Select events: `payment.captured`
4. Copy the webhook secret and add it to your environment variables

### Testing

1. Use Razorpay test cards for testing:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Any name

2. Test UPI: Use any valid UPI ID

### Database Setup

The purchase tables are automatically created. To seed demo packages:

```bash
cd crypto-backend
python seed_packages.py
```

### Frontend Configuration

The frontend is already configured to use Razorpay. The Razorpay script is loaded dynamically and the payment flow is integrated into the BuyCoins page.

### Security Notes

- Never commit your Razorpay keys to version control
- Use test keys for development
- Implement proper webhook signature verification (already done)
- Use HTTPS in production
- Monitor webhook failures and implement retry logic

### Package Pricing

The system includes 4 demo packages:

1. **Starter Pack**: ₹99 → 1,000 coins
2. **Pro Pack**: ₹399 → 5,486 coins (10% bonus)
3. **Premium Pack**: ₹699 → 11,995 coins (20% bonus)
4. **Ultimate Pack**: ₹1,499 → 31,292 coins (25% bonus)

### Payment Flow

1. User selects a package
2. Frontend creates order via API
3. Razorpay payment modal opens
4. User completes payment
5. Webhook or frontend verification updates wallet
6. Coins are added to user's account instantly

### Error Handling

The system includes comprehensive error handling for:
- Payment failures
- Network issues
- Invalid signatures
- Duplicate payments
- Database errors

### Monitoring

Monitor the following for production:
- Payment success rates
- Webhook delivery
- Failed payments
- User complaints
- System errors 