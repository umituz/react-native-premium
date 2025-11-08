/**
 * User Tier Utilities
 *
 * Centralized logic for determining user tier (Guest, Freemium, Premium)
 * 
 * ALL premium/freemium/guest checks MUST go through these utilities.
 * This is the single source of truth for tier determination.
 *
 * User Tiers:
 * - Guest: Not authenticated (isGuest || !userId) → always freemium, never premium
 * - Freemium: Authenticated but no active premium subscription
 * - Premium: Authenticated with active premium subscription
 */

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
 * Premium status fetcher interface
 * Apps should implement this to provide premium status from their database
 */
export interface PremiumStatusFetcher {
  /**
   * Check if user has active premium subscription
   * @param userId - User ID (never null, this is only called for authenticated users)
   * @returns Promise<boolean> - Whether user has premium subscription
   */
  isPremium(userId: string): Promise<boolean>;
}

/**
 * Determine user tier from auth state and premium status
 * 
 * This is the SINGLE SOURCE OF TRUTH for tier determination.
 * All apps should use this function for consistent tier logic.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param isPremium - Whether user has active premium subscription
 * @returns User tier information
 * 
 * @example
 * ```typescript
 * const tierInfo = getUserTierInfo(false, 'user123', true);
 * // Returns: { tier: 'premium', isPremium: true, isGuest: false, isAuthenticated: true, userId: 'user123' }
 * 
 * const guestInfo = getUserTierInfo(true, null, false);
 * // Returns: { tier: 'guest', isPremium: false, isGuest: true, isAuthenticated: false, userId: null }
 * ```
 */
export function getUserTierInfo(
  isGuest: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  // Guest users are always freemium, never premium
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
 * Get isPremium value with centralized logic
 * 
 * This function handles the complete logic for determining premium status:
 * - Guest users NEVER have premium (returns false immediately)
 * - Authenticated users: fetches premium status using provided fetcher
 * 
 * This is the SINGLE SOURCE OF TRUTH for isPremium determination.
 * All apps should use this function instead of directly calling their premium service.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param fetcher - Premium status fetcher (app-specific implementation)
 * @returns Promise<boolean> - Whether user has premium subscription
 * 
 * @example
 * ```typescript
 * const isPremium = await getIsPremium(
 *   false,
 *   'user123',
 *   { isPremium: async (userId) => await premiumService.isPremium(userId) }
 * );
 * ```
 */
export async function getIsPremium(
  isGuest: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<boolean> {
  // Guest users NEVER have premium - this is centralized logic
  if (isGuest || !userId) {
    return false;
  }

  // Authenticated users: fetch premium status using app's fetcher
  // Package handles the logic, app handles the database operation
  return await fetcher.isPremium(userId);
}

/**
 * Check if user has premium access (synchronous version)
 * 
 * Guest users NEVER have premium access, regardless of isPremium value.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param isPremium - Whether user has active premium subscription
 * @returns Whether user has premium access
 * 
 * @example
 * ```typescript
 * // Guest user - always false
 * checkPremiumAccess(true, null, true); // false
 * 
 * // Authenticated premium user
 * checkPremiumAccess(false, 'user123', true); // true
 * 
 * // Authenticated freemium user
 * checkPremiumAccess(false, 'user123', false); // false
 * ```
 */
export function checkPremiumAccess(
  isGuest: boolean,
  userId: string | null,
  isPremium: boolean,
): boolean {
  // Guest users never have premium access
  if (isGuest || !userId) {
    return false;
  }

  return isPremium;
}

/**
 * Check if user has premium access (async version with fetcher)
 * 
 * This function combines getIsPremium and checkPremiumAccess logic.
 * Guest users NEVER have premium access.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param fetcher - Premium status fetcher (app-specific implementation)
 * @returns Promise<boolean> - Whether user has premium access
 * 
 * @example
 * ```typescript
 * const hasAccess = await checkPremiumAccessAsync(
 *   false,
 *   'user123',
 *   { isPremium: async (userId) => await premiumService.isPremium(userId) }
 * );
 * ```
 */
export async function checkPremiumAccessAsync(
  isGuest: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<boolean> {
  // Get isPremium using centralized logic
  const isPremium = await getIsPremium(isGuest, userId, fetcher);
  
  // Apply premium access check logic
  return checkPremiumAccess(isGuest, userId, isPremium);
}
