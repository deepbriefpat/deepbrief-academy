import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./trpc";
import { sendWelcomeEmail } from "./emailService";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  sendTestEmail: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const success = await sendWelcomeEmail(ctx.user);
        return {
          success,
          message: success 
            ? `Test email sent to ${ctx.user.email}` 
            : "Failed to send test email - check server logs",
        };
      } catch (error) {
        console.error("[Test Email] Error:", error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }),
});
