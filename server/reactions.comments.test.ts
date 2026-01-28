import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Reactions and Comments System", () => {
  let testResourceId: number;

  const mockAdminContext = {
    user: { id: 1, openId: "admin-test", name: "Admin User", email: "admin@test.com", role: "admin" as const },
  };

  const caller = appRouter.createCaller(mockAdminContext);

  beforeAll(async () => {
    // Create a test resource
    const slug = `test-resource-${Date.now()}`;
    await caller.admin.createResource({
      title: "Test Resource for Reactions",
      slug,
      excerpt: "Test excerpt",
      content: "Test content for reactions and comments",
      theme: "pressure_management",
    });

    // Get the resource ID
    const resources = await caller.resources.list();
    const testResource = resources.find((r) => r.slug === slug);
    if (!testResource) throw new Error("Failed to create test resource");
    testResourceId = testResource.id;
  });

  describe("Reactions", () => {
    it("should add a reaction to a resource", async () => {
      const result = await caller.reactions.add({ resourceId: testResourceId });
      expect(result.success).toBe(true);
    });

    it("should get reaction count for a resource", async () => {
      const count = await caller.reactions.getCount({ resourceId: testResourceId });
      expect(count).toBeGreaterThan(0);
    });

    it("should check if user has reacted", async () => {
      const hasReacted = await caller.reactions.hasReacted({ resourceId: testResourceId });
      expect(hasReacted).toBe(true);
    });

    it("should prevent duplicate reactions", async () => {
      const result = await caller.reactions.add({ resourceId: testResourceId });
      expect(result.success).toBe(false);
      expect(result.message).toBe("Already reacted");
    });

    it("should remove a reaction from a resource", async () => {
      const result = await caller.reactions.remove({ resourceId: testResourceId });
      expect(result.success).toBe(true);

      const hasReacted = await caller.reactions.hasReacted({ resourceId: testResourceId });
      expect(hasReacted).toBe(false);
    });
  });

  describe("Comments", () => {
    let testCommentId: number;

    it("should create a comment on a resource", async () => {
      const result = await caller.comments.create({
        resourceId: testResourceId,
        content: "This is a test comment",
      });
      expect(result).toBeDefined();
    });

    it("should list comments for a resource", async () => {
      const comments = await caller.comments.list({ resourceId: testResourceId });
      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].content).toBe("This is a test comment");
      testCommentId = comments[0].id;
    });

    it("should get comment count for a resource", async () => {
      const count = await caller.comments.getCount({ resourceId: testResourceId });
      expect(count).toBeGreaterThan(0);
    });

    it("should create a reply to a comment", async () => {
      const comments = await caller.comments.list({ resourceId: testResourceId });
      const parentComment = comments[0];
      
      const result = await caller.comments.create({
        resourceId: testResourceId,
        content: "This is a reply to the comment",
        parentId: parentComment.id,
      });
      expect(result).toBeDefined();

      const updatedComments = await caller.comments.list({ resourceId: testResourceId });
      const reply = updatedComments.find((c) => c.parentId === parentComment.id);
      expect(reply).toBeDefined();
      expect(reply?.content).toBe("This is a reply to the comment");
    });

    it("should delete own comment", async () => {
      const comments = await caller.comments.list({ resourceId: testResourceId });
      const commentToDelete = comments[0];
      
      const result = await caller.comments.delete({ commentId: commentToDelete.id });
      expect(result.success).toBe(true);
    });

    it("should require authentication to create comments", async () => {
      const publicCaller = appRouter.createCaller({});
      await expect(
        publicCaller.comments.create({
          resourceId: testResourceId,
          content: "This should fail",
        })
      ).rejects.toThrow();
    });

    it("should require authentication to add reactions", async () => {
      const publicCaller = appRouter.createCaller({});
      await expect(
        publicCaller.reactions.add({ resourceId: testResourceId })
      ).rejects.toThrow();
    });
  });
});
