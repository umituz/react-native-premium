/**
 * Subscription Repository Interface
 * 
 * This interface matches @umituz/react-native-subscription's ISubscriptionRepository.
 * Defined here to avoid peer dependency issues during type checking.
 * 
 * IMPORTANT: This is a type-only definition. The actual implementation
 * should come from @umituz/react-native-subscription package.
 */

/**
 * Subscription status from repository
 */
export interface SubscriptionStatus {
  isPremium: boolean;
  expiresAt: string | null;
  productId: string | null;
  purchasedAt: string | null;
  customerId: string | null;
  syncedAt: string | null;
}

/**
 * Subscription Repository Interface
 * Port for database operations
 */
export interface ISubscriptionRepository {
  /**
   * Get subscription status for a user
   * Returns null if user not found
   */
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null>;

  /**
   * Update subscription status for a user
   */
  updateSubscriptionStatus(
    userId: string,
    status: Partial<SubscriptionStatus>,
  ): Promise<SubscriptionStatus>;

  /**
   * Check if subscription is valid (not expired)
   * SECURITY: Always validate expiration server-side
   */
  isSubscriptionValid(status: SubscriptionStatus): boolean;
}

