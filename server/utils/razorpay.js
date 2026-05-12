import Razorpay from "razorpay";

export const hasRazorpayKeys = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

export const getRazorpay = () => {
  if (!hasRazorpayKeys) {
    const error = new Error("Razorpay keys are not configured");
    error.status = 503;
    throw error;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

export default getRazorpay;
