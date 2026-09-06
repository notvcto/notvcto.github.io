# Fix Language & View Mode Persistence Issue

## Problem Diagnosis

The user reports that language and view mode choices do not persist when navigating between the wishlist page and item detail pages. After investigation:

1. **localStorage writes exist** - Both lang and viewMode have useEffect hooks that write to localStorage
2. **localStorage reads exist** - Both pages read from localStorage on mount
3. **The issue persists** - Despite the code appearing correct

## Root Cause Hypothesis

The most likely issues:

1. **Race condition**: The initial state (`useState("en")` and `useState("grid")`) is being used to render before the useEffect runs to read localStorage
2. **Server-side rendering**: Next.js might be hydrating with the default values before client-side JavaScript runs
3. **Timing issue**: The localStorage read happens but the component has already rendered with defaults

## Solution Approach

Use a **"loading" state pattern** to prevent rendering until localStorage is read:

### Changes Needed:

1. **Add initialization state**: Track whether we've loaded preferences from localStorage
2. **Delay rendering**: Don't show content until preferences are loaded
3. **Single source of truth**: Ensure localStorage is read before any rendering happens

### Implementation:

**For wishlist-client.tsx:**
- Add `const [isInitialized, setIsInitialized] = useState(false)`
- In the localStorage useEffect, set `setIsInitialized(true)` after reading values
- Wrap the return with: `if (!isInitialized) return null`

**For item-client.tsx:**
- Apply the same pattern

### Alternative Approach (if above doesn't work):

Use URL search params instead of localStorage:
- `/wishlist?lang=es&view=list`
- More reliable for Next.js routing
- Persists across navigation naturally
- Falls back to defaults if params missing

## Verification Steps

1. Set language to Spanish
2. Set view to List
3. Click on an item
4. Click "Back to Wishlist"
5. Verify Spanish + List view are maintained
