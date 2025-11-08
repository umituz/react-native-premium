/**
 * @umituz/react-native-premium - Public API
 *
 * Premium subscription management system for React Native apps
 * Provides centralized premium/freemium/guest tier LOGICAL determination
 *
 * This package ONLY handles tier logic, NOT database operations.
 * Apps should handle their own database operations and pass the results here.
 *
 * Usage:
 *   import { useUserTier, getUserTierInfo, getIsPremium, checkPremiumAccess } from '@umituz/react-native-premium';
 */

// =============================================================================
// UTILITIES - Core Logic
// =============================================================================

export {
  getUserTierInfo,
  getIsPremium,
  checkPremiumAccess,
  checkPremiumAccessAsync,
  type UserTier,
  type UserTierInfo,
  type PremiumStatusFetcher,
} from './utils/userTierUtils';

// =============================================================================
// HOOKS
// =============================================================================

export {
  useUserTier,
  type UseUserTierParams,
  type UseUserTierResult,
} from './presentation/hooks/useUserTier';
