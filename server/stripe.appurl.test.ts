import { describe, it, expect } from 'vitest';

describe('VITE_APP_URL Configuration', () => {
  it('should have VITE_APP_URL environment variable set', () => {
    const appUrl = process.env.VITE_APP_URL;
    
    expect(appUrl).toBeDefined();
    expect(appUrl).not.toBe('');
    expect(appUrl).toMatch(/^https?:\/\//); // Should start with http:// or https://
  });

  it('should not default to localhost', () => {
    const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
    
    // In production, we should have a real domain set
    if (process.env.NODE_ENV === 'production' || process.env.VITE_APP_URL) {
      expect(appUrl).not.toContain('localhost');
    }
  });

  it('should be a valid URL format', () => {
    const appUrl = process.env.VITE_APP_URL;
    
    if (appUrl) {
      expect(() => new URL(appUrl)).not.toThrow();
    }
  });
});
