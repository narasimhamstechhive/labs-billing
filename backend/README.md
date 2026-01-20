# Labs Billing Backend

## Vercel Deployment

This backend is configured for Vercel serverless deployment.

### Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (minimum 32 characters)
- `NODE_ENV` - Set to "production"
- `VERCEL` - Set to "1"
- `FRONTEND_URL` - Your frontend Vercel URL (for CORS)

### Deployment...

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel` (first time) or `vercel --prod` (production)
4. Set environment variables in Vercel dashboard
5. Redeploy after setting environment variables

### File Structure

- `api/index.js` - Vercel serverless function entry point
- `src/app.js` - Express app (exported for serverless)
- `src/controllers/` - Route controllers
- `src/routes/` - API routes
- `src/models/` - MongoDB models
- `src/templates/` - HTML templates for invoices/reports

### Notes

- File uploads use memory storage on Vercel (converted to base64)
- For production, consider using cloud storage (S3, Cloudinary, Vercel Blob)
- Templates are automatically included in deployment

