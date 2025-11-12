/**
 * useUserTierWithRepository Hook
 *
 * Complete hook that automatically fetches premium status from repository
 * and provides user tier information. This eliminates the need for app-specific
 * useUserTier wrappers.
 *
 * This hook combines:
 * - Auth state (from AuthProvider)
 * - Premium status fetching (from ISubscriptionRepository)
 * - Tier logic (from useUserTier)
 *
 * @example
 * ```typescript
 * import { useUserTierWithRepository } from '@umituz/react-native-premium';
 * import { useAuth } from '@domains/auth';
 * import { premiumRepository } from '@/infrastructure/repositories/PremiumRepository';
 *
 * const { tier, isPremium, isGuest, isLoading, refresh } = useUserTierWithRepository({
 *   auth: useAuth(),
 *   repository: premiumRepository,
 * });
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { useUserTier, type UseUserTierParams } from './useUserTier';
import type { ISubscriptionRepository } from '../../domain/types/ISubscriptionRepository';

/**
 * Auth provider interface
 * Apps should provide an object that matches this interface
 */
export interface AuthProvider {
  /** Current user object (null for guests) */
  user: { uid: string } | null;
  /** Whether user is a guest */
  isGuest: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

export interface UseUserTierWithRepositoryParams {
  /** Auth provider (e.g., result of useAuth hook) */
  auth: AuthProvider;
  /** Subscription repository for fetching premium status */
  repository: ISubscriptionRepository;
}

export interface UseUserTierWithRepositoryResult {
  /** User tier: 'guest' | 'freemium' | 'premium' */
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
  /** Refresh premium status from repository */
  refresh: () => Promise<void>;
}

/**
 * Hook that automatically fetches premium status and provides user tier information
 * 
 * This hook eliminates the need for app-specific useUserTier wrappers by:
 * 1. Automatically fetching premium status from repository
 * 2. Handling loading and error states
 * 3. Providing refresh functionality
 * 4. Using centralized tier logic from useUserTier
 */
export function useUserTierWithRepository(
  params: UseUserTierWithRepositoryParams,
): UseUserTierWithRepositoryResult {
  const { auth, repository } = params;
  const { user, isGuest, isAuthenticated } = auth;

  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch premium status from repository
  const fetchPremiumStatus = useCallback(async () => {
    // Guest users are never premium - no need to fetch
    if (!isAuthenticated || !user) {
      setIsPremium(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const status = await repository.getSubscriptionStatus(user.uid);
      const isPremiumValue =
        status !== null && repository.isSubscriptionValid(status);

      setIsPremium(isPremiumValue);
      setIsLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch premium status';
      setError(errorMessage);
      setIsPremium(false);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, repository]);

  // Fetch premium status when auth state changes
  useEffect(() => {
    let cancelled = false;

    fetchPremiumStatus().catch(() => {
      // Error is handled in fetchPremiumStatus
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPremiumStatus]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }
    await fetchPremiumStatus();
  }, [isAuthenticated, user, fetchPremiumStatus]);

  // Use base useUserTier hook for tier logic
  const useUserTierParams: UseUserTierParams = {
    isGuest: isGuest || !isAuthenticated,
    userId: user?.uid || null,
    isPremium,
    isLoading,
    error,
  };

  const tierInfo = useUserTier(useUserTierParams);

  return {
    ...tierInfo,
    refresh,
  };
}

