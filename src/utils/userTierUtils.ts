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
 * Type guard to check if a value is a valid UserTier
 * 
 * @param value - Value to check
 * @returns Whether value is a valid UserTier
 * 
 * @example
 * ```typescript
 * if (isValidUserTier(someValue)) {
 *   // TypeScript knows someValue is UserTier
 * }
 * ```
 */
export function isValidUserTier(value: unknown): value is UserTier {
  return value === 'guest' || value === 'freemium' || value === 'premium';
}

/**
 * Type guard to check if an object is a valid UserTierInfo
 * 
 * @param value - Value to check
 * @returns Whether value is a valid UserTierInfo
 * 
 * @example
 * ```typescript
 * if (isUserTierInfo(someValue)) {
 *   // TypeScript knows someValue is UserTierInfo
 * }
 * ```
 */
export function isUserTierInfo(value: unknown): value is UserTierInfo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    isValidUserTier(obj.tier) &&
    typeof obj.isPremium === 'boolean' &&
    typeof obj.isGuest === 'boolean' &&
    typeof obj.isAuthenticated === 'boolean' &&
    (obj.userId === null || typeof obj.userId === 'string')
  );
}

/**
 * Validate userId parameter
 * 
 * @param userId - User ID to validate
 * @throws {TypeError} If userId is invalid
 */
function validateUserId(userId: string | null): void {
  if (userId !== null && typeof userId !== 'string') {
    throw new TypeError(
      `Invalid userId: expected string or null, got ${typeof userId}`
    );
  }

  if (userId !== null && userId.trim() === '') {
    throw new TypeError('Invalid userId: cannot be empty string');
  }
}

/**
 * Validate isGuest parameter
 * 
 * @param isGuest - isGuest flag to validate
 * @throws {TypeError} If isGuest is invalid
 */
function validateIsGuest(isGuest: boolean): void {
  if (typeof isGuest !== 'boolean') {
    throw new TypeError(
      `Invalid isGuest: expected boolean, got ${typeof isGuest}`
    );
  }
}

/**
 * Validate isPremium parameter
 * 
 * @param isPremium - isPremium flag to validate
 * @throws {TypeError} If isPremium is invalid
 */
function validateIsPremium(isPremium: boolean): void {
  if (typeof isPremium !== 'boolean') {
    throw new TypeError(
      `Invalid isPremium: expected boolean, got ${typeof isPremium}`
    );
  }
}

/**
 * Validate PremiumStatusFetcher
 * 
 * @param fetcher - Fetcher to validate
 * @throws {TypeError} If fetcher is invalid
 */
function validateFetcher(fetcher: PremiumStatusFetcher): void {
  if (typeof fetcher !== 'object' || fetcher === null) {
    throw new TypeError(
      `Invalid fetcher: expected object, got ${typeof fetcher}`
    );
  }

  if (typeof fetcher.isPremium !== 'function') {
    throw new TypeError(
      'Invalid fetcher: isPremium must be a function'
    );
  }
}

/**
 * Check if user is authenticated
 * 
 * This is the SINGLE SOURCE OF TRUTH for authentication check.
 * All apps should use this function for consistent authentication logic.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @returns Whether user is authenticated
 * 
 * @example
 * ```typescript
 * // Guest user
 * isAuthenticated(true, null); // false
 * 
 * // Authenticated user
 * isAuthenticated(false, 'user123'); // true
 * ```
 */
export function isAuthenticated(
  isGuest: boolean,
  userId: string | null,
): boolean {
  validateIsGuest(isGuest);
  validateUserId(userId);
  
  return !isGuest && userId !== null;
}

/**
 * Check if user is guest
 * 
 * This is the SINGLE SOURCE OF TRUTH for guest check.
 * All apps should use this function for consistent guest logic.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @returns Whether user is a guest
 * 
 * @example
 * ```typescript
 * // Guest user
 * isGuest(true, null); // true
 * 
 * // Authenticated user
 * isGuest(false, 'user123'); // false
 * ```
 */
