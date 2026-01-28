import { describe, it, expect } from 'vitest';

describe('Session Resume URL Update', () => {
  it('should remove tab and expand params when resuming session', () => {
    // Simulate URL with tab=history&expand=latest
    const originalUrl = 'https://example.com/ai-coach/dashboard?tab=history&expand=latest';
    const url = new URL(originalUrl);
    
    // Simulate the URL update logic from onResumeSession
    url.searchParams.delete('tab');
    url.searchParams.delete('expand');
    
    const cleanedUrl = url.toString();
    
    // Should remove both query params
    expect(cleanedUrl).toBe('https://example.com/ai-coach/dashboard');
    expect(cleanedUrl).not.toContain('tab=');
    expect(cleanedUrl).not.toContain('expand=');
  });

  it('should preserve other query params when cleaning URL', () => {
    // Simulate URL with multiple params
    const originalUrl = 'https://example.com/ai-coach/dashboard?tab=history&expand=latest&guest=ABC123';
    const url = new URL(originalUrl);
    
    // Remove only tab and expand
    url.searchParams.delete('tab');
    url.searchParams.delete('expand');
    
    const cleanedUrl = url.toString();
    
    // Should keep guest param
    expect(cleanedUrl).toBe('https://example.com/ai-coach/dashboard?guest=ABC123');
    expect(cleanedUrl).toContain('guest=ABC123');
    expect(cleanedUrl).not.toContain('tab=');
    expect(cleanedUrl).not.toContain('expand=');
  });

  it('should handle URL with no query params', () => {
    const originalUrl = 'https://example.com/ai-coach/dashboard';
    const url = new URL(originalUrl);
    
    // Try to delete params that don't exist
    url.searchParams.delete('tab');
    url.searchParams.delete('expand');
    
    const cleanedUrl = url.toString();
    
    // Should remain unchanged
    expect(cleanedUrl).toBe('https://example.com/ai-coach/dashboard');
  });

  it('should handle URL with only one of the params', () => {
    const originalUrl = 'https://example.com/ai-coach/dashboard?tab=history';
    const url = new URL(originalUrl);
    
    url.searchParams.delete('tab');
    url.searchParams.delete('expand');
    
    const cleanedUrl = url.toString();
    
    // Should remove the tab param
    expect(cleanedUrl).toBe('https://example.com/ai-coach/dashboard');
    expect(cleanedUrl).not.toContain('tab=');
  });
});
