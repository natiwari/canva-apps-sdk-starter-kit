# Deployment Guide for Canva App

## Deploy to Vercel

### 1. Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/canva-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings from `vercel.json`
5. Click "Deploy"

### 3. Environment Variables
After deployment, go to your Vercel project settings and add:
- `CANVA_BACKEND_HOST`: Your Vercel URL (e.g., `https://your-app-name.vercel.app`)

### 4. Update Your App
Replace any localhost references with your Vercel URL.

## Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Troubleshooting
- If you get build errors, check that all dependencies are in `package.json`
- Make sure `CANVA_BACKEND_HOST` is set in Vercel environment variables
- The app will be available at your Vercel URL after successful deployment 