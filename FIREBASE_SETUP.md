# Firebase Setup Guide

## Issue: 400 Bad Request Error

The error you're encountering is due to missing Firebase configuration. The application is trying to connect to Firebase but doesn't have the proper API keys and configuration.

## Solution

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or select an existing project
   - Follow the setup wizard

2. **Enable Authentication:**
   - In Firebase Console, go to "Authentication" → "Sign-in method"
   - Enable "Email/Password" authentication
   - Make sure it's enabled for your project

3. **Create Environment File:**
   - Create a `.env` file in your project root (same level as package.json)
   - Add the following variables with your Firebase project details:

```env
VITE_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Get Firebase Configuration:**
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app (</>) if you haven't created one
   - Copy the config object values to your `.env` file

5. **Enable Firestore:**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location for your database

6. **Update Firestore Rules (Optional):**
   - Go to "Firestore Database" → "Rules"
   - Update rules to allow read/write for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

## Quick Test

After setting up Firebase:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try registering a staff member with:
   - Email: test@example.com
   - Password: password123
   - Staff ID: STAFF001
   - Hospital: Select any hospital

## Valid Staff IDs

The application currently accepts these staff IDs:
- STAFF001
- STAFF002
- STAFF003

## Troubleshooting

- **400 Bad Request**: Usually means Firebase config is missing or incorrect
- **Network Error**: Check your internet connection and Firebase project status
- **Permission Denied**: Check Firestore security rules
- **Email Already in Use**: Try with a different email address

## Security Note

For production, make sure to:
- Use proper Firestore security rules
- Enable proper authentication methods
- Use environment variables securely
- Don't commit `.env` files to version control
