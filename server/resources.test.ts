import { describe, it, expect, beforeAll } from "vitest";
import { createCaller } from "./_core/trpc";
import { getDb, createResource, updateResource, deleteResource } from "./db";

describe("Resource Management", () => {
  let adminContext: any;
  let userContext: any;

  beforeAll(async () => {
    // Mock admin user context
    adminContext = {
      user: {
        id: 1,
        openId: "admin-test",
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      },
      req: {} as any,
      res: {} as any,
    };

    // Mock regular user context
    userContext = {
      user: {
        id: 2,
        openId: "user-test",
        name: "Regular User",
        email: "user@test.com",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    };
  });

  describe("Database Helpers", () => {
    it("should create a resource", async () => {
      const resource = {
        title: "Test Article",
        slug: "test-article",
        excerpt: "This is a test article excerpt",
        content: "This is the full content of the test article.",
        theme: "pressure_management" as const,
        publishedAt: new Date(),
      };

      const result = await createResource(resource);
      expect(result).toBeDefined();
    });

    it("should update a resource", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a test resource first
      await createResource({
        title: "Update Test",
        slug: "update-test",
        excerpt: "Original excerpt",
        content: "Original content",
        theme: "diving_metaphors",
        publishedAt: new Date(),
      });

      // Get the created resource
      const { resources } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const [created] = await db.select().from(resources).where(eq(resources.slug, "update-test")).limit(1);

      // Update it
      const result = await updateResource(created.id, {
        title: "Updated Title",
        excerpt: "Updated excerpt",
      });

      expect(result.success).toBe(true);

      // Verify the update
      const [updated] = await db.select().from(resources).where(eq(resources.id, created.id)).limit(1);
      expect(updated.title).toBe("Updated Title");
      expect(updated.excerpt).toBe("Updated excerpt");
    });

    it("should delete a resource", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a test resource first
      await createResource({
        title: "Delete Test",
        slug: "delete-test",
        excerpt: "To be deleted",
        content: "This will be deleted",
        theme: "vulnerability",
        publishedAt: new Date(),
      });

      // Get the created resource
      const { resources } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const [created] = await db.select().from(resources).where(eq(resources.slug, "delete-test")).limit(1);

      // Delete it
      const result = await deleteResource(created.id);
      expect(result.success).toBe(true);

      // Verify deletion
      const [deleted] = await db.select().from(resources).where(eq(resources.id, created.id)).limit(1);
      expect(deleted).toBeUndefined();
    });
  });

  describe("tRPC Procedures", () => {
    it("should allow admin to create resource", async () => {
      const caller = createCaller(adminContext);

      const result = await caller.admin.createResource({
        title: "Admin Created Article",
        slug: "admin-created-article",
        excerpt: "Created by admin",
        content: "Full content here",
        theme: "pressure_management",
      });

      expect(result.success).toBe(true);
    });

    it("should prevent non-admin from creating resource", async () => {
      const caller = createCaller(userContext);

      await expect(
        caller.admin.createResource({
          title: "User Attempt",
          slug: "user-attempt",
          excerpt: "Should fail",
          content: "Should not be created",
          theme: "diving_metaphors",
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("should allow admin to update resource", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a resource first
      await createResource({
        title: "To Update",
        slug: "to-update",
        excerpt: "Original",
        content: "Original content",
        theme: "leadership_isolation",
        publishedAt: new Date(),
      });

      const { resources } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const [created] = await db.select().from(resources).where(eq(resources.slug, "to-update")).limit(1);

      const caller = createCaller(adminContext);
      const result = await caller.admin.updateResource({
        id: created.id,
        title: "Updated by Admin",
      });

      expect(result.success).toBe(true);
    });

    it("should allow admin to delete resource", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a resource first
      await createResource({
        title: "To Delete",
        slug: "to-delete",
        excerpt: "Will be deleted",
        content: "Content to delete",
        theme: "vulnerability",
        publishedAt: new Date(),
      });

      const { resources } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const [created] = await db.select().from(resources).where(eq(resources.slug, "to-delete")).limit(1);

      const caller = createCaller(adminContext);
      const result = await caller.admin.deleteResource({ id: created.id });

      expect(result.success).toBe(true);
    });
  });
});
