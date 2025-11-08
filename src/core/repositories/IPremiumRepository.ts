/**
 * Premium Repository Interface
 * Defines contract for premium status operations
 * 
 * Implementations should provide database-specific logic
 */

import type { PremiumStatus } from '../entities/PremiumStatus';

export interface IPremiumRepository {
  /**
   * Get premium status for a user
   */
  getPremiumStatus(userId: string): Promise<PremiumStatus | null>;

  /**
   * Update premium status for a user
   */
  updatePremiumStatus(
    userId: string,
    status: Partial<PremiumStatus>,
  ): Promise<PremiumStatus>;

  /**
   * Check if premium subscription is still valid (not expired)
   */
  isPremiumValid(status: PremiumStatus): boolean;
}

