# Loading Animation System

A comprehensive loading animation system for the Serenote Tracker application that provides smooth, engaging loading experiences during rendering and compilation.

## Features

### 🎯 Core Components

#### 1. Loading Wrapper (`components/loading/loading-wrapper.tsx`)
- Suspense-based wrapper component
- Error boundary integration
- Configurable fallback components
- Global and local loading support

#### 2. Global Loading (`components/loading/global-loading.tsx`)
Multiple loading animation types:
- **Spinner**: Classic rotating spinner
- **Pulse**: Bouncing dots animation
- **Dots**: Fade in/out dots
- **Wave**: Rising bar animation
- **Compile**: Progress bar with compilation messages

#### 3. Loading Error Boundary (`components/loading/loading-error-boundary.tsx`)
- Graceful error handling during loading
- User-friendly error messages
- Retry functionality
- Error logging for debugging

#### 4. Specialized Skeletons (`components/loading/skeletons.tsx`)
Context-aware loading placeholders:
- **MoodEntrySkeleton**: Form input placeholders
- **CalendarSkeleton**: Calendar grid placeholders
- **MoodHistorySkeleton**: Entry list placeholders
- **ChartSkeleton**: Graph placeholder
- **DashboardSkeleton**: Complete dashboard layout

### 🎨 Animation Types

#### CSS Animations
- **Fade In**: Smooth opacity transition
- **Slide Up**: Entrance animation with Y translation
- **Gentle Bounce**: Subtle vertical bounce
- **Wave Bars**: Rising/falling bar animation
- **Pulse Dots**: Breathing dot effect
- **Compile Progress**: Build feedback animation
- **Skeleton Shimmer**: Loading skeleton effect
- **Page Enter**: Route transition animation

#### Mood-Specific Animations
- Bad mood: Fade animation
- Okay mood: Shadow pulse
- Good mood: Bounce effect
- Great mood: Sparkle effects

### 🚀 Implementation Guide

#### Basic Usage
```tsx
import { LoadingWrapper } from "@/components/loading/loading-wrapper"
import { GlobalLoading } from "@/components/loading/global-loading"

// Wrap async components
<LoadingWrapper>
  <AsyncComponent />
</LoadingWrapper>

// Custom loading state
<LoadingWrapper fallback={<CustomSkeleton />}>
  <DataComponent />
</LoadingWrapper>

// Global loading
<GlobalLoading type="compile" message="Processing..." />
```

#### Route-Level Loading
```tsx
// app/loading.tsx (automatically used by Next.js)
export default function Loading() {
  return <GlobalLoading type="wave" message="Loading page..." />
}
```

#### Component-Level Loading
```tsx
// Enhanced form submission
<Button disabled={isLoading}>
  {isLoading ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Saving...
    </div>
  ) : (
    "Save Entry"
  )}
</Button>
```

### 📁 File Structure

```
components/loading/
├── loading-wrapper.tsx        # Main wrapper component
├── global-loading.tsx         # Loading indicator component
├── loading-error-boundary.tsx # Error boundary
└── skeletons.tsx              # Skeleton components

app/
└── loading.tsx                # Route loading state

app/globals.css                # Animation definitions
```

### 🎛️ Configuration Options

#### Global Loading Types
- `type`: "spinner" | "pulse" | "dots" | "wave" | "compile"
- `size`: "sm" | "md" | "lg"
- `message`: Custom loading message
- `fullscreen`: Overlay mode

#### Loading Wrapper Props
- `children`: React components to wrap
- `fallback`: Custom loading component
- `showGlobalLoader`: Enable/disable global loader

### 🎯 Best Practices

1. **Use Context-Appropriate Loading Types**
   - Forms: Spinner with text
   - Data fetching: Skeletons
   - Compilation: Progress bar with messages
   - Navigation: Wave or pulse animations

2. **Progressive Loading**
   - Show skeletons immediately
   - Replace with actual content as it loads
   - Maintain layout stability

3. **Error Handling**
   - Always wrap async operations
   - Provide retry mechanisms
   - Log errors for debugging

4. **Performance Considerations**
   - Use CSS animations over JavaScript
   - Implement skeleton states for perceived performance
   - Optimize animation durations

### 🎨 Customization

#### Adding New Animation Types
```css
/* In globals.css */
@keyframes custom-animation {
  0% { /* start state */ }
  100% { /* end state */ }
}

.animate-custom {
  animation: custom-animation 1s ease-in-out infinite;
}
```

#### Creating New Skeleton Components
```tsx
export function CustomSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

### 📱 Responsive Design

All loading animations are fully responsive and work seamlessly across:
- Desktop browsers
- Tablet devices  
- Mobile phones
- Various screen sizes

### 🎭 Theme Integration

Loading animations automatically adapt to:
- Light/Dark theme modes
- Mood-based themes
- High contrast preferences
- Reduced motion settings

This system provides a professional, polished loading experience that keeps users engaged during compilation and rendering operations.