# Deployment Guide

## Frontend (Vercel)

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `frontend/dist`
     - Root Directory: `frontend`
   - Add environment variable:
     - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`

3. **Update CORS in Backend**
   - After Vercel deployment, update `server/server.js` CORS origin with your Vercel URL
   - Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL

## Backend (Render)

1. **Push to GitHub** (if not already done)

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Configure:
     - Name: `tailoring-web-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Root Directory: `server`

3. **Set Environment Variables in Render**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render default)
   - `JWT_SECRET` = `your-very-long-random-secret`
   - `MONGO_URI` = `mongodb+srv://username:password@cluster.mongodb.net/tailoring_web`
   - `STRIPE_SECRET_KEY` = `sk_live_your_stripe_secret_key`
   - `FRONTEND_BASE_URL` = `https://your-app.vercel.app`

4. **Update Frontend Environment**
   - In Vercel dashboard, update `VITE_API_BASE_URL` with your Render backend URL
   - Format: `https://your-backend.onrender.com/api`

## Database Setup

1. **MongoDB Atlas**
   - Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for Render)
   - Get connection string and use in `MONGO_URI`

## Stripe Setup

1. **Get Live Keys**
   - Go to [stripe.com/dashboard](https://stripe.com/dashboard)
   - Switch to live mode
   - Get secret key for `STRIPE_SECRET_KEY`
   - Update webhook endpoints if needed

## Testing

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-backend.onrender.com/api/products`
3. **Test Full Flow**: Login, add to cart, checkout with Stripe test card

## Troubleshooting

- **CORS errors**: Update CORS origins in `server/server.js`
- **Build failures**: Check environment variables are set correctly
- **Database connection**: Verify MongoDB Atlas IP whitelist includes Render IPs
- **Stripe errors**: Ensure live keys are used in production
