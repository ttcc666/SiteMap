# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```
Runs on http://localhost:3000 (configured in vite.config.ts)

**Build for production:**
```bash
npm run build
```
Outputs to `dist/` directory with sourcemaps enabled

**Preview production build:**
```bash
npm run preview
```

## Project Architecture

This is a React 19 + TypeScript personal navigation center built with Vite. The application manages bookmarked websites with categorization, click tracking, and drag-and-drop reordering.

### Core Architecture Patterns

**State Management:**
- Uses custom `useLocalStorage` hook for persistent data
- All data stored in browser localStorage (sites, click statistics, preferences)
- No external state management library - relies on React state + localStorage

**Data Flow:**
- `App.tsx` is the main state container
- Site data flows down to `CategorySection` → `SiteCard` components
- Click tracking handled by `useSiteClicks` hook with automatic time-based resets

**Component Structure:**
```
App.tsx (main state container)
├── AddSiteModal (site creation/editing)
├── CategorySection (category display with drag-and-drop)
│   └── SiteCard (individual site display)
├── StatsView (click statistics dashboard)
├── ManageCategoriesModal (category management)
└── ConfirmModal (deletion confirmations)
```

### Key Features Implementation

**Drag-and-Drop Reordering:**
- Implemented in `CategorySection` component
- Uses `handleReorderSites` function in App.tsx
- Reorders sites within categories by manipulating array indices

**Click Statistics:**
- Tracked via `useSiteClicks` hook
- Stores daily/weekly/monthly counts with automatic reset logic
- Data persisted in localStorage with timestamp-based resets

**Local Storage Schema:**
- `sites`: Array of Site objects with id, url, name, category
- `category-icons`: Object mapping category names to emoji icons
- `favicon-fallback-color`: User's preferred fallback color for site icons
- Click data stored per site ID with time-based counters

### Development Patterns

**File Organization:**
- Components in `/components/` directory
- Custom hooks in `/hooks/` directory
- Type definitions in `types.ts`
- Main app logic in `App.tsx`

**Component Conventions:**
- All components use TypeScript with proper interface definitions
- Modal components follow `isOpen/onClose/onConfirm` pattern
- Site operations use UUID for unique identification (`crypto.randomUUID()`)

**Styling:**
- Uses Tailwind CSS classes throughout
- Responsive design with `sm:` breakpoints
- Backdrop blur effects and glassmorphism styling
- Color system based on Tailwind's color palette

### Important Implementation Details

**Site Management:**
- Sites are identified by UUID generated with `crypto.randomUUID()`
- Categories default to "未分类" (Uncategorized) if not specified
- Duplicate site detection prevents adding same URL twice

**Icon System:**
- Uses DuckDuckGo's favicon service: `https://icons.duckduckgo.com/ip3/{domain}.ico`
- Fallback to colored circles with first letter when favicon fails
- User-configurable fallback colors stored in localStorage

**Search Functionality:**
- Real-time filtering by site name or URL
- Case-insensitive search implemented in `groupedSites` useMemo

When working with this codebase, pay attention to the localStorage-based persistence model and the component hierarchy for state management.