# @umituz/react-native-premium

Premium subscription management system for React Native apps with centralized premium/freemium/guest tier management.

## Features

- 🎯 **Centralized Tier Management**: Single source of truth for user tiers (Guest, Freemium, Premium)
- 🔄 **Database-First Approach**: Always reads from database, never from SDK
- ⚡ **Zustand State Management**: Efficient state management with Zustand
- 🎨 **Type-Safe**: Full TypeScript support
- 🔌 **Repository Pattern**: Database-agnostic architecture with dependency injection

## Installation

```bash
npm install @umituz/react-native-premium
```

## User Tiers

- **Guest**: Not authenticated, always freemium
- **Freemium**: Authenticated but no active premium subscription OR guest
- **Premium**: Authenticated with active premium subscription

## Quick Start

### 1. Create Repository Implementation

```typescript
import { IPremiumRepository, PremiumStatus } from '@umituz/react-native-premium';
import { db } from './firebase';

export class PremiumRepository implements IPremiumRepository {
  async getPremiumStatus(userId: string): Promise<PremiumStatus | null> {
    // Your database implementation
    const doc = await db.collection('users').doc(userId).get();
    return doc.data()?.premium || null;
  }

  async updatePremiumStatus(
    userId: string,
    status: Partial<PremiumStatus>,
  ): Promise<PremiumStatus> {
    // Your database implementation
    await db.collection('users').doc(userId).update({ premium: status });
    return this.getPremiumStatus(userId);
  }

  isPremiumValid(status: PremiumStatus): boolean {
    if (!status.isPremium) return false;
    if (!status.expiresAt) return true; // Lifetime premium
    return new Date(status.expiresAt) > new Date();
  }
}
```

### 2. Setup Service and Store

```typescript
import {
  PremiumService,
  createPremiumStore,
} from '@umituz/react-native-premium';
import { PremiumRepository } from './PremiumRepository';

const repository = new PremiumRepository();
const premiumService = new PremiumService(repository);
const usePremiumStore = createPremiumStore(premiumService);
```

### 3. Use in Components

```typescript
import { useUserTier } from '@umituz/react-native-premium';
import { useAuth } from './useAuth';
import { usePremiumStore } from './premiumStore';
import { premiumRepository } from './PremiumRepository';

function MyComponent() {
  const { user, isGuest } = useAuth();
  const { tier, isPremium, refresh } = useUserTier({
    isGuest,
    userId: user?.uid ?? null,
    usePremiumStore,
    premiumRepository,
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

## API Reference

### `PremiumService`

Business logic for premium subscription management.

```typescript
class PremiumService {
  constructor(repository: IPremiumRepository);
  getPremiumStatus(userId: string): Promise<PremiumStatus>;
  isPremium(userId: string): Promise<boolean>;
  updatePremiumStatus(userId: string, updates: Partial<PremiumStatus>): Promise<PremiumStatus>;
  activatePremium(userId: string, productId: string, expiresAt: string | null): Promise<PremiumStatus>;
  deactivatePremium(userId: string): Promise<PremiumStatus>;
}
```

### `useUserTier`

Hook to get user tier information.

```typescript
function useUserTier(params: {
  isGuest: boolean;
  userId: string | null;
  usePremiumStore: () => PremiumStore;
  premiumRepository: IPremiumRepository;
}): UseUserTierResult;
```

### `getUserTierInfo`

Utility function to determine user tier.

```typescript
function getUserTierInfo(
  isGuest: boolean,
  userId: string | null,
  isPremium: boolean
): UserTierInfo;
```

## License

MIT

