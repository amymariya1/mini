# Frontend Deployment Guide for Render

This guide explains how to deploy the MindMirror frontend application to Render.

## Prerequisites

1. A Render account
2. Your backend API deployed and accessible (e.g., on Vercel)
3. This repository pushed to a Git provider (GitHub, GitLab, etc.)

## Deployment Steps

1. **Push your code to a Git repository** if you haven't already
2. **Import the project to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Static Site"
   - Connect your Git repository
3. **Configure the static site**:
   - Name: `mindmirror-frontend` (or any name you prefer)
   - Region: Choose the region closest to your users
   - Branch: `main`
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
4. **Set environment variables**:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com/api` or your Vercel URL)
5. **Configure routes**:
   - Add a rewrite rule to serve `index.html` for all routes (for React Router)
6. **Deploy**:
   - Click "Create Static Site"
   - Render will automatically build and deploy your application

## Environment Variables

The frontend requires the following environment variables:

```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Build Process

The build process will:
1. Navigate to the client directory
2. Install all dependencies with `npm install`
3. Build the React application with `npm run build`
4. Serve the static files from the `build` directory

## Routing Configuration

Render needs to be configured to handle client-side routing (React Router) by rewriting all routes to `index.html`. This is already configured in the `render.yaml` file.

## Custom Domain (Optional)

To use a custom domain:
1. In your Render dashboard, go to your static site
2. Click "Settings" → "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

## Troubleshooting

### Build Failures
- Ensure all dependencies are correctly listed in `package.json`
- Check that the build command is correct: `cd client && npm install && npm run build`

### Runtime Issues
- Verify that `REACT_APP_API_URL` is correctly set to your backend URL
- Check browser console for CORS errors (ensure your backend allows requests from your frontend domain)

### Routing Issues
- Make sure the rewrite rule is configured to serve `index.html` for all routes