/**
 * User Tier Utilities Tests
 * 
 * Comprehensive test suite for all tier determination logic
 * Ensures 100% coverage and correctness for 100+ apps
 */

import {
  getUserTierInfo,
  getUserTierInfoAsync,
  getIsPremium,
  checkPremiumAccess,
  checkPremiumAccessAsync,
  isAuthenticated,
  isGuest,
  isValidUserTier,
  isUserTierInfo,
  hasTierAccess,
  isTierPremium,
  isTierFreemium,
  isTierGuest,
  type UserTier,
  type UserTierInfo,
  type PremiumStatusFetcher,
} from '../userTierUtils';

describe('isValidUserTier', () => {
  it('should return true for valid tiers', () => {
    expect(isValidUserTier('guest')).toBe(true);
    expect(isValidUserTier('freemium')).toBe(true);
    expect(isValidUserTier('premium')).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isValidUserTier('invalid')).toBe(false);
    expect(isValidUserTier('')).toBe(false);
    expect(isValidUserTier(null)).toBe(false);
    expect(isValidUserTier(undefined)).toBe(false);
    expect(isValidUserTier(123)).toBe(false);
    expect(isValidUserTier({})).toBe(false);
  });
});

describe('isUserTierInfo', () => {
  it('should return true for valid UserTierInfo', () => {
    const validInfo: UserTierInfo = {
      tier: 'premium',
      isPremium: true,
      isGuest: false,
      isAuthenticated: true,
      userId: 'user123',
    };
    expect(isUserTierInfo(validInfo)).toBe(true);
  });

  it('should return false for invalid objects', () => {
    expect(isUserTierInfo(null)).toBe(false);
    expect(isUserTierInfo(undefined)).toBe(false);
    expect(isUserTierInfo('string')).toBe(false);
    expect(isUserTierInfo({})).toBe(false);
    expect(isUserTierInfo({ tier: 'invalid' })).toBe(false);
    expect(isUserTierInfo({ tier: 'premium' })).toBe(false);
  });
});

describe('isAuthenticated', () => {
  it('should return false for guest users', () => {
    expect(isAuthenticated(true, null)).toBe(false);
    expect(isAuthenticated(true, 'user123')).toBe(false);
  });

  it('should return false when userId is null', () => {
    expect(isAuthenticated(false, null)).toBe(false);
  });

  it('should return true for authenticated users', () => {
    expect(isAuthenticated(false, 'user123')).toBe(true);
  });

  it('should throw error for invalid inputs', () => {
    expect(() => isAuthenticated('invalid' as any, null)).toThrow(TypeError);
    expect(() => isAuthenticated(true, 123 as any)).toThrow(TypeError);
    expect(() => isAuthenticated(true, '' as any)).toThrow(TypeError);
  });
});

describe('isGuest', () => {
  it('should return true for guest users', () => {
    expect(isGuest(true, null)).toBe(true);
    expect(isGuest(true, 'user123')).toBe(true);
  });

  it('should return true when userId is null', () => {
    expect(isGuest(false, null)).toBe(true);
  });

  it('should return false for authenticated users', () => {
    expect(isGuest(false, 'user123')).toBe(false);
  });

  it('should throw error for invalid inputs', () => {
    expect(() => isGuest('invalid' as any, null)).toThrow(TypeError);
    expect(() => isGuest(true, 123 as any)).toThrow(TypeError);
    expect(() => isGuest(true, '' as any)).toThrow(TypeError);
  });
});

