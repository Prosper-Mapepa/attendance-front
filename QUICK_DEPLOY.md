# ⚡ Quick Deploy Guide - AttendIQ

## 🎯 Fastest Way to Deploy (15 minutes)

### Step 1: Prepare Your Code
```bash
# Make sure you're in the project directory
cd /Users/prospermapepa/Desktop/attendance-sheet

# Run the deployment script
./deploy.sh
```

### Step 2: Deploy Backend to Railway (5 minutes)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your AttendIQ repository**
5. **Set Root Directory to `backend`**
6. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL`
7. **Add Environment Variables**:
   ```
   DATABASE_URL=postgresql://... (from step 6)
   JWT_SECRET=your-super-secret-jwt-key-12345
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
8. **Copy your Railway backend URL** (e.g., `https://attendiq-backend-production.up.railway.app`)

### Step 3: Deploy Frontend to Vercel (5 minutes)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your AttendIQ repository**
5. **Set Framework Preset to `Next.js`**
6. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC141S8poZzSU3BaEjFP_Qlt1aimhMg7aU
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
7. **Click "Deploy"**
8. **Copy your Vercel frontend URL** (e.g., `https://attendiq.vercel.app`)

### Step 4: Update Backend CORS (2 minutes)

1. **Go back to Railway**
2. **Update the `CORS_ORIGIN` environment variable**:
   ```
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
3. **Redeploy** (Railway will auto-redeploy)

### Step 5: Test Your Deployment (3 minutes)

1. **Visit your frontend URL**
2. **Try logging in/registering**
3. **Check if Google Maps loads**
4. **Test creating a class**

## 🎉 You're Live!

Your AttendIQ application is now deployed and accessible worldwide!

### URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **API Docs**: `https://your-backend.railway.app/api`

## 📱 Mobile App Update

Update your mobile app to use the production backend:

1. **Edit `attendance-mobile/app.json`**:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-backend.railway.app"
       }
     }
   }
   ```

2. **Build and test**:
   ```bash
   cd attendance-mobile
   npx expo start
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure `CORS_ORIGIN` in Railway matches your Vercel URL exactly
2. **Database Error**: Check if `DATABASE_URL` is set correctly in Railway
3. **Google Maps Error**: Verify your API key is correct and has proper restrictions
4. **Build Error**: Check the build logs in Vercel/Railway

### Quick Fixes:

- **Backend not starting**: Check Railway logs, ensure all env vars are set
- **Frontend not loading**: Check Vercel build logs, ensure env vars are set
- **Database connection**: Verify DATABASE_URL format in Railway

## 💰 Cost

- **Vercel**: Free for personal projects
- **Railway**: $5/month after free tier
- **Total**: ~$5/month

## 🆘 Need Help?

1. Check the full `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Check build logs in Vercel/Railway dashboards
3. Verify all environment variables are set correctly
4. Test API endpoints with Postman

---

**🎯 Goal**: Get your app live in 15 minutes!
**✅ Success**: Your app is accessible at your Vercel URL
