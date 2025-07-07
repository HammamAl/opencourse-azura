"use server";

import { prisma } from "@/lib/db";
import * as argon2 from "argon2";

export async function validateResetToken(token: string, email: string) {
  try {
    const user = await prisma.users.findFirst({
      where: {
        email,
        reset_code: token,
      },
    });

    if (!user) {
      return {
        valid: false,
        message: "Invalid reset token or email address.",
      };
    }

    if (!user.reset_code_expiry || new Date() > user.reset_code_expiry) {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          reset_code: null,
          reset_code_expiry: null,
        },
      });

      return {
        valid: false,
        expired: true,
        message: "This reset link has expired. Please request a new password reset.",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Token validation error:", error);
    return {
      valid: false,
      message: "An error occurred while validating the reset token.",
    };
  }
}

export async function resetPasswordWithToken(token: string, email: string, newPassword: string) {
  try {
    const validation = await validateResetToken(token, email);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    const hashedPassword = await argon2.hash(newPassword);

    const user = await prisma.users.findFirst({ where: { email } });
    await prisma.users.update({
      where: {
        id: user?.id,
      },
      data: {
        password: hashedPassword,
        reset_code: null,
        reset_code_expiry: null,
      },
    });

    return {
      success: true,
      message: "Password has been reset successfully.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "An error occurred while resetting your password.",
    };
  }
}
