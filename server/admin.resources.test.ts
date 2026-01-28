import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Admin Resource Management", () => {
  let testResourceId: number;
  
  // Mock admin context
  const adminContext: TrpcContext = {
    user: {
      openId: "test-admin",
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin",
      avatarUrl: null,
    },
    req: {} as any,
    res: {} as any,
  };

  // Mock non-admin context
  const userContext: TrpcContext = {
    user: {
      openId: "test-user",
      name: "Test User",
      email: "user@test.com",
      role: "user",
      avatarUrl: null,
    },
    req: {} as any,
    res: {} as any,
  };

  it("should allow admin to create a resource", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.admin.createResource({
      title: "Test Resource for Deletion",
      slug: "test-resource-deletion",
      excerpt: "This resource will be deleted in tests",
      content: "Full content of the test resource that will be deleted.",
      theme: "pressure_management",
    });

    expect(result.success).toBe(true);

    // Verify resource was created
    const resources = await caller.resources.list();
    const created = resources.find((r) => r.slug === "test-resource-deletion");
    expect(created).toBeDefined();
    testResourceId = created!.id;
  });

  it("should prevent non-admin from creating resources", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.admin.createResource({
        title: "Unauthorized Resource",
        slug: "unauthorized",
        excerpt: "Should fail",
        content: "Should not be created",
        theme: "pressure_management",
      })
    ).rejects.toThrow("Unauthorized: Admin access required");
  });

  it("should allow admin to update a resource", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.admin.updateResource({
      id: testResourceId,
      title: "Updated Test Resource",
      excerpt: "Updated excerpt",
    });

    expect(result.success).toBe(true);

    // Verify update
    const resources = await caller.resources.list();
    const updated = resources.find((r) => r.id === testResourceId);
    expect(updated?.title).toBe("Updated Test Resource");
    expect(updated?.excerpt).toBe("Updated excerpt");
  });

  it("should prevent non-admin from updating resources", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.admin.updateResource({
        id: testResourceId,
        title: "Hacked Title",
      })
    ).rejects.toThrow("Unauthorized: Admin access required");
  });

  it("should allow admin to delete a resource", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.admin.deleteResource({ id: testResourceId });
    expect(result.success).toBe(true);

    // Verify deletion
    const resources = await caller.resources.list();
    const deleted = resources.find((r) => r.id === testResourceId);
    expect(deleted).toBeUndefined();
  });

  it("should prevent non-admin from deleting resources", async () => {
    const caller = appRouter.createCaller(userContext);
    
    // First create a resource as admin
    const adminCaller = appRouter.createCaller(adminContext);
    await adminCaller.admin.createResource({
      title: "Resource to Protect",
      slug: "protected-resource",
      excerpt: "Should not be deletable by non-admin",
      content: "Protected content",
      theme: "diving_metaphors",
    });

    const resources = await adminCaller.resources.list();
    const protectedResource = resources.find((r) => r.slug === "protected-resource");
    
    // Try to delete as non-admin
    await expect(
      caller.admin.deleteResource({ id: protectedResource!.id })
    ).rejects.toThrow("Unauthorized: Admin access required");

    // Cleanup
    await adminCaller.admin.deleteResource({ id: protectedResource!.id });
  });
});
