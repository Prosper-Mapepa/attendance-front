# Google Maps Integration Setup

## Getting Started

To use Google Maps for precise location selection, you need to set up a Google Maps API key.

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Places API** (optional, for enhanced features)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

## Step 2: Configure Environment Variable

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 3: Features

With Google Maps integration, you get:

- **Satellite imagery** for precise building identification
- **Street view integration** 
- **Draggable markers** for fine-tuning
- **High-resolution imagery** for classroom-level precision
- **Familiar Google Maps interface**

## Step 4: Fallback

If no API key is configured, the system will show a fallback message and you can use the CMU building picker instead.

## Security Notes

- Never commit your API key to version control
- Use environment variables for API keys
- Restrict your API key to specific domains/IPs in Google Cloud Console
- Monitor your API usage to avoid unexpected charges
