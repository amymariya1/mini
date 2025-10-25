# Deployment Guide

## Vercel Deployment

This backend is configured for deployment to Vercel as a serverless application.

### Prerequisites

1. A Vercel account
2. MongoDB Atlas database (already configured)
3. Environment variables set in Vercel dashboard

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
3. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: Leave empty (project root)
   - Build Command: `npm install` (Vercel will automatically detect and run this)
   - Output Directory: Leave as default
4. Set environment variables in Vercel dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `ADMIN_TOKEN_SECRET`: Your admin token secret (critical for serverless admin authentication)
   - `EMAIL_USER`: Your email for SMTP
   - `EMAIL_PASS`: Your email password or app password
   - Any other environment variables from your `.env` file
5. Deploy!

### Project Structure for Vercel

- `vercel.json`: Configuration file for Vercel deployment
- `server/src/api/index.js`: Vercel serverless function entry point
- `server/src/index.js`: Main Express application
- `server/src/server.js`: Local development entry point

### Environment Variables Required

```env
MONGO_URI=mongodb+srv://amy:amy@cluster0.ej3dl6m.mongodb.net/mindmirror?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
ADMIN_TOKEN_SECRET=a664ad8e7852f62acc83be90524bb6ac215a8cbe893748a0966981df25996fd5a0c54693943243d35737288c7baf1c69152e8f66c177288040e8e5b98e17ec5b
EMAIL_USER=amymariya4@gmail.com
EMAIL_PASS=your_email_password_or_app_password
PORT=8080
NODE_ENV=production
```

### Local Development

To run the server locally:

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5002` by default.

### Notes

1. File uploads to the `/uploads` directory won't persist on Vercel due to the serverless nature. For production, consider using a service like AWS S3 or Cloudinary for file storage.
2. MongoDB connections are handled with connection caching to work efficiently with Vercel's serverless functions.
3. The application is structured to work with both local development and Vercel deployment without code changes.
4. The `ADMIN_TOKEN_SECRET` environment variable is critical for admin authentication in serverless environments. Without it, admin tokens will use in-memory storage which does not work in serverless environments.