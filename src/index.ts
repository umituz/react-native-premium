/**
 * @umituz/react-native-premium - Public API
 *
 * Premium subscription management system for React Native apps
 * Provides centralized premium/freemium/guest tier management
 *
 * Usage:
 *   import { PremiumService, createPremiumStore, useUserTier, getUserTierInfo } from '@umituz/react-native-premium';
 */

// =============================================================================
// CORE ENTITIES
// =============================================================================

export {
  createDefaultPremiumStatus,
  type PremiumStatus,
} from './core/entities/PremiumStatus';

// =============================================================================
// REPOSITORY INTERFACE
// =============================================================================

export type { IPremiumRepository } from './core/repositories/IPremiumRepository';

// =============================================================================
// SERVICES
// =============================================================================

export { PremiumService } from './infrastructure/services/PremiumService';

// =============================================================================
// STORAGE
// =============================================================================

export { createPremiumStore } from './infrastructure/storage/PremiumStore';

// =============================================================================
// HOOKS
// =============================================================================

export {
  useUserTier,
  type UseUserTierParams,
  type UseUserTierResult,
} from './presentation/hooks/useUserTier';

// =============================================================================
// UTILITIES
// =============================================================================

export {
  getUserTierInfo,
  getUserTierInfoAsync,
  checkPremiumAccess,
  type UserTier,
  type UserTierInfo,
} from './utils/userTierUtils';

