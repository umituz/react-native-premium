# @umituz/react-native-premium

**Centralized premium/freemium/guest tier determination for React Native apps**

[![npm version](https://img.shields.io/npm/v/@umituz/react-native-premium.svg)](https://www.npmjs.com/package/@umituz/react-native-premium)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Philosophy

This package provides **ONLY** tier logic determination. It does **NOT** handle:
- ❌ Database operations
- ❌ API calls
- ❌ State management
- ❌ Authentication logic

**Why?** This makes the package:
- ✅ **Database-agnostic** (works with Firebase, Supabase, MongoDB, etc.)
- ✅ **Framework-agnostic** (works with any state management)
- ✅ **Simple and lightweight** (~2KB gzipped)
- ✅ **Easy to test** (pure functions)
- ✅ **Reusable across 100+ apps** (single source of truth)

## ✨ Features

- 🎯 **Centralized Tier Logic**: Single source of truth for tier determination
- 🚫 **No Database Operations**: Apps handle their own data fetching
- ⚡ **Lightweight**: Only ~2KB gzipped
- 🎨 **Type-Safe**: Full TypeScript support
- 🔄 **Framework Agnostic**: Works with any state management solution
- 🧪 **Testable**: Pure functions, easy to test

## 📦 Installation

```bash
npm install @umituz/react-native-premium
```

## 🎭 User Tiers

The package defines three user tiers:

| Tier | Description | isPremium | isGuest |
|------|-------------|-----------|---------|
| **Guest** | Not authenticated | `false` | `true` |
| **Freemium** | Authenticated, no premium | `false` | `false` |
| **Premium** | Authenticated, has premium | `true` | `false` |

**Key Rule**: Guest users are **ALWAYS** freemium and **NEVER** premium, regardless of any other factors.

## 🚀 Quick Start

### 1. Basic Usage (Utility Functions)

```typescript
import { getUserTierInfo, checkPremiumAccess } from '@umituz/react-native-premium';

// Determine tier from auth state and premium status
const tierInfo = getUserTierInfo(
  isGuest,      // boolean: is user a guest?
  userId,       // string | null: user ID (null for guests)
  isPremium     // boolean: does user have premium? (from your database)
);

// tierInfo: { tier: 'premium' | 'freemium' | 'guest', isPremium, isGuest, isAuthenticated, userId }

// Check premium access (guest users always return false)
const hasAccess = checkPremiumAccess(isGuest, userId, isPremium);
```

### 2. React Hook Usage

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

### 3. Async Usage with Fetcher

```typescript
import { getUserTierInfoAsync, getIsPremium } from '@umituz/react-native-premium';
import type { PremiumStatusFetcher } from '@umituz/react-native-premium';

// Define your premium status fetcher
const premiumStatusFetcher: PremiumStatusFetcher = {
  isPremium: async (userId: string) => {
    // Fetch from your database
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data()?.isPremium ?? false;
  },
};

// Get tier info asynchronously
const tierInfo = await getUserTierInfoAsync(
  isGuest,
  userId,
  premiumStatusFetcher
);

// Or just check premium status
const isPremium = await getIsPremium(isGuest, userId, premiumStatusFetcher);
```

## 📚 API Reference

### Core Functions

#### `getUserTierInfo(isGuest, userId, isPremium)`

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

**Examples:**
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

#### `checkPremiumAccess(isGuest, userId, isPremium)`

Checks if user has premium access. Guest users **NEVER** have premium access.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)
- `isPremium: boolean` - Whether user has active premium subscription

**Returns:** `boolean`

**Examples:**
```typescript
// Guest user - always false
checkPremiumAccess(true, null, true); // false

// Authenticated premium user
checkPremiumAccess(false, 'user123', true); // true

// Authenticated freemium user
checkPremiumAccess(false, 'user123', false); // false
```

#### `isAuthenticated(isGuest, userId)`

Checks if user is authenticated. Single source of truth for authentication check.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)

**Returns:** `boolean`

#### `isGuest(isGuest, userId)`

Checks if user is a guest. Single source of truth for guest check.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)

**Returns:** `boolean`

### Async Functions

#### `getIsPremium(isGuest, userId, fetcher)`

Gets premium status asynchronously. Guest users **NEVER** have premium.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)
- `fetcher: PremiumStatusFetcher` - Premium status fetcher interface

**Returns:** `Promise<boolean>`

#### `getUserTierInfoAsync(isGuest, userId, fetcher)`

Gets tier info asynchronously with fetcher.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)
- `fetcher: PremiumStatusFetcher` - Premium status fetcher interface

