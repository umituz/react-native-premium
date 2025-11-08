/**
 * useUserTier Hook
 *
 * Centralized hook for determining user tier (Guest, Freemium, Premium)
 * Single source of truth for all premium/freemium checks
 *
 * @example
 * ```typescript
 * const { tier, isPremium, isGuest, userId, refresh } = useUserTier({
 *   isGuest: false,
 *   userId: 'user123',
 *   usePremiumStore,
 *   premiumRepository,
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
 *
 * // Refresh premium status (e.g., after purchase)
 * await refresh();
 * ```
 */

import { useEffect, useMemo, useCallback } from 'react';
import type { StoreApi } from 'zustand';
import type { PremiumStatus } from '../../core/entities/PremiumStatus';
import type { IPremiumRepository } from '../../core/repositories/IPremiumRepository';
import { getUserTierInfo } from '../../utils/userTierUtils';

export interface UseUserTierParams {
  /** Whether user is a guest */
  isGuest: boolean;
  /** User ID (null for guests) */
  userId: string | null;
  /** Premium store hook */
  usePremiumStore: () => {
    status: PremiumStatus | null;
    loading: boolean;
    error: string | null;
    loadPremiumStatus: (userId: string) => Promise<void>;
    refreshPremiumStatus: (userId: string) => Promise<void>;
  };
  /** Premium repository for validation */
  premiumRepository: IPremiumRepository;
}

export interface UseUserTierResult {
  /** User tier classification */
  tier: 'guest' | 'freemium' | 'premium';
  /** Whether user has premium access */
  isPremium: boolean;
  /** Whether user is a guest */
  isGuest: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** User ID (null for guests) */
  userId: string | null;
  /** Whether premium status is currently loading */
  isLoading: boolean;
  /** Premium status error (if any) */
  error: string | null;
  /** Refresh premium status from database */
  refresh: () => Promise<void>;
}

/**
 * Hook to get user tier information
 * Combines auth state and premium status into single source of truth
 */
export function useUserTier(params: UseUserTierParams): UseUserTierResult {
  const { isGuest, userId, usePremiumStore, premiumRepository } = params;
  const { status, loading, error, loadPremiumStatus, refreshPremiumStatus } =
    usePremiumStore();

  // Load premium status when user changes
  useEffect(() => {
    if (isGuest || !userId) {
      // Guest users are never premium - no need to load
      return;
    }

    loadPremiumStatus(userId).catch(() => {
      // Silent fail - error is stored in store
    });
  }, [userId, isGuest, loadPremiumStatus]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (isGuest || !userId) {
      return;
    }

    await refreshPremiumStatus(userId);
  }, [userId, isGuest, refreshPremiumStatus]);

  // Calculate tier info using centralized logic
  const tierInfo = useMemo(() => {
    // Guest users are never premium
    if (isGuest || !userId) {
      return getUserTierInfo(true, null, false);
    }

    // Check premium status (validate expiration)
    const isPremium =
      status !== null && premiumRepository.isPremiumValid(status);

    return getUserTierInfo(false, userId, isPremium);
  }, [isGuest, userId, status, premiumRepository]);

  return {
    ...tierInfo,
    isLoading: loading,
    error,
    refresh,
  };
}

