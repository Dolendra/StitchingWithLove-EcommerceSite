export const config = {
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tailoring_web",
  port: process.env.PORT || 5000,
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "Y1234567890abcdef1234567890abcdefOUR_KEY_SECRET"
  }
}; 