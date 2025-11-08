# @umituz/react-native-premium

Premium subscription management system for React Native apps with centralized premium/freemium/guest tier **LOGICAL** determination.

## 🎯 Philosophy

This package **ONLY** handles tier logic determination. It does **NOT** handle database operations, API calls, or state management. Apps should handle their own database operations and pass the results to this package.

**Why?** This makes the package:
- ✅ Database-agnostic (works with Firebase, Supabase, MongoDB, etc.)
- ✅ Framework-agnostic (works with any state management)
- ✅ Simple and lightweight
- ✅ Easy to test
- ✅ Reusable across 100+ apps

## ✨ Features

- 🎯 **Centralized Tier Logic**: Single source of truth for tier determination
- 🚫 **No Database Operations**: Apps handle their own data fetching
- ⚡ **Lightweight**: Only ~2KB gzipped
- 🎨 **Type-Safe**: Full TypeScript support
- 🔄 **Framework Agnostic**: Works with any state management solution

## 📦 Installation

```bash
npm install @umituz/react-native-premium
```

## 🎭 User Tiers

- **Guest**: Not authenticated (`isGuest || !userId`) → always freemium, never premium
- **Freemium**: Authenticated but no active premium subscription
- **Premium**: Authenticated with active premium subscription

## 🚀 Quick Start

### Basic Usage (Utility Function)

```typescript
import { getUserTierInfo, checkPremiumAccess } from '@umituz/react-native-premium';

// Determine tier
const tierInfo = getUserTierInfo(
  isGuest,      // boolean: is user a guest?
  userId,       // string | null: user ID
  isPremium     // boolean: does user have premium? (from your database)
);

// tierInfo: { tier: 'premium' | 'freemium' | 'guest', isPremium, isGuest, isAuthenticated, userId }

// Check premium access
const hasAccess = checkPremiumAccess(isGuest, userId, isPremium);
// Returns: false for guests, true/false for authenticated users based on isPremium
```

### React Hook Usage

```typescript
import { useUserTier } from '@umituz/react-native-premium';
import { useAuth } from './useAuth'; // Your auth hook
import { usePremiumStatus } from './usePremiumStatus'; // Your premium status hook

function MyComponent() {
  const { user, isGuest } = useAuth();
  const { isPremium, isLoading, error } = usePremiumStatus(user?.uid);
  
  const { tier, isPremium: hasPremium, isGuest: isGuestUser } = useUserTier({
    isGuest,
    userId: user?.uid ?? null,
    isPremium: isPremium ?? false,
    isLoading,
    error,
  });

  if (tier === 'guest') {
    return <GuestUpgradeCard />;
  }

  if (tier === 'freemium') {
    return <FreemiumLimits />;
  }

  return <PremiumFeatures />;
}
```

## 📚 API Reference

### `getUserTierInfo(isGuest, userId, isPremium)`

Determines user tier from auth state and premium status.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)
- `isPremium: boolean` - Whether user has active premium subscription

**Returns:** `UserTierInfo`
```typescript
{
  tier: 'guest' | 'freemium' | 'premium';
  isPremium: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}
```

**Example:**
```typescript
// Guest user
getUserTierInfo(true, null, false);
// { tier: 'guest', isPremium: false, isGuest: true, isAuthenticated: false, userId: null }

// Premium user
getUserTierInfo(false, 'user123', true);
// { tier: 'premium', isPremium: true, isGuest: false, isAuthenticated: true, userId: 'user123' }

// Freemium user
getUserTierInfo(false, 'user123', false);
// { tier: 'freemium', isPremium: false, isGuest: false, isAuthenticated: true, userId: 'user123' }
```

### `checkPremiumAccess(isGuest, userId, isPremium)`

Checks if user has premium access. Guest users **NEVER** have premium access.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)
- `isPremium: boolean` - Whether user has active premium subscription

**Returns:** `boolean`

**Example:**
```typescript
// Guest user - always false
checkPremiumAccess(true, null, true); // false

// Authenticated premium user
checkPremiumAccess(false, 'user123', true); // true

// Authenticated freemium user
checkPremiumAccess(false, 'user123', false); // false
```

### `useUserTier(params)`

React hook for tier determination.

**Parameters:**
```typescript
{
  isGuest: boolean;
  userId: string | null;
  isPremium: boolean; // App should fetch from database
  isLoading?: boolean; // Optional: loading state from app
  error?: string | null; // Optional: error state from app
}
```

**Returns:** `UseUserTierResult` (extends `UserTierInfo` with `isLoading` and `error`)

## 🔧 Integration Examples

### Example 1: Firebase Firestore

```typescript
import { getUserTierInfo } from '@umituz/react-native-premium';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

async function checkUserTier(userId: string | null, isGuest: boolean) {
  if (isGuest || !userId) {
    return getUserTierInfo(true, null, false);
  }

  // Fetch from your database
  const userDoc = await getDoc(doc(db, 'users', userId));
  const isPremium = userDoc.data()?.isPremium ?? false;

  return getUserTierInfo(false, userId, isPremium);
}
```

### Example 2: Supabase

```typescript
import { getUserTierInfo } from '@umituz/react-native-premium';
import { supabase } from './supabase';

async function checkUserTier(userId: string | null, isGuest: boolean) {
  if (isGuest || !userId) {
    return getUserTierInfo(true, null, false);
  }

  // Fetch from your database
  const { data } = await supabase
    .from('user_profiles')
    .select('is_premium')
    .eq('id', userId)
    .single();

  const isPremium = data?.is_premium ?? false;
  return getUserTierInfo(false, userId, isPremium);
}
```

### Example 3: Custom API

```typescript
import { getUserTierInfo } from '@umituz/react-native-premium';

async function checkUserTier(userId: string | null, isGuest: boolean) {
  if (isGuest || !userId) {
    return getUserTierInfo(true, null, false);
  }

  // Fetch from your API
  const response = await fetch(`/api/users/${userId}/premium`);
  const { isPremium } = await response.json();

  return getUserTierInfo(false, userId, isPremium);
}
```

## 🎯 Core Logic

The tier determination logic is simple and consistent:

```typescript
// Guest users are ALWAYS freemium, NEVER premium
if (isGuest || !userId) {
  return { tier: 'guest', isPremium: false };
}

// Authenticated users: premium or freemium
return {
  tier: isPremium ? 'premium' : 'freemium',
  isPremium,
};
```

## 📝 Best Practices

1. **Always use this package for tier determination** - Don't implement your own logic
2. **Fetch premium status in your app** - This package doesn't handle database operations
3. **Pass loading/error states** - Use the optional `isLoading` and `error` params in `useUserTier`
4. **Cache premium status** - Use your state management (Zustand, Redux, etc.) to cache results

## 🔍 TypeScript Types

```typescript
type UserTier = 'guest' | 'freemium' | 'premium';

interface UserTierInfo {
  tier: UserTier;
  isPremium: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}
```

## 📄 License

MIT

## 🤝 Contributing

This package is designed to be used across 100+ apps. When making changes:

1. Keep it simple - only tier logic, no database operations
2. Maintain backward compatibility
3. Add tests for all edge cases
4. Update documentation
