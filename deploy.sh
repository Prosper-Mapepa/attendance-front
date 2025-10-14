#!/bin/bash

# AttendIQ Deployment Script
echo "🚀 Starting AttendIQ Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - AttendIQ ready for deployment"
fi

# Check if we're connected to a remote
if ! git remote | grep -q origin; then
    echo "⚠️  No remote repository found!"
    echo "Please create a GitHub repository and add it as origin:"
    echo "git remote add origin https://github.com/yourusername/attendiq.git"
    echo "git push -u origin main"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build

# Check if backend build was successful
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed!"
    exit 1
fi

cd ..

# Commit and push changes
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: Production build ready"
git push origin main

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com and deploy your frontend"
echo "2. Go to https://railway.app and deploy your backend"
echo "3. Set up your database and environment variables"
echo "4. Update your mobile app configuration"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
