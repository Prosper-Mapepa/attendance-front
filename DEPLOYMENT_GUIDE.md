# 🚀 AttendIQ Deployment Guide

This guide covers deploying your full-stack AttendIQ application (Frontend + Backend + Mobile).

## 📋 Prerequisites

- [ ] Google Maps API key configured
- [ ] Database (PostgreSQL) ready
- [ ] Domain name (optional but recommended)

## 🎯 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

**Best for**: Quick deployment, automatic scaling, easy setup

#### Frontend (Vercel)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Set build settings:
     - Framework Preset: `Next.js`
     - Root Directory: `./` (root)
   - Add environment variables:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```

#### Backend (Railway)
1. **Prepare backend**:
   ```bash
   cd backend
   # Add production database URL to .env
   echo "DATABASE_URL=postgresql://user:pass@host:port/db" > .env
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your_jwt_secret
     PORT=3001
     ```

### Option 2: Netlify (Frontend) + Heroku (Backend)

**Best for**: Free tier options, good for small projects

#### Frontend (Netlify)
1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop your `out` folder
   - Or connect GitHub repository
   - Add environment variables in site settings

#### Backend (Heroku)
1. **Prepare for Heroku**:
   ```bash
   cd backend
   # Add Procfile
   echo "web: npm run start:prod" > Procfile
   ```

2. **Deploy to Heroku**:
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   heroku config:set JWT_SECRET=your_secret
   git subtree push --prefix=backend heroku main
   ```

### Option 3: DigitalOcean App Platform

**Best for**: Full-stack deployment, managed infrastructure

1. **Prepare repository**:
   - Ensure both frontend and backend are in the same repo
   - Add `.do/app.yaml` configuration

2. **Deploy**:
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Connect GitHub repository
   - Configure services (web + API)

## 🗄️ Database Setup

### PostgreSQL Options:

1. **Railway PostgreSQL** (Recommended)
   - Free tier: 1GB storage
   - Easy setup with Railway backend

2. **Supabase** (Free tier)
   - 500MB storage
   - Built-in dashboard

3. **PlanetScale** (MySQL alternative)
   - Free tier available
   - Serverless scaling

4. **Neon** (PostgreSQL)
   - Free tier: 3GB storage
   - Serverless PostgreSQL

## 📱 Mobile App Deployment

### Expo Application Services (EAS)

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**:
   ```bash
   cd attendance-mobile
   eas build:configure
   ```

3. **Build for production**:
   ```bash
   # Android
   eas build --platform android --profile production
   
   # iOS
   eas build --platform ios --profile production
   ```

4. **Submit to stores**:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 🔧 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_jwt_secret_key
PORT=3001
NODE_ENV=production
```

### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-url.com"
    }
  }
}
```

## 🚀 Quick Start (Recommended Path)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy Backend to Railway**:
   - Go to railway.app
   - Connect GitHub repo
   - Set root directory to `backend`
   - Add PostgreSQL database
   - Copy the database URL

3. **Deploy Frontend to Vercel**:
   - Go to vercel.com
   - Connect GitHub repo
   - Set environment variables
   - Update `NEXT_PUBLIC_API_URL` to your Railway backend URL

4. **Update Mobile App**:
   - Update `apiUrl` in `attendance-mobile/app.json`
   - Build with EAS

## 🔍 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Google Maps loads
- [ ] Authentication works
- [ ] Mobile app connects to backend
- [ ] SSL certificates are active
- [ ] Environment variables are set

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure backend allows your frontend domain
2. **Database Connection**: Check DATABASE_URL format
3. **Google Maps**: Verify API key restrictions
4. **Build Failures**: Check Node.js version compatibility

### Support:
- Check deployment logs in your hosting platform
- Verify environment variables are set correctly
- Test API endpoints with Postman/curl

## 💰 Cost Estimation

### Free Tier Options:
- **Vercel**: Free for personal projects
- **Railway**: $5/month after free tier
- **Netlify**: Free for personal projects
- **Heroku**: No longer has free tier
- **Supabase**: Free tier available

### Recommended Setup (Low Cost):
- Frontend: Vercel (Free)
- Backend: Railway ($5/month)
- Database: Railway PostgreSQL (Included)
- Mobile: EAS (Free builds, $99/year for app store)

**Total: ~$5/month + $99/year for mobile app store**
