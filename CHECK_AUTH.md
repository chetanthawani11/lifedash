# Quick Auth Check

Open your browser console (F12) and run this to check if you're authenticated:

```javascript
// Check if user is authenticated
firebase.auth().currentUser
```

You should see an object with:
- uid: "some-user-id"
- email: "your-email@example.com"

If it's `null`, you need to log in first!

# Check Current Firestore Rules

In Firebase Console:
1. Go to Firestore Database > Rules
2. Look for lines that say:
   ```
   match /users/{userId} {
     match /flashcard_folders/{folderId} {
       allow read, write: if isOwner(userId);
     }
   ```

If you DON'T see these lines, the rules haven't been updated yet!