export function isGuest(
  isGuestFlag: boolean,
  userId: string | null,
): boolean {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  
  return isGuestFlag || userId === null;
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
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  validateIsPremium(isPremium);

  // Guest users are always freemium, never premium
  if (isGuestFlag || userId === null) {
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
  isGuestFlag: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<boolean> {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  validateFetcher(fetcher);

  // Guest users NEVER have premium - this is centralized logic
  if (isGuestFlag || userId === null) {
    return false;
  }

  // Authenticated users: fetch premium status using app's fetcher
  // Package handles the logic, app handles the database operation
  try {
    return await fetcher.isPremium(userId);
  } catch (error) {
    // If fetcher throws, assume not premium (fail-safe)
    // Apps should handle errors in their fetcher implementation
    throw new Error(
      `Failed to fetch premium status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get user tier info asynchronously with fetcher
 * 
 * This function combines getUserTierInfo and getIsPremium logic.
 * All tier determination logic is centralized here.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param fetcher - Premium status fetcher (app-specific implementation)
 * @returns Promise<UserTierInfo> - User tier information
 * 
 * @example
 * ```typescript
 * const tierInfo = await getUserTierInfoAsync(
 *   false,
 *   'user123',
 *   { isPremium: async (userId) => await premiumService.isPremium(userId) }
 * );
 * ```
 */
export async function getUserTierInfoAsync(
  isGuestFlag: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<UserTierInfo> {
  // Get isPremium using centralized logic
  const isPremium = await getIsPremium(isGuestFlag, userId, fetcher);
  
  // Get tier info using centralized logic
  return getUserTierInfo(isGuestFlag, userId, isPremium);
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
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): boolean {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  validateIsPremium(isPremium);

  // Guest users never have premium access
  if (isGuestFlag || userId === null) {
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
  isGuestFlag: boolean,
  userId: string | null,
  fetcher: PremiumStatusFetcher,
): Promise<boolean> {
  // Get isPremium using centralized logic
  const isPremium = await getIsPremium(isGuestFlag, userId, fetcher);
  
  // Apply premium access check logic
  return checkPremiumAccess(isGuestFlag, userId, isPremium);
}

/**
 * Compare two tiers to determine if first tier has higher or equal access than second
 * 
 * Tier hierarchy: guest < freemium < premium
 * 
 * @param tier1 - First tier to compare
 * @param tier2 - Second tier to compare
 * @returns Whether tier1 has higher or equal access than tier2
 * 
 * @example
 * ```typescript
 * hasTierAccess('premium', 'freemium'); // true
 * hasTierAccess('freemium', 'premium'); // false
 * hasTierAccess('premium', 'premium'); // true
 * ```
 */
export function hasTierAccess(tier1: UserTier, tier2: UserTier): boolean {
  const tierLevels: Record<UserTier, number> = {
    guest: 0,
    freemium: 1,
    premium: 2,
  };

  return tierLevels[tier1] >= tierLevels[tier2];
}

/**
 * Check if tier is premium
 * 
 * @param tier - Tier to check
 * @returns Whether tier is premium
 * 
 * @example
 * ```typescript
 * isTierPremium('premium'); // true
 * isTierPremium('freemium'); // false
 * ```
 */
export function isTierPremium(tier: UserTier): boolean {
  return tier === 'premium';
}

/**
 * Check if tier is freemium
 * 
 * @param tier - Tier to check
 * @returns Whether tier is freemium
 * 
 * @example
 * ```typescript
 * isTierFreemium('freemium'); // true
 * isTierFreemium('premium'); // false
 * ```
 */
export function isTierFreemium(tier: UserTier): boolean {
  return tier === 'freemium';
}

/**
 * Check if tier is guest
 * 
 * @param tier - Tier to check
 * @returns Whether tier is guest
 * 
 * @example
 * ```typescript
 * isTierGuest('guest'); // true
 * isTierGuest('premium'); // false
 * ```
 */
export function isTierGuest(tier: UserTier): boolean {
  return tier === 'guest';
}
