#!/bin/bash

# Setup script for local development environment variables
echo "Setting up environment variables for local testing..."

# Create .env.local file
cat > .env.local << EOF
# Local development environment variables
NEXT_PUBLIC_API_URL=https://attendance-iq-api.railway.internal
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EOF

echo "✅ Created .env.local file with Railway API URL"
echo "📝 Please update NEXT_PUBLIC_GOOGLE_MAPS_API_KEY with your actual Google Maps API key"
echo ""
echo "🚀 You can now run: npm run dev"
echo "🌐 Your app will connect to: https://attendance-iq-api.railway.internal"
