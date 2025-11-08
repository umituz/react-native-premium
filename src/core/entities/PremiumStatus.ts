/**
 * Premium Entity
 * Represents premium subscription status
 */

export interface PremiumStatus {
  /** Whether user has active premium subscription */
  isPremium: boolean;

  /** Premium subscription expiration date (ISO string) */
  expiresAt: string | null;

  /** Product ID of the subscription (e.g., 'app_premium_monthly') */
  productId: string | null;

  /** When premium was purchased (ISO string) */
  purchasedAt: string | null;

  /** RevenueCat customer ID */
  revenuecatCustomerId: string | null;

  /** Last sync time with RevenueCat (ISO string) */
  syncedAt: string | null;
}

/**
 * Create default premium status (free user)
 */
export function createDefaultPremiumStatus(): PremiumStatus {
  return {
    isPremium: false,
    expiresAt: null,
    productId: null,
    purchasedAt: null,
    revenuecatCustomerId: null,
    syncedAt: null,
  };
}