**Returns:** `Promise<UserTierInfo>`

#### `checkPremiumAccessAsync(isGuest, userId, fetcher)`

Checks premium access asynchronously with fetcher.

**Parameters:**
- `isGuest: boolean` - Whether user is a guest
- `userId: string | null` - User ID (null for guests)
- `fetcher: PremiumStatusFetcher` - Premium status fetcher interface

**Returns:** `Promise<boolean>`

### React Hook

#### `useUserTier(params)`

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
import { getUserTierInfo, getUserTierInfoAsync } from '@umituz/react-native-premium';
import type { PremiumStatusFetcher } from '@umituz/react-native-premium';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Option 1: Sync version (if you already have isPremium)
async function checkUserTier(userId: string | null, isGuest: boolean) {
  if (isGuest || !userId) {
    return getUserTierInfo(true, null, false);
  }

  // Fetch from your database
  const userDoc = await getDoc(doc(db, 'users', userId));
  const isPremium = userDoc.data()?.isPremium ?? false;

  return getUserTierInfo(false, userId, isPremium);
}

// Option 2: Async version with fetcher
const premiumStatusFetcher: PremiumStatusFetcher = {
  isPremium: async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data()?.isPremium ?? false;
  },
};

const tierInfo = await getUserTierInfoAsync(isGuest, userId, premiumStatusFetcher);
```

### Example 2: Supabase

```typescript
import { getUserTierInfoAsync } from '@umituz/react-native-premium';
import type { PremiumStatusFetcher } from '@umituz/react-native-premium';
import { supabase } from './supabase';

const premiumStatusFetcher: PremiumStatusFetcher = {
  isPremium: async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    return data?.is_premium ?? false;
  },
};

const tierInfo = await getUserTierInfoAsync(isGuest, userId, premiumStatusFetcher);
```

### Example 3: Custom API

```typescript
import { getUserTierInfoAsync } from '@umituz/react-native-premium';
import type { PremiumStatusFetcher } from '@umituz/react-native-premium';

const premiumStatusFetcher: PremiumStatusFetcher = {
  isPremium: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/premium`);
    const { isPremium } = await response.json();
    return isPremium;
  },
};

const tierInfo = await getUserTierInfoAsync(isGuest, userId, premiumStatusFetcher);
```

### Example 4: React Component with Zustand Store

```typescript
import { useUserTier } from '@umituz/react-native-premium';
import { useAuthStore } from './stores/authStore';
import { usePremiumStore } from './stores/premiumStore';

function MyComponent() {
  const { user, isGuest } = useAuthStore();
  const { isPremium, isLoading, error } = usePremiumStore();

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
5. **Use fetcher pattern for async operations** - Implement `PremiumStatusFetcher` interface

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

interface PremiumStatusFetcher {
  isPremium(userId: string): Promise<boolean>;
}

interface UseUserTierParams {
  isGuest: boolean;
  userId: string | null;
  isPremium: boolean;
  isLoading?: boolean;
  error?: string | null;
}

interface UseUserTierResult extends UserTierInfo {
  isLoading: boolean;
  error: string | null;
}
```

## 🧪 Testing

All functions are pure and easy to test:

```typescript
import { getUserTierInfo, checkPremiumAccess } from '@umituz/react-native-premium';

describe('getUserTierInfo', () => {
  it('should return guest tier for guest users', () => {
    const result = getUserTierInfo(true, null, false);
    expect(result.tier).toBe('guest');
    expect(result.isPremium).toBe(false);
  });

  it('should return premium tier for authenticated premium users', () => {
    const result = getUserTierInfo(false, 'user123', true);
    expect(result.tier).toBe('premium');
    expect(result.isPremium).toBe(true);
  });

  it('should return freemium tier for authenticated non-premium users', () => {
    const result = getUserTierInfo(false, 'user123', false);
    expect(result.tier).toBe('freemium');
    expect(result.isPremium).toBe(false);
  });
});
```

## 📄 License

MIT

## 🤝 Contributing

This package is designed to be used across 100+ apps. When making changes:

1. **Keep it simple** - only tier logic, no database operations
2. **Maintain backward compatibility** - don't break existing APIs
3. **Add tests** - all functions should be tested
4. **Update documentation** - keep README and examples up to date

## 🔄 Version History

### 1.2.0
- Improved documentation and examples
- Better TypeScript types
- Enhanced async fetcher pattern

### 1.1.1
- Initial stable release
- Core tier determination logic
- React hook support
- Async fetcher pattern
