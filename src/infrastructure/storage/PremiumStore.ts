/**
 * Premium Store - Zustand State Management
 *
 * Manages premium subscription status state
 * Uses database-first approach: always reads from database, never from SDK
 */

import { create } from 'zustand';
import type { PremiumService } from '../services/PremiumService';
import type { PremiumStatus } from '../../core/entities/PremiumStatus';

interface PremiumStore {
  // State
  status: PremiumStatus | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadPremiumStatus: (userId: string) => Promise<void>;
  refreshPremiumStatus: (userId: string) => Promise<void>;
  updatePremiumStatus: (
    userId: string,
    updates: Partial<PremiumStatus>,
  ) => Promise<void>;
  clearPremiumStatus: () => void;
}

export function createPremiumStore(premiumService: PremiumService) {
  return create<PremiumStore>((set, get) => ({
    status: null,
    loading: false,
    error: null,

    loadPremiumStatus: async (userId: string) => {
      // Don't reload if already loading or if status exists
      if (get().loading || get().status) {
        return;
      }

      set({ loading: true, error: null });

      try {
        const status = await premiumService.getPremiumStatus(userId);
        set({
          status,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          status: null,
          loading: false,
          error: error.message || 'Failed to load premium status',
        });
      }
    },

    refreshPremiumStatus: async (userId: string) => {
      set({ loading: true, error: null });

      try {
        const status = await premiumService.getPremiumStatus(userId);
        set({
          status,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          loading: false,
          error: error.message || 'Failed to refresh premium status',
        });
      }
    },

    updatePremiumStatus: async (
      userId: string,
      updates: Partial<PremiumStatus>,
    ) => {
      set({ loading: true, error: null });

      try {
        const updatedStatus = await premiumService.updatePremiumStatus(
          userId,
          updates,
        );
        set({
          status: updatedStatus,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          loading: false,
          error: error.message || 'Failed to update premium status',
        });
      }
    },

    clearPremiumStatus: () => {
      set({
        status: null,
        loading: false,
        error: null,
      });
    },
  }));
}

