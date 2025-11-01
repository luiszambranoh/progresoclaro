# Fitness App Development Prompt

## Overview
Build a comprehensive fitness tracking application using the existing academic app architecture as a blueprint. The app should track workouts, exercises, personal records, and body measurements while maintaining the same high-quality code patterns, error handling, and build stability.

## Technical Requirements

### Tech Stack (Identical to Existing App)
- **Framework**: Next.js 16.0.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Google OAuth via Firebase Auth
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm
- **Build Tool**: Turbopack

### Project Structure (Mirror Existing)
```
src/
├── app/
│   ├── layout.tsx              # Root layout with ModalProvider
│   ├── page.tsx                # Fitness Dashboard
│   ├── login/page.tsx          # Google OAuth login
│   ├── register/page.tsx       # User fitness profile setup
│   ├── workouts/page.tsx       # Workout management (adapted from subjects)
│   │   └── components/
│   │       ├── WorkoutForm.tsx
│   │       ├── WorkoutSessionForm.tsx
│   │       └── ExerciseSelector.tsx
│   ├── exercises/page.tsx      # Exercise library (adapted from professors)
│   ├── progress/page.tsx       # Progress tracking (adapted from calendar)
│   └── settings/page.tsx       # App settings
├── components/
│   ├── layout/                 # Reuse existing layout components
│   ├── ui/                     # Reuse existing UI components
│   └── forms/                  # New fitness-specific forms
├── contexts/                   # Reuse ModalContext
├── lib/
│   ├── firebase.ts            # Same Firebase config
│   ├── auth.ts                # Same auth helpers
│   ├── schemas.ts             # New fitness validation schemas
│   ├── collections/           # New fitness collections
│   │   ├── workouts.ts        # Adapted from subjects.ts
│   │   ├── exercises.ts       # Adapted from professors.ts
│   │   ├── workoutSessions.ts # Adapted from homework.ts
│   │   ├── measurements.ts    # New collection
│   │   └── personalRecords.ts # New collection
│   └── utils.ts               # Fitness-specific utilities
└── hooks/                      # Custom hooks for fitness data
```

## Feature Requirements

### 1. Authentication & User Management
- **Google OAuth**: Identical to existing app
- **User Registration**: Collect fitness goals, activity level, starting measurements
- **Profile Management**: Update goals, preferences, measurement units

### 2. Exercise Library Management
- **Exercise CRUD**: Create, edit, delete custom exercises
- **Categories**: Strength, cardio, flexibility, mobility
- **Muscle Groups**: Target muscle group tracking
- **Equipment**: Required equipment tagging
- **Media**: Exercise images and instructional videos
- **Default Exercises**: Pre-populated exercise database

### 3. Workout Management
- **Workout Builder**: Create custom workouts with multiple exercises
- **Exercise Configuration**: Sets, reps, weight, rest time per exercise
- **Workout Templates**: Save and reuse workout plans
- **Difficulty Levels**: Beginner, intermediate, advanced
- **Estimated Duration**: Automatic calculation based on exercises

### 4. Workout Sessions
- **Live Tracking**: Real-time workout session recording
- **Set Completion**: Track actual reps, weight, rest time
- **Timer Integration**: Built-in rest timers
- **Notes**: Per-exercise and per-session notes
- **Completion Status**: Mark sessions as complete/incomplete

### 5. Personal Records (PRs)
- **Automatic Tracking**: Detect and record new PRs
- **PR Types**: Max weight, max reps, best time, total volume
- **PR History**: Timeline of PR achievements
- **Exercise-specific**: PRs per exercise type

### 6. Body Measurements
- **Measurement Types**: Weight, body fat %, circumferences (waist, chest, arms, etc.)
- **Units**: Support for metric and imperial
- **Progress Charts**: Visual progress over time
- **Measurement History**: Complete measurement log
- **Goal Tracking**: Progress toward target measurements

### 7. Progress Dashboard
- **Today's Workout**: Quick access to planned sessions
- **Recent Sessions**: Last completed workouts
- **PR Celebrations**: Recent personal record achievements
- **Measurement Trends**: Charts showing progress
- **Weekly/Monthly Stats**: Workout frequency, volume, progress

