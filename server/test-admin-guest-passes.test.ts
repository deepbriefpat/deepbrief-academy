import { describe, it, expect } from 'vitest';

describe('Admin Guest Pass Management', () => {
  it('should generate correct guest pass link format', () => {
    const baseUrl = 'https://thedeepbrief.co.uk';
    const guestPassCode = 'GUEST-2026-LJAIH5';
    
    const link = `${baseUrl}/ai-coach/dashboard?guest=${guestPassCode}`;
    
    expect(link).toBe('https://thedeepbrief.co.uk/ai-coach/dashboard?guest=GUEST-2026-LJAIH5');
    expect(link).toContain('?guest=');
    expect(link).toContain(guestPassCode);
  });

  it('should handle multiple guest passes with different codes', () => {
    const baseUrl = 'https://thedeepbrief.co.uk';
    const passes = [
      { code: 'GUEST-2026-ABC123', label: 'Test User 1' },
      { code: 'GUEST-2026-XYZ789', label: 'Test User 2' },
      { code: 'GUEST-2026-DEF456', label: 'Test User 3' },
    ];
    
    const links = passes.map(pass => `${baseUrl}/ai-coach/dashboard?guest=${pass.code}`);
    
    expect(links).toHaveLength(3);
    expect(links[0]).toContain('ABC123');
    expect(links[1]).toContain('XYZ789');
    expect(links[2]).toContain('DEF456');
    
    // Each link should be unique
    const uniqueLinks = new Set(links);
    expect(uniqueLinks.size).toBe(3);
  });

  it('should filter guest passes by search query', () => {
    const passes = [
      { 
        code: 'GUEST-2026-ABC123', 
        label: 'John Doe',
        invitations: [{ recipientEmail: 'john@example.com', recipientName: 'John Doe' }]
      },
      { 
        code: 'GUEST-2026-XYZ789', 
        label: 'Jane Smith',
        invitations: [{ recipientEmail: 'jane@example.com', recipientName: 'Jane Smith' }]
      },
      { 
        code: 'GUEST-2026-DEF456', 
        label: 'Bob Johnson',
        invitations: [{ recipientEmail: 'bob@example.com', recipientName: 'Bob Johnson' }]
      },
    ];
    
    const searchQuery = 'jane';
    const searchLower = searchQuery.toLowerCase();
    
    const filtered = passes.filter(
      (pass) =>
        pass.code.toLowerCase().includes(searchLower) ||
        pass.label?.toLowerCase().includes(searchLower) ||
        pass.invitations.some(
          (inv: any) =>
            inv.recipientEmail.toLowerCase().includes(searchLower) ||
            inv.recipientName?.toLowerCase().includes(searchLower)
        )
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Jane Smith');
  });

  it('should identify expired guest passes', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const passes = [
      { code: 'GUEST-2026-ABC123', expiresAt: yesterday },
      { code: 'GUEST-2026-XYZ789', expiresAt: tomorrow },
      { code: 'GUEST-2026-DEF456', expiresAt: null }, // Never expires
    ];
    
    const isExpired = (expiresAt: Date | null) => {
      if (!expiresAt) return false;
      return new Date(expiresAt) < new Date();
    };
    
    expect(isExpired(passes[0].expiresAt)).toBe(true);
    expect(isExpired(passes[1].expiresAt)).toBe(false);
    expect(isExpired(passes[2].expiresAt)).toBe(false);
  });

  it('should categorize guest pass status correctly', () => {
    const passes = [
      { isActive: false, expiresAt: null, usageCount: 0 }, // Revoked
      { isActive: true, expiresAt: new Date('2020-01-01'), usageCount: 0 }, // Expired
      { isActive: true, expiresAt: null, usageCount: 5 }, // Active (Used)
      { isActive: true, expiresAt: null, usageCount: 0 }, // Active (Unused)
    ];
    
    const getStatus = (pass: any) => {
      if (!pass.isActive) return 'revoked';
      if (pass.expiresAt && new Date(pass.expiresAt) < new Date()) return 'expired';
      if (pass.usageCount > 0) return 'active_used';
      return 'active_unused';
    };
    
    expect(getStatus(passes[0])).toBe('revoked');
    expect(getStatus(passes[1])).toBe('expired');
    expect(getStatus(passes[2])).toBe('active_used');
    expect(getStatus(passes[3])).toBe('active_unused');
  });

  it('should format dates correctly', () => {
    const testDate = new Date('2026-01-27T12:00:00Z');
    
    const formatted = testDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('27');
    expect(formatted).toContain('2026');
  });
});
