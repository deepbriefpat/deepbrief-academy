import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context for admin user
const adminContext: Context = {
  user: {
    id: 1,
    openId: "test-admin",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    loginMethod: "email",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

// Public context (no user)
const publicContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe("Admin Resources Analytics", () => {
  let testSlug: string;
  const caller = appRouter.createCaller(adminContext);
  const publicCaller = appRouter.createCaller(publicContext);

  beforeAll(async () => {
    // Create a test resource with unique slug
    const timestamp = Date.now();
    testSlug = `analytics-test-${timestamp}`;
    await caller.admin.createResource({
      title: "Analytics Test Article",
      slug: testSlug,
      excerpt: "Testing analytics tracking",
      content: "This article is for testing view tracking and analytics display.",
      theme: "pressure_management",
      linkedinUrl: "https://linkedin.com/test",
      publishedAt: new Date().toISOString(),
    });
  });

  it("should track resource views", async () => {
    // Get initial state
    const resources = await caller.resources.list();
    const resource = resources.find((r) => r.slug === testSlug);
    expect(resource).toBeDefined();
    const initialViews = resource?.viewCount || 0;

    // Track a view
    await publicCaller.resources.trackView({ resourceId: resource!.id });

    // Verify view count increased
    const updatedResources = await caller.resources.list();
    const updatedResource = updatedResources.find((r) => r.slug === testSlug);
    
    expect(updatedResource?.viewCount).toBe(initialViews + 1);
    expect(updatedResource?.lastViewedAt).toBeTruthy();
  });

  it("should increment view count on multiple views", async () => {
    const resources = await caller.resources.list();
    const resource = resources.find((r) => r.slug === testSlug);
    expect(resource).toBeDefined();
    const initialViews = resource?.viewCount || 0;

    // Track multiple views
    await publicCaller.resources.trackView({ resourceId: resource!.id });
    await publicCaller.resources.trackView({ resourceId: resource!.id });
    await publicCaller.resources.trackView({ resourceId: resource!.id });

    // Verify view count increased by 3
    const updatedResources = await caller.resources.list();
    const updatedResource = updatedResources.find((r) => r.slug === testSlug);
    
    expect(updatedResource?.viewCount).toBe(initialViews + 3);
  });

  it("should update lastViewedAt timestamp on view", async () => {
    const resources = await caller.resources.list();
    const resource = resources.find((r) => r.slug === testSlug);
    expect(resource).toBeDefined();
    
    const beforeView = new Date();
    
    // Wait 100ms to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await publicCaller.resources.trackView({ resourceId: resource!.id });
    
    const updatedResources = await caller.resources.list();
    const updatedResource = updatedResources.find((r) => r.slug === testSlug);
    
    expect(updatedResource?.lastViewedAt).toBeTruthy();
    if (updatedResource?.lastViewedAt) {
      expect(new Date(updatedResource.lastViewedAt).getTime()).toBeGreaterThan(beforeView.getTime());
    }
  });

  it("should allow public users to track views", async () => {
    const resources = await caller.resources.list();
    const resource = resources.find((r) => r.slug === testSlug);
    expect(resource).toBeDefined();
    
    // Public users should be able to track views without authentication
    const result = await publicCaller.resources.trackView({ resourceId: resource!.id });
    expect(result.success).toBe(true);
  });

  it("should display analytics in resource list", async () => {
    const resources = await caller.resources.list();
    const resource = resources.find((r) => r.slug === testSlug);
    
    expect(resource).toBeDefined();
    expect(resource?.viewCount).toBeGreaterThanOrEqual(0);
    expect(resource).toHaveProperty("lastViewedAt");
  });
});