### 8. Calendar & History
- **Workout Calendar**: Visual calendar of completed/planned sessions
- **Session Details**: Detailed view of past workouts
- **Progress Timeline**: Long-term progress visualization
- **Streak Tracking**: Workout consistency tracking

## Implementation Guidelines

### Code Patterns (Follow Existing App)

#### Collection Classes
```typescript
// Follow the exact pattern from existing collections
export class WorkoutsCollection {
  private static collectionName = "workouts";

  static async getWorkouts(userId: string): Promise<Workout[]> {
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    // Implementation following existing pattern
  }

  static async createWorkout(workoutData: Omit<Workout, "id" | "createdAt" | "updatedAt">): Promise<string> {
    // Implementation following existing pattern
  }
  // ... other CRUD methods
}
```

#### Form Components
```typescript
// Follow SubjectForm.tsx pattern exactly
export default function WorkoutForm({ onSuccess, onCancel, editingWorkout }: WorkoutFormProps) {
  // useEffect for data loading (like SubjectForm)
  // React Hook Form with Zod validation
  // Same error handling patterns
  // Same modal callback patterns
}
```

#### Page Components
```typescript
// Follow subjects/page.tsx pattern exactly
export default function WorkoutsPage() {
  // Same state management patterns
  // Same modal handling
  // Same FAB integration
  // Same CRUD operations
}
```

#### Firestore Rules
```javascript
// Follow existing firestore.rules pattern
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data isolation rules (identical pattern)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Fitness collections with same security pattern
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    // ... other collections
  }
}
```

### Error Handling (Critical)
- **Hydration Errors**: Use `suppressHydrationWarning` on body element in layout.tsx
- **Auth Errors**: Same redirect patterns as existing app
- **Form Validation**: Use Zod schemas with React Hook Form
- **Firestore Errors**: Same error handling patterns

### Build Stability Requirements
- **TypeScript Strict**: No any types, proper interfaces
- **ESLint**: Follow existing linting rules
- **Build Success**: `pnpm run build` must pass without errors
- **Component Organization**: Forms in `{page}/components/`, reusable in `components/`

### UI/UX Requirements
- **Mobile-First**: Responsive design like existing app
- **Drawer Navigation**: Same hamburger menu pattern
- **Modals**: Same modal system for forms
- **Consistent Styling**: Same Tailwind patterns

### Data Relationships
- **Users**: One-to-many with all fitness data
- **Exercises**: Many-to-many with workouts (via workout exercises)
- **Workouts**: One-to-many with workout sessions
- **Measurements**: User-specific time-series data
- **PRs**: Exercise-specific achievement tracking

### Performance Considerations
- **Image Optimization**: Next.js Image component for exercise photos
- **Data Pagination**: For large workout/measurement histories
- **Real-time Updates**: Firestore listeners for live data
- **Offline Support**: Same offline patterns as existing app

## Development Phases

### Phase 1: Foundation (Mirror Existing App Setup)
1. Set up Firebase project with same configuration
2. Implement Google OAuth authentication
3. Create basic collection classes
4. Set up Firestore security rules
5. Build authentication flow and user registration

### Phase 2: Core Features
1. Exercise library management
2. Workout builder and management
3. Workout session tracking
4. Basic progress dashboard

### Phase 3: Advanced Features
1. Personal records tracking
2. Body measurements system
3. Progress charts and analytics
4. Calendar integration

### Phase 4: Polish & Optimization
1. Performance optimizations
2. Mobile UX enhancements
3. Offline functionality
4. Testing and bug fixes

## Quality Assurance

### Code Quality
- **TypeScript**: Strict typing throughout
- **Error Boundaries**: Proper error handling
- **Code Organization**: Follow existing file structure

### Testing Requirements
- **Build Verification**: `pnpm run build` passes
- **Type Checking**: `pnpm run type-check` passes

### Deployment Readiness
- **Environment Variables**: Proper Firebase configuration
- **Build Optimization**: Optimized bundle size
- **SEO**: Proper meta tags and titles
- **PWA Ready**: Service worker and manifest

This prompt provides everything needed to build a comprehensive fitness app that mirrors the existing academic app's architecture, patterns, and quality standards. Focus on maintaining the same high-quality code patterns while adapting the domain-specific logic for fitness tracking.