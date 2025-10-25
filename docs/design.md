# LifeDash Design Document

## Overview

LifeDash will be built as a modern, responsive web application using Next.js 14 with the App Router, providing a seamless single-page application experience. The architecture follows a modular approach with clear separation between frontend components, backend API routes, and data persistence layers.

**Recommended Tech Stack (100% Free for Students):**

### Frontend
- **Next.js 14** with App Router - Modern React framework with built-in optimization
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **TypeScript** - Type safety and better developer experience
- **React Hook Form** - Efficient form handling with validation
- **Recharts** - Charts and data visualization
- **React Markdown** - Markdown rendering for journal entries and notes
- **Lucide React** - Beautiful, customizable icons

### Backend & Database
- **Firebase** (Recommended for beginners):
  - Firestore - NoSQL database with real-time capabilities
  - Firebase Auth - Complete authentication solution
  - Firebase Hosting - Free hosting with SSL
  - Firebase Functions - Serverless backend logic (if needed)
- **Alternative**: Supabase (PostgreSQL-based, also free tier)

### Deployment
- **Vercel** - Free hosting for Next.js apps with automatic deployments
- **Firebase Hosting** - Alternative free hosting option

### Additional Libraries
- **date-fns** - Date manipulation and formatting
- **react-hot-toast** - Toast notifications
- **framer-motion** - Smooth animations and transitions
- **react-dnd** - Drag and drop functionality for dashboard customization

## Architecture

### Application Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Main dashboard
│   ├── journal/           # Journal module
│   ├── expenses/          # Expense tracking
│   ├── learning/          # Flashcards and notes
│   ├── tasks/             # Task management
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and configurations
│   ├── firebase.ts       # Firebase configuration
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database operations
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Global styles and Tailwind config
```

### Data Flow Architecture
1. **Client-Side State Management**: React hooks and Context API for local state
2. **Server State**: Firebase real-time listeners for live data updates
3. **Authentication**: Firebase Auth with Next.js middleware for route protection
4. **API Layer**: Next.js API routes for complex operations and data processing

## Components and Interfaces

### Core Components

#### 1. Authentication System
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  dashboardLayout: DashboardWidget[];
  currency: string;
  timezone: string;
}
```

#### 2. Journal Module
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string; // Markdown format
  journalId: string; // Reference to parent journal
  tags: string[];
  mood?: number; // 1-5 scale
  createdAt: Date;
  updatedAt: Date;
}

interface Journal {
  id: string;
  userId: string;
  name: string; // e.g., "Personal Journal", "Dev Diary", "Learning Log"
  description?: string;
  color: string; // For visual organization
  icon?: string; // Icon identifier
  createdAt: Date;
  entryCount: number; // Cached count for performance
}
```

#### 3. Expense Tracking
```typescript
interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  type: 'expense' | 'income';
  recurring?: RecurringPattern;
  createdAt: Date;
}

interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  budget?: number;
}
```

#### 4. Learning System
```typescript
interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: number; // Spaced repetition factor
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  deckId: string; // Required reference to parent deck
}

interface FlashcardDeck {
  id: string;
  userId: string;
  name: string; // e.g., "JavaScript Concepts", "Spanish Vocabulary"
  description?: string;
  color: string;
  icon?: string;
  parentId?: string; // For nested folder structure
  isFolder: boolean; // True for folders, false for actual decks
  cardCount: number; // Cached count for performance
  createdAt: Date;
  lastStudied?: Date;
}

