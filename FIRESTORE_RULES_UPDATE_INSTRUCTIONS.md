# 🔥 CRITICAL: Update Firestore Rules

## ⚠️ Your flashcards won't work until you complete these steps!

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Click on your project: **lifedash-f00fc**

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click **"Firestore Database"**
2. Click the **"Rules"** tab at the top
3. You should see a text editor with your current rules

### Step 3: Replace the Rules
**DELETE ALL** the existing rules and paste this EXACT text:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if the user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User documents - users can read/write their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      // User preferences subcollection
      match /preferences/{docId} {
        allow read, write: if isOwner(userId);
      }

      // Flashcard folders subcollection - users can read/write their own folders
      match /flashcard_folders/{folderId} {
        allow read, write: if isOwner(userId);
      }

      // Flashcard decks subcollection - users can read/write their own decks
      match /flashcard_decks/{deckId} {
        allow read, write: if isOwner(userId);
      }

      // Flashcards subcollection - users can read/write their own flashcards
      match /flashcards/{cardId} {
        allow read, write: if isOwner(userId);
      }

      // Journals subcollection
      match /journals/{journalId} {
        allow read, write: if isOwner(userId);
      }

      // Expense categories subcollection
      match /expense_categories/{categoryId} {
        allow read, write: if isOwner(userId);
      }

      // Expenses subcollection
      match /expenses/{expenseId} {
        allow read, write: if isOwner(userId);
      }
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish the Rules
1. Click the blue **"Publish"** button in the top right
2. Wait for the confirmation message
3. Refresh your LifeDash app in the browser

### Step 5: Test
1. Go to http://localhost:3002/flashcards
2. Click "New Folder" or "New Deck"
3. Fill in the form and save
4. It should work now! ✅

---

## What was the problem?

Your data is stored in subcollections like:
- `/users/{userId}/flashcard_folders/`
- `/users/{userId}/flashcard_decks/`

But your Firestore rules were likely configured for root-level collections. The new rules allow users to access their own subcollections under their user document.

---

## Still having issues?

If you still get permission errors after updating the rules:

1. **Check you're logged in**: Make sure you're authenticated in the app
2. **Clear browser cache**: Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Check the console**: Open browser DevTools (F12) and look for any error messages
4. **Verify the user ID**: Check that `user.uid` is not null when creating folders/decks

Let me know if you need help!
