"use server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendMagicLink } from "@/lib/email";

function randomDelay(minMs: number = 300, maxMs: number = 800) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

import { z } from "zod";

const emailSchema = z.string().email();

export async function resetPassword(email: string) {
  try {
    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      await randomDelay();
      return {
        success: false,
        message: "Please enter a valid email address",
      };
    }

    const user = await prisma.users.findFirst({
      where: { email },
    });

    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 600_000); // 10 minutes

    if (user) {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          reset_code: resetToken,
          reset_code_expiry: resetTokenExpiry,
        },
      });

      if (user.email) {
        await sendMagicLink(user.email, resetToken);
      }
    }

    if (!user) {
      await randomDelay();
    }

    return {
      success: true,
      message: "If an account with this email exists, you will receive a magic link for password reset.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    await randomDelay();
    return {
      success: false,
      message: "An error occurred while processing your request.",
    };
  }
}

export async function handleResetForm(formData: FormData) {
  const email = formData.get("email") as string;
  return await resetPassword(email);
}