describe('getUserTierInfo', () => {
  describe('Guest users', () => {
    it('should return guest tier when isGuest is true', () => {
      const result = getUserTierInfo(true, null, false);
      expect(result.tier).toBe('guest');
      expect(result.isPremium).toBe(false);
      expect(result.isGuest).toBe(true);
      expect(result.isAuthenticated).toBe(false);
      expect(result.userId).toBe(null);
    });

    it('should return guest tier when userId is null', () => {
      const result = getUserTierInfo(false, null, false);
      expect(result.tier).toBe('guest');
      expect(result.isPremium).toBe(false);
      expect(result.isGuest).toBe(true);
      expect(result.isAuthenticated).toBe(false);
      expect(result.userId).toBe(null);
    });

    it('should ignore isPremium for guest users', () => {
      const result = getUserTierInfo(true, null, true);
      expect(result.tier).toBe('guest');
      expect(result.isPremium).toBe(false); // Guest users NEVER have premium
    });
  });

  describe('Authenticated users', () => {
    it('should return premium tier for authenticated premium users', () => {
      const result = getUserTierInfo(false, 'user123', true);
      expect(result.tier).toBe('premium');
      expect(result.isPremium).toBe(true);
      expect(result.isGuest).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.userId).toBe('user123');
    });

    it('should return freemium tier for authenticated non-premium users', () => {
      const result = getUserTierInfo(false, 'user123', false);
      expect(result.tier).toBe('freemium');
      expect(result.isPremium).toBe(false);
      expect(result.isGuest).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.userId).toBe('user123');
    });
  });

  it('should throw error for invalid inputs', () => {
    expect(() => getUserTierInfo('invalid' as any, null, false)).toThrow(TypeError);
    expect(() => getUserTierInfo(true, 123 as any, false)).toThrow(TypeError);
    expect(() => getUserTierInfo(true, null, 'invalid' as any)).toThrow(TypeError);
  });
});

describe('getIsPremium', () => {
  const mockFetcher: PremiumStatusFetcher = {
    isPremium: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false for guest users without calling fetcher', async () => {
    const result = await getIsPremium(true, null, mockFetcher);
    expect(result).toBe(false);
    expect(mockFetcher.isPremium).not.toHaveBeenCalled();
  });

  it('should return false when userId is null without calling fetcher', async () => {
    const result = await getIsPremium(false, null, mockFetcher);
    expect(result).toBe(false);
    expect(mockFetcher.isPremium).not.toHaveBeenCalled();
  });

  it('should call fetcher for authenticated users', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(true);
    
    const result = await getIsPremium(false, 'user123', mockFetcher);
    expect(result).toBe(true);
    expect(mockFetcher.isPremium).toHaveBeenCalledWith('user123');
    expect(mockFetcher.isPremium).toHaveBeenCalledTimes(1);
  });

  it('should return false when fetcher returns false', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(false);
    
    const result = await getIsPremium(false, 'user123', mockFetcher);
    expect(result).toBe(false);
    expect(mockFetcher.isPremium).toHaveBeenCalledWith('user123');
  });

  it('should throw error when fetcher throws Error', async () => {
    const error = new Error('Database error');
    (mockFetcher.isPremium as jest.Mock).mockRejectedValue(error);
    
    await expect(getIsPremium(false, 'user123', mockFetcher)).rejects.toThrow(
      'Failed to fetch premium status: Database error'
    );
  });

  it('should throw error when fetcher throws non-Error', async () => {
    const error = 'String error';
    (mockFetcher.isPremium as jest.Mock).mockRejectedValue(error);
    
    await expect(getIsPremium(false, 'user123', mockFetcher)).rejects.toThrow(
      'Failed to fetch premium status: String error'
    );
  });

  it('should throw error for invalid inputs', async () => {
    await expect(getIsPremium('invalid' as any, null, mockFetcher)).rejects.toThrow(TypeError);
    await expect(getIsPremium(true, 123 as any, mockFetcher)).rejects.toThrow(TypeError);
    await expect(getIsPremium(true, null, null as any)).rejects.toThrow(TypeError);
    await expect(getIsPremium(true, null, {} as any)).rejects.toThrow(TypeError);
  });
});

describe('getUserTierInfoAsync', () => {
  const mockFetcher: PremiumStatusFetcher = {
    isPremium: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return guest tier for guest users', async () => {
    const result = await getUserTierInfoAsync(true, null, mockFetcher);
    expect(result.tier).toBe('guest');
    expect(result.isPremium).toBe(false);
    expect(mockFetcher.isPremium).not.toHaveBeenCalled();
  });

  it('should return premium tier when fetcher returns true', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(true);
    
    const result = await getUserTierInfoAsync(false, 'user123', mockFetcher);
    expect(result.tier).toBe('premium');
    expect(result.isPremium).toBe(true);
    expect(result.isGuest).toBe(false);
    expect(result.isAuthenticated).toBe(true);
  });

  it('should return freemium tier when fetcher returns false', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(false);
    
    const result = await getUserTierInfoAsync(false, 'user123', mockFetcher);
    expect(result.tier).toBe('freemium');
    expect(result.isPremium).toBe(false);
    expect(result.isGuest).toBe(false);
    expect(result.isAuthenticated).toBe(true);
  });
});

