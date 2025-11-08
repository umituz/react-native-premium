/**
 * User Tier Utilities
 *
 * Centralized logic for determining user tier (Guest, Freemium, Premium)
 *
 * User Tiers:
 * - Guest: Not authenticated, always freemium
 * - Freemium: Authenticated but no active premium subscription OR guest
 * - Premium: Authenticated with active premium subscription
 */

import type { PremiumService } from '../infrastructure/services/PremiumService';

export type UserTier = 'guest' | 'freemium' | 'premium';

export interface UserTierInfo {
  /** User tier classification */
  tier: UserTier;

  /** Whether user has premium access */
  isPremium: boolean;

  /** Whether user is a guest (not authenticated) */
  isGuest: boolean;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** User ID (null for guests) */
  userId: string | null;
}

/**
 * Determine user tier from auth state and premium status
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param isPremium - Whether user has active premium subscription
 * @returns User tier information
 */
export function getUserTierInfo(
  isGuest: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  // Guest users are always freemium
  if (isGuest || !userId) {
    return {
      tier: 'guest',
      isPremium: false,
      isGuest: true,
      isAuthenticated: false,
      userId: null,
    };
  }

  // Authenticated users: premium or freemium
  return {
    tier: isPremium ? 'premium' : 'freemium',
    isPremium,
    isGuest: false,
    isAuthenticated: true,
    userId,
  };
}

/**
 * Check if user has premium access (async version for services)
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param premiumService - Premium service instance
 * @returns Promise<boolean> - Whether user has premium access
 */
export async function checkPremiumAccess(
  isGuest: boolean,
  userId: string | null,
  premiumService: PremiumService,
): Promise<boolean> {
  // Guest users never have premium access
  if (isGuest || !userId) {
    return false;
  }

  // Check premium status from database
  try {
    return await premiumService.isPremium(userId);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    if (__DEV__) {
      console.error('[userTierUtils] Error checking premium access:', error);
    }
    // On error, assume freemium (fail safe)
    return false;
  }
}

/**
 * Get user tier info (async version for services)
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param premiumService - Premium service instance
 * @returns Promise<UserTierInfo> - User tier information
 */
export async function getUserTierInfoAsync(
  isGuest: boolean,
  userId: string | null,
  premiumService: PremiumService,
): Promise<UserTierInfo> {
  const isPremium = await checkPremiumAccess(isGuest, userId, premiumService);
  return getUserTierInfo(isGuest, userId, isPremium);
}

