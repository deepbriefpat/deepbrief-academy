import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

describe("Admin Analytics", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let testResourceId: number;

  beforeAll(async () => {
    // Create admin context
    const adminUser: AuthenticatedUser = {
      id: 1,
      openId: "test-admin",
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin",
      loginMethod: "oauth",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const adminCtx: TrpcContext = {
      user: adminUser,
      req: {} as any,
      res: {} as any,
    };

    // Create admin caller
    adminCaller = appRouter.createCaller(adminCtx);

    // Create a test resource
    const uniqueSlug = `analytics-test-${Date.now()}`;
    await adminCaller.admin.createResource({
      title: "Analytics Test Article",
      excerpt: "Test excerpt for analytics",
      content: "Test content for analytics tracking",
      linkedinUrl: "https://linkedin.com/test",
      slug: uniqueSlug,
      theme: "pressure_management",
    });

    // Find the created resource
    const allResources = await adminCaller.resources.list();
    const testResource = allResources.find((r: any) => r.slug === uniqueSlug);
    if (!testResource) throw new Error("Test resource not found");
    testResourceId = testResource.id;
  });

  it("should return analytics with zero views initially", async () => {
    const analytics = await adminCaller.admin.getAnalytics();

    expect(analytics).toBeDefined();
    expect(analytics.totalArticles).toBeGreaterThan(0);
    expect(analytics.totalViews).toBeGreaterThanOrEqual(0);
    expect(analytics.avgViewsPerArticle).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(analytics.topArticles)).toBe(true);
    expect(Array.isArray(analytics.recentlyViewed)).toBe(true);
    expect(Array.isArray(analytics.themeBreakdown)).toBe(true);
    expect(analytics.themeBreakdown).toHaveLength(4);
  });

  it("should track views and update analytics", async () => {
    // Track a view
    await adminCaller.resources.trackView({ resourceId: testResourceId });

    // Get analytics
    const analytics = await adminCaller.admin.getAnalytics();

    // Verify total views increased
    expect(analytics.totalViews).toBeGreaterThan(0);

    // Verify the article appears in top articles
    const foundInTop = analytics.topArticles.some((a: any) => a.id === testResourceId);
    expect(foundInTop).toBe(true);

    // Verify the article appears in recently viewed
    const foundInRecent = analytics.recentlyViewed.some((a: any) => a.id === testResourceId);
    expect(foundInRecent).toBe(true);
  });

  it("should calculate theme breakdown correctly", async () => {
    const analytics = await adminCaller.admin.getAnalytics();

    // Verify theme breakdown structure
    const pressureTheme = analytics.themeBreakdown.find((t: any) => t.theme === "pressure_management");
    expect(pressureTheme).toBeDefined();
    expect(pressureTheme.count).toBeGreaterThan(0);
    expect(pressureTheme.totalViews).toBeGreaterThanOrEqual(0);
  });

  it("should sort top articles by view count", async () => {
    // Track multiple views on test resource
    await adminCaller.resources.trackView({ resourceId: testResourceId });
    await adminCaller.resources.trackView({ resourceId: testResourceId });

    const analytics = await adminCaller.admin.getAnalytics();

    // Verify sorting (highest views first)
    if (analytics.topArticles.length > 1) {
      for (let i = 0; i < analytics.topArticles.length - 1; i++) {
        expect(analytics.topArticles[i].viewCount).toBeGreaterThanOrEqual(
          analytics.topArticles[i + 1].viewCount
        );
      }
    }
  });

  it("should deny access to non-admin users", async () => {
    const regularUser: AuthenticatedUser = {
      id: 2,
      openId: "test-user",
      name: "Test User",
      email: "user@test.com",
      role: "user",
      loginMethod: "oauth",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const userCtx: TrpcContext = {
      user: regularUser,
      req: {} as any,
      res: {} as any,
    };

    const userCaller = appRouter.createCaller(userCtx);

    await expect(userCaller.admin.getAnalytics()).rejects.toThrow("Unauthorized");
  });
});
