# AttendIQ Logo Setup Guide

## Logo Design

The AttendIQ logo features a professional, modern design that combines:
- **Checkmark**: Represents attendance verification and completion
- **Circular Badge**: Professional, clean look
- **Smart Dots**: Three dots representing intelligence and IQ
- **Colors**: CMU Maroon (#8B1538) and CMU Gold (#FDB913)

## Logo Variants

### 1. React Component (`src/app/components/Logo.tsx`)
Use this for web app:
```tsx
import Logo from './components/Logo';

// Full logo with text
<Logo size={48} variant="color" showText={true} />

// Icon only
<Logo size={32} variant="dark" showText={false} />

// Light variant (for dark backgrounds)
<Logo size={48} variant="light" showText={true} />
```

### 2. SVG Files
- `public/logo.svg` - Main logo file for web
- `attendance-mobile/assets/logo.svg` - Logo for mobile app

## Converting SVG to PNG for Mobile App

You need to generate PNG files from the SVG for the mobile app:

### Required Files:
1. **icon.png** (1024x1024) - App icon
2. **adaptive-icon.png** (1024x1024) - Android adaptive icon
3. **splash-icon.png** (2048x2048) - Splash screen
4. **favicon.png** (48x48) - Web favicon

### Method 1: Using Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `attendance-mobile/assets/logo.svg`
3. Set dimensions:
   - icon.png: 1024x1024
   - adaptive-icon.png: 1024x1024
   - splash-icon.png: 2048x2048
   - favicon.png: 48x48
4. Download and place in `attendance-mobile/assets/`

### Method 2: Using ImageMagick (Command Line)
```bash
cd attendance-mobile/assets

# Install ImageMagick if needed
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generate icons
magick logo.svg -resize 1024x1024 icon.png
magick logo.svg -resize 1024x1024 adaptive-icon.png
magick logo.svg -resize 2048x2048 splash-icon.png
magick logo.svg -resize 48x48 favicon.png
```

### Method 3: Using Node.js Script
```bash
# Install sharp
npm install sharp

# Create convert-logo.js
node convert-logo.js
```

## Logo Usage Guidelines

### Colors
- **Primary**: CMU Maroon (#8B1538)
- **Accent**: CMU Gold (#FDB913)
- **Background**: White (#FFFFFF)

### Variants
1. **Color Variant**: Use on light backgrounds (default)
2. **Light Variant**: Use on dark/maroon backgrounds
3. **Dark Variant**: Use when you need a dark logo

### Sizes
- **Small**: 24-32px (navigation, buttons)
- **Medium**: 48-64px (headers, cards)
- **Large**: 128px+ (splash screens, marketing)

### Clear Space
Maintain clear space around the logo equal to 1/4 of the logo height.

## Quick Start

1. **Web App**: The Logo component is already created and ready to use
2. **Mobile App**: Generate PNG files from the SVG using one of the methods above
3. **Update imports**: Replace AnimatedEyes with Logo where appropriate

## Examples

### Header Logo
```tsx
<Logo size={48} variant="light" showText={true} />
```

### Favicon/Icon Only
```tsx
<Logo size={32} variant="color" showText={false} />
```

### Login Screen
```tsx
<Logo size={64} variant="color" showText={true} />
```

## Need Help?

If you need different sizes or variations, you can modify the Logo.tsx component or generate new PNG files from the SVG source.

