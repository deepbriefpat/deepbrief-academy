import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Resources Reaction Count Display", () => {
  let testResourceId: number;

  const mockAdminContext = {
    user: { id: 1, openId: "admin-test", name: "Admin User", role: "admin" as const },
    req: {} as any,
    res: {} as any,
  };

  const adminCaller = appRouter.createCaller(mockAdminContext);

  beforeAll(async () => {
    // Create a test resource
    const slug = `test-resource-count-${Date.now()}`;
    await adminCaller.admin.createResource({
      title: "Test Resource for Count Display",
      slug,
      excerpt: "Test excerpt",
      content: "Testing reaction count display",
      theme: "pressure_management",
    });

    // Get the resource ID
    const resources = await adminCaller.resources.list();
    const testResource = resources.find((r) => r.slug === slug);
    if (!testResource) throw new Error("Failed to create test resource");
    testResourceId = testResource.id;
  });

  it("should include reactionCount field in resources.list response", async () => {
    const allResources = await adminCaller.resources.list();
    const testResource = allResources.find((r: any) => r.id === testResourceId);
    
    expect(testResource).toBeDefined();
    expect(testResource).toHaveProperty('reactionCount');
    expect(typeof testResource.reactionCount).toBe('number');
    expect(testResource.reactionCount).toBeGreaterThanOrEqual(0);
  });

  it("should include commentCount field in resources.list response", async () => {
    const allResources = await adminCaller.resources.list();
    const testResource = allResources.find((r: any) => r.id === testResourceId);
    
    expect(testResource).toBeDefined();
    expect(testResource).toHaveProperty('commentCount');
    expect(typeof testResource.commentCount).toBe('number');
    expect(testResource.commentCount).toBeGreaterThanOrEqual(0);
  });

  it("should include reactionCount field in resources.byTheme response", async () => {
    const themeResources = await adminCaller.resources.byTheme({ theme: "pressure_management" });
    const testResource = themeResources.find((r: any) => r.id === testResourceId);
    
    expect(testResource).toBeDefined();
    expect(testResource).toHaveProperty('reactionCount');
    expect(typeof testResource.reactionCount).toBe('number');
    expect(testResource.reactionCount).toBeGreaterThanOrEqual(0);
  });

  it("should include commentCount field in resources.byTheme response", async () => {
    const themeResources = await adminCaller.resources.byTheme({ theme: "pressure_management" });
    const testResource = themeResources.find((r: any) => r.id === testResourceId);
    
    expect(testResource).toBeDefined();
    expect(testResource).toHaveProperty('commentCount');
    expect(typeof testResource.commentCount).toBe('number');
    expect(testResource.commentCount).toBeGreaterThanOrEqual(0);
  });

  it("should return all required fields for resource display", async () => {
    const allResources = await adminCaller.resources.list();
    const testResource = allResources.find((r: any) => r.id === testResourceId);
    
    expect(testResource).toBeDefined();
    
    // Verify all fields needed for Resources page display
    expect(testResource).toHaveProperty('id');
    expect(testResource).toHaveProperty('title');
    expect(testResource).toHaveProperty('excerpt');
    expect(testResource).toHaveProperty('slug');
    expect(testResource).toHaveProperty('theme');
    expect(testResource).toHaveProperty('viewCount');
    expect(testResource).toHaveProperty('reactionCount');
    expect(testResource).toHaveProperty('commentCount');
  });
});
