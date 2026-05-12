import Stripe from "stripe";

export const hasStripeKeys = () => Boolean(process.env.STRIPE_SECRET_KEY);

export const getStripe = () => {
  if (!hasStripeKeys()) {
    const error = new Error("Stripe secret key not configured");
    error.status = 503;
    throw error;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export default getStripe;


