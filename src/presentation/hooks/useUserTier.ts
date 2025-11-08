/**
 * useUserTier Hook
 *
 * Centralized hook for determining user tier (Guest, Freemium, Premium)
 * Single source of truth for all premium/freemium/guest checks
 *
 * This hook only handles LOGICAL tier determination.
 * Database operations should be handled by the app.
 *
 * @example
 * ```typescript
 * const { tier, isPremium, isGuest } = useUserTier({
 *   isGuest: false,
 *   userId: 'user123',
 *   isPremium: true, // App should fetch this from database
 * });
 *
 * // Simple, clean checks
 * if (tier === "guest") {
 *   // Show guest upgrade card
 * } else if (tier === "freemium") {
 *   // Show freemium limits
 * } else {
 *   // Premium features
 * }
 * ```
 */

import { useMemo } from 'react';
import { getUserTierInfo, type UserTierInfo } from '../../utils/userTierUtils';

export interface UseUserTierParams {
  /** Whether user is a guest */
  isGuest: boolean;
  /** User ID (null for guests) */
  userId: string | null;
  /** Whether user has active premium subscription (app should fetch from database) */
  isPremium: boolean;
  /** Optional: Loading state from app */
  isLoading?: boolean;
  /** Optional: Error state from app */
  error?: string | null;
}

export interface UseUserTierResult extends UserTierInfo {
  /** Whether premium status is currently loading */
  isLoading: boolean;
  /** Premium status error (if any) */
  error: string | null;
}

/**
 * Hook to get user tier information
 * Combines auth state and premium status into single source of truth
 * 
 * All premium/freemium/guest checks are centralized here:
 * - Guest: isGuest || !userId → always freemium, never premium
 * - Freemium: authenticated but !isPremium
 * - Premium: authenticated && isPremium
 * 
 * Note: This hook only handles LOGICAL tier determination.
 * Database operations (fetching premium status) should be handled by the app.
 */
export function useUserTier(params: UseUserTierParams): UseUserTierResult {
  const { isGuest, userId, isPremium, isLoading = false, error = null } = params;

  // Calculate tier info using centralized logic
  const tierInfo = useMemo(() => {
    return getUserTierInfo(isGuest, userId, isPremium);
  }, [isGuest, userId, isPremium]);

  return {
    ...tierInfo,
    isLoading,
    error,
  };
}
