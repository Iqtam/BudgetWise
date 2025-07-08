# Google Sign-In Troubleshooting Guide

This document provides solutions for common Google sign-in issues in the BudgetWise application.

## Recent Fixes Applied

The following improvements have been implemented to resolve Google sign-in issues:

### 1. Firebase Configuration
- Updated Firebase configuration to properly use environment variables
- Added proper Google provider configuration with required scopes
- Set custom parameters for better user experience

### 2. Enhanced Authentication Service
- Added fallback from popup to redirect method when popups are blocked
- Improved error handling with user-friendly messages
- Added proper redirect result handling
- Browser-only execution check to prevent SSR issues

### 3. UI Improvements
- Better loading states and error messages
- Proper handling of redirect notifications
- Enhanced user feedback during authentication process

## Common Issues and Solutions

### Issue 1: "Popup was blocked" Error

**Symptoms:**
- Google sign-in button doesn't work
- Browser shows popup blocked notification
- Error message about popup being blocked

**Solution:**
The app now automatically falls back to redirect method when popups are blocked. If you still have issues:

1. Allow popups for this site in your browser
2. Try clearing browser cache and cookies
3. The app will automatically use redirect method as fallback

### Issue 2: "Google sign-in is not enabled" Error

**Symptoms:**
- Error message: "Google sign-in is not enabled"
- Sign-in fails immediately

**Firebase Console Setup Required:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (budget-wise-c6fd9)
3. Navigate to Authentication > Sign-in method
4. Enable Google sign-in provider
5. Add your domain to authorized domains

### Issue 3: Third-Party Storage Access Blocked

**Symptoms:**
- Sign-in works inconsistently
- Issues on Chrome 115+, Firefox 109+, Safari 16.1+

**Browser Compatibility:**
Modern browsers block third-party storage access. The app now handles this by:
- Using proper authDomain configuration
- Implementing fallback mechanisms
- Supporting both popup and redirect flows

### Issue 4: "Network error" or "Failed to fetch"

**Symptoms:**
- Intermittent connection issues
- Network-related error messages

**Solutions:**
1. Check internet connection
2. Verify Firebase project is active
3. Check if corporate firewall is blocking Google APIs
4. Try using a different network

### Issue 5: Redirect Method Not Working

**Symptoms:**
- Page reloads but user isn't signed in
- Stuck in authentication loop

**Troubleshooting:**
1. Check browser console for errors
2. Ensure redirect handling is working in +layout.svelte
3. Verify authorized redirect URIs in Google Cloud Console

## Google Cloud Console Configuration

### Required OAuth Client Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 client ID for web applications
4. Add authorized domains:
   - `budget-wise-c6fd9.firebaseapp.com`
   - Your custom domain (if any)
   - `localhost` (for development)

### Authorized Redirect URIs

Add these URIs to your OAuth client:
- `https://budget-wise-c6fd9.firebaseapp.com/__/auth/handler`
- `https://yourdomain.com/__/auth/handler` (if using custom domain)
- `http://localhost:5173/__/auth/handler` (for development)

## Environment Variables

Create a `.env` file in the frontend directory with:

```env
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=budget-wise-c6fd9.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=budget-wise-c6fd9
PUBLIC_FIREBASE_STORAGE_BUCKET=budget-wise-c6fd9.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Testing the Fix

### Development Testing
1. Start the development server: `npm run dev`
2. Navigate to the sign-in page
3. Click "Continue with Google"
4. Should work with either popup or redirect method

### Browser Compatibility Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Additional Debugging

### Enable Verbose Logging
The app now includes detailed console logging for Google sign-in attempts. Check browser developer tools for:
- "Attempting Google sign-in..."
- Popup/redirect fallback messages
- Detailed error information

### Common Error Codes
- `auth/popup-blocked`: Popup was blocked, using redirect fallback
- `auth/popup-closed-by-user`: User closed popup window
- `auth/network-request-failed`: Network connectivity issue
- `auth/operation-not-allowed`: Google sign-in not enabled in Firebase
- `auth/too-many-requests`: Rate limited, wait before retrying

## Support

If Google sign-in still doesn't work after trying these solutions:

1. Check browser console for specific error messages
2. Verify all Firebase and Google Cloud configurations
3. Test with different browsers and networks
4. Clear all browser data for the site
5. Check if your organization blocks Google OAuth

## Security Considerations

The implementation now includes:
- Proper scope requests (email, profile)
- Account selection prompt for better UX
- Secure token handling
- CSRF protection through Firebase SDK

This comprehensive approach should resolve most Google sign-in issues while maintaining security best practices. 