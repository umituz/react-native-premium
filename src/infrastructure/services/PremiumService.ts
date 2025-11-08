/**
 * Premium Service
 * Business logic for premium subscription management
 */

import type { IPremiumRepository } from '../../core/repositories/IPremiumRepository';
import {
  PremiumStatus,
  createDefaultPremiumStatus,
} from '../../core/entities/PremiumStatus';

export class PremiumService {
  constructor(private repository: IPremiumRepository) {}

  /**
   * Get premium status for a user
   * Returns default (free) status if user not found
   */
  async getPremiumStatus(userId: string): Promise<PremiumStatus> {
    try {
      const status = await this.repository.getPremiumStatus(userId);
      if (!status) {
        return createDefaultPremiumStatus();
      }

      // Validate premium status (check expiration)
      const isValid = this.repository.isPremiumValid(status);
      if (!isValid && status.isPremium) {
        // Premium expired, update status
        await this.updatePremiumStatus(userId, {
          isPremium: false,
          expiresAt: null,
        });
        return {
          ...status,
          isPremium: false,
          expiresAt: null,
        };
      }

      return status;
    } catch (error: any) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.error('[PremiumService] Error getting premium status:', error);
      }
      return createDefaultPremiumStatus();
    }
  }

  /**
   * Check if user has active premium subscription
   */
  async isPremium(userId: string): Promise<boolean> {
    const status = await this.getPremiumStatus(userId);
    return this.repository.isPremiumValid(status);
  }

  /**
   * Update premium status
   */
  async updatePremiumStatus(
    userId: string,
    updates: Partial<PremiumStatus>,
  ): Promise<PremiumStatus> {
    try {
      // Add syncedAt timestamp
      const updatesWithSync = {
        ...updates,
        syncedAt: new Date().toISOString(),
      };

      return await this.repository.updatePremiumStatus(
        userId,
        updatesWithSync,
      );
    } catch (error: any) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.error('[PremiumService] Error updating premium status:', error);
      }
      throw error;
    }
  }

  /**
   * Activate premium subscription
   */
  async activatePremium(
    userId: string,
    productId: string,
    expiresAt: string | null,
  ): Promise<PremiumStatus> {
    return await this.updatePremiumStatus(userId, {
      isPremium: true,
      productId,
      expiresAt,
      purchasedAt: new Date().toISOString(),
    });
  }

  /**
   * Deactivate premium subscription
   */
  async deactivatePremium(userId: string): Promise<PremiumStatus> {
    return await this.updatePremiumStatus(userId, {
      isPremium: false,
      expiresAt: null,
      productId: null,
    });
  }
}