describe('checkPremiumAccess', () => {
  it('should return false for guest users', () => {
    expect(checkPremiumAccess(true, null, true)).toBe(false);
    expect(checkPremiumAccess(true, null, false)).toBe(false);
  });

  it('should return false when userId is null', () => {
    expect(checkPremiumAccess(false, null, true)).toBe(false);
  });

  it('should return true for authenticated premium users', () => {
    expect(checkPremiumAccess(false, 'user123', true)).toBe(true);
  });

  it('should return false for authenticated freemium users', () => {
    expect(checkPremiumAccess(false, 'user123', false)).toBe(false);
  });

  it('should throw error for invalid inputs', () => {
    expect(() => checkPremiumAccess('invalid' as any, null, true)).toThrow(TypeError);
    expect(() => checkPremiumAccess(true, 123 as any, true)).toThrow(TypeError);
    expect(() => checkPremiumAccess(true, null, 'invalid' as any)).toThrow(TypeError);
  });
});

describe('checkPremiumAccessAsync', () => {
  const mockFetcher: PremiumStatusFetcher = {
    isPremium: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false for guest users', async () => {
    const result = await checkPremiumAccessAsync(true, null, mockFetcher);
    expect(result).toBe(false);
    expect(mockFetcher.isPremium).not.toHaveBeenCalled();
  });

  it('should return true when fetcher returns true', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(true);
    
    const result = await checkPremiumAccessAsync(false, 'user123', mockFetcher);
    expect(result).toBe(true);
  });

  it('should return false when fetcher returns false', async () => {
    (mockFetcher.isPremium as jest.Mock).mockResolvedValue(false);
    
    const result = await checkPremiumAccessAsync(false, 'user123', mockFetcher);
    expect(result).toBe(false);
  });
});

describe('hasTierAccess', () => {
  it('should return true when tier1 has higher access', () => {
    expect(hasTierAccess('premium', 'freemium')).toBe(true);
    expect(hasTierAccess('premium', 'guest')).toBe(true);
    expect(hasTierAccess('freemium', 'guest')).toBe(true);
  });

  it('should return true when tiers are equal', () => {
    expect(hasTierAccess('premium', 'premium')).toBe(true);
    expect(hasTierAccess('freemium', 'freemium')).toBe(true);
    expect(hasTierAccess('guest', 'guest')).toBe(true);
  });

  it('should return false when tier1 has lower access', () => {
    expect(hasTierAccess('freemium', 'premium')).toBe(false);
    expect(hasTierAccess('guest', 'premium')).toBe(false);
    expect(hasTierAccess('guest', 'freemium')).toBe(false);
  });
});

describe('isTierPremium', () => {
  it('should return true for premium tier', () => {
    expect(isTierPremium('premium')).toBe(true);
  });

  it('should return false for non-premium tiers', () => {
    expect(isTierPremium('freemium')).toBe(false);
    expect(isTierPremium('guest')).toBe(false);
  });
});

describe('isTierFreemium', () => {
  it('should return true for freemium tier', () => {
    expect(isTierFreemium('freemium')).toBe(true);
  });

  it('should return false for non-freemium tiers', () => {
    expect(isTierFreemium('premium')).toBe(false);
    expect(isTierFreemium('guest')).toBe(false);
  });
});

describe('isTierGuest', () => {
  it('should return true for guest tier', () => {
    expect(isTierGuest('guest')).toBe(true);
  });

  it('should return false for non-guest tiers', () => {
    expect(isTierGuest('premium')).toBe(false);
    expect(isTierGuest('freemium')).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle empty string userId as invalid', () => {
    expect(() => getUserTierInfo(false, '', false)).toThrow(TypeError);
  });

  it('should handle whitespace-only userId as invalid', () => {
    expect(() => getUserTierInfo(false, '   ', false)).toThrow(TypeError);
  });

  it('should handle very long userId strings', () => {
    const longUserId = 'a'.repeat(1000);
    const result = getUserTierInfo(false, longUserId, true);
    expect(result.userId).toBe(longUserId);
    expect(result.tier).toBe('premium');
  });

  it('should handle special characters in userId', () => {
    const specialUserId = 'user-123_test@example.com';
    const result = getUserTierInfo(false, specialUserId, false);
    expect(result.userId).toBe(specialUserId);
    expect(result.tier).toBe('freemium');
  });
});

