# Google Maps API Troubleshooting Guide

## Current Issue: "Failed to load Google Maps"

Your API key is configured correctly, but Google Maps is failing to load. Here's how to fix it:

## Step 1: Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com/) and enable these APIs:

### Required APIs:
1. **Maps JavaScript API** ⭐ (Most Important)
2. **Geocoding API** (for address lookup)
3. **Places API** (optional, for enhanced features)

### How to Enable:
1. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click "Enable APIs and Services"
3. Search for each API and click "Enable"

## Step 2: Check API Key Restrictions

### Current API Key: `AIzaSyA3HRlQoGTBlLdEMPDfVpftxRPeSwppKTk`

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Check "Application restrictions":
   - **None** (for testing)
   - **HTTP referrers** (for production)
4. Check "API restrictions":
   - **Don't restrict key** (for testing)
   - **Restrict key** and select the APIs above

## Step 3: Set Up Billing

Google Maps requires billing to be enabled:

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Link a payment method
3. Don't worry - you get $200 free credit monthly

## Step 4: Test Your Setup

### Quick Test:
1. Open browser console (F12)
2. Go to your app and try to open the map
3. Look for error messages in console

### Common Errors:
- `Google Maps JavaScript API error: RefererNotAllowedMapError` → Fix API key restrictions
- `Google Maps JavaScript API error: RequestDeniedMapError` → Enable Maps JavaScript API
- `Google Maps JavaScript API error: InvalidKeyMapError` → Check API key

## Step 5: Alternative Solutions

### Option 1: Use CMU Building Picker
- Click "CMU Building" button instead
- Select from predefined buildings
- No Google Maps required

### Option 2: Manual Coordinate Entry
- Use the manual input fields
- Enter coordinates directly
- Works without Google Maps

### Option 3: Fix Google Maps (Recommended)
- Follow steps 1-4 above
- Get the full Google Maps experience

## Step 6: Verify Setup

Once configured, you should see:
- ✅ Google Maps loads successfully
- ✅ Satellite imagery displays
- ✅ Interactive map with draggable marker
- ✅ Geocoding works for building selection

## Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your API key has the correct permissions
3. Ensure billing is set up in Google Cloud Console
4. Try the CMU Building picker as a fallback

## Cost Information

- **Free tier**: $200/month credit
- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Your usage**: Likely under $5/month
