/**
 * useUserTier Hook Tests
 * 
 * Tests for React hook that provides tier information
 */

import React from 'react';
import { create } from 'react-test-renderer';
import { useUserTier, type UseUserTierParams } from '../useUserTier';

// Test component that uses the hook
function TestComponent({ params }: { params: UseUserTierParams }) {
  const tierInfo = useUserTier(params);
  return React.createElement('div', { 'data-testid': 'tier-info' }, JSON.stringify(tierInfo));
}

describe('useUserTier', () => {
  describe('Guest users', () => {
    it('should return guest tier for guest users', () => {
      const params: UseUserTierParams = {
        isGuest: true,
        userId: null,
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.tier).toBe('guest');
      expect(tierInfo.isPremium).toBe(false);
      expect(tierInfo.isGuest).toBe(true);
      expect(tierInfo.isAuthenticated).toBe(false);
      expect(tierInfo.userId).toBe(null);
      expect(tierInfo.isLoading).toBe(false);
      expect(tierInfo.error).toBe(null);
    });

    it('should ignore isPremium for guest users', () => {
      const params: UseUserTierParams = {
        isGuest: true,
        userId: null,
        isPremium: true, // Even if true, guest should be false
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.tier).toBe('guest');
      expect(tierInfo.isPremium).toBe(false); // Guest users NEVER have premium
    });
  });

  describe('Authenticated users', () => {
    it('should return premium tier for authenticated premium users', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.tier).toBe('premium');
      expect(tierInfo.isPremium).toBe(true);
      expect(tierInfo.isGuest).toBe(false);
      expect(tierInfo.isAuthenticated).toBe(true);
      expect(tierInfo.userId).toBe('user123');
    });

    it('should return freemium tier for authenticated non-premium users', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.tier).toBe('freemium');
      expect(tierInfo.isPremium).toBe(false);
      expect(tierInfo.isGuest).toBe(false);
      expect(tierInfo.isAuthenticated).toBe(true);
      expect(tierInfo.userId).toBe('user123');
    });
  });

  describe('Loading and error states', () => {
    it('should pass through loading state', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
        isLoading: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.isLoading).toBe(true);
    });

    it('should pass through error state', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
        error: 'Failed to fetch premium status',
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.error).toBe('Failed to fetch premium status');
    });

    it('should default loading to false', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.isLoading).toBe(false);
    });

    it('should default error to null', () => {
      const params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      const tree = component.toJSON();
      const tierInfo = JSON.parse((tree as any).children[0]);

      expect(tierInfo.error).toBe(null);
    });
  });

  describe('Memoization', () => {
    it('should recalculate when isGuest changes', () => {
      let params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      let tree = component.toJSON();
      let tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('premium');

      params = {
        isGuest: true,
        userId: null,
        isPremium: true,
      };
      component.update(React.createElement(TestComponent, { params }));
      tree = component.toJSON();
      tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('guest');
    });

    it('should recalculate when userId changes', () => {
      let params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };

      const component = create(React.createElement(TestComponent, { params }));
      let tree = component.toJSON();
      let tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.userId).toBe('user123');

      params = {
        isGuest: false,
        userId: 'user456',
        isPremium: true,
      };
      component.update(React.createElement(TestComponent, { params }));
      tree = component.toJSON();
      tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.userId).toBe('user456');
    });

    it('should recalculate when isPremium changes', () => {
      let params: UseUserTierParams = {
        isGuest: false,
        userId: 'user123',
        isPremium: false,
      };

      const component = create(React.createElement(TestComponent, { params }));
      let tree = component.toJSON();
      let tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('freemium');

      params = {
        isGuest: false,
        userId: 'user123',
        isPremium: true,
      };
      component.update(React.createElement(TestComponent, { params }));
      tree = component.toJSON();
      tierInfo = JSON.parse((tree as any).children[0]);
      expect(tierInfo.tier).toBe('premium');
    });
  });
});