interface LearningNote {
  id: string;
  userId: string;
  title: string;
  content: string; // Markdown format
  folderId?: string; // Reference to note folder
  tags: string[];
  linkedFlashcards: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NoteFolder {
  id: string;
  userId: string;
  name: string;
  parentId?: string; // For nested folder structure
  color: string;
  createdAt: Date;
}
```

#### 5. Task Management
```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category: string;
  recurring?: RecurringPattern;
  createdAt: Date;
  completedAt?: Date;
}
```

### UI Component Architecture

#### Layout Components
- **AppLayout**: Main application wrapper with navigation
- **DashboardLayout**: Grid-based dashboard with draggable widgets
- **ModuleLayout**: Consistent layout for each feature module

#### Feature Components
- **JournalEditor**: Rich text editor with markdown preview
- **ExpenseForm**: Form for adding/editing expenses with category selection
- **FlashcardStudy**: Spaced repetition study interface
- **TaskList**: Interactive task list with filtering and sorting
- **AnalyticsCharts**: Reusable chart components for different data types

## Data Models

### Database Schema (Firestore Collections)

```
users/{userId}
├── profile: UserProfile
├── preferences: UserPreferences
└── subcollections:
    ├── journals/{journalId}: Journal
    ├── journalEntries/{entryId}: JournalEntry
    ├── expenses/{expenseId}: Expense
    ├── flashcardDecks/{deckId}: FlashcardDeck
    ├── flashcards/{cardId}: Flashcard
    ├── noteFolders/{folderId}: NoteFolder
    ├── notes/{noteId}: LearningNote
    ├── tasks/{taskId}: Task
    └── categories/{categoryId}: Category
```

### Data Relationships
- **User → All Data**: One-to-many relationship with user ownership
- **Journals → Journal Entries**: One-to-many relationship for organization
- **FlashcardDecks → Flashcards**: One-to-many relationship with hierarchical folder support
- **NoteFolders → Notes**: One-to-many relationship with nested folder structure
- **Notes → Flashcards**: Many-to-many relationship for linked content
- **Tasks → Categories**: Many-to-one relationship for organization
- **Expenses → Categories**: Many-to-one relationship for budgeting

## Error Handling

### Client-Side Error Handling
1. **Form Validation**: Real-time validation with React Hook Form
2. **Network Errors**: Retry mechanisms and offline indicators
3. **Authentication Errors**: Clear messaging and redirect flows
4. **Data Sync Errors**: Conflict resolution and manual sync options

### Error Boundaries
- **Global Error Boundary**: Catches unhandled React errors
- **Module Error Boundaries**: Isolated error handling per feature
- **Fallback UI**: Graceful degradation with retry options

### Firebase Error Handling
```typescript
interface AppError {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
}

// Error handling utility
const handleFirebaseError = (error: FirebaseError): AppError => {
  // Map Firebase errors to user-friendly messages
  // Log errors for debugging
  // Return structured error object
}
```

## Testing Strategy

### Testing Pyramid
1. **Unit Tests**: Component logic and utility functions
2. **Integration Tests**: API routes and database operations
3. **E2E Tests**: Critical user flows (auth, data entry, sync)

### Testing Tools
- **Jest + React Testing Library**: Component and unit testing
- **Cypress**: End-to-end testing
- **Firebase Emulator**: Local testing environment

### Test Coverage Goals
- **Components**: 80% coverage for UI components
- **Utilities**: 90% coverage for business logic
- **API Routes**: 85% coverage for backend functionality

### Testing Approach
1. **Test-Driven Development**: Write tests before implementation
2. **Mock External Services**: Use Firebase emulator for consistent testing
3. **Accessibility Testing**: Ensure WCAG compliance
4. **Performance Testing**: Monitor bundle size and load times

## Security Considerations

### Authentication Security
- Firebase Auth handles secure token management
- Route protection with Next.js middleware
- Automatic token refresh and session management

### Data Security
- Firestore security rules for user data isolation
- Input validation and sanitization
- XSS protection through React's built-in escaping

### Privacy
- No third-party analytics or tracking
- Local data caching with encryption
- User data export and deletion capabilities

## Performance Optimization

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for non-critical components
- Service worker for offline functionality

### Database Optimization
- Firestore compound indexes for complex queries
- Pagination for large data sets
- Real-time listeners only where necessary
- Data denormalization for read performance

## Deployment Strategy

### Development Workflow
1. **Local Development**: Firebase emulator suite
2. **Staging**: Vercel preview deployments
3. **Production**: Vercel production with Firebase backend

### CI/CD Pipeline
- GitHub Actions for automated testing
- Automatic deployment on main branch push
- Environment-specific configuration management

This design provides a solid foundation for building LifeDash as a comprehensive personal dashboard while maintaining simplicity and cost-effectiveness for a student project.