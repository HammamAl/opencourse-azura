import { prisma } from "@/lib/db";
import * as argon2 from "argon2";

export async function validateUser(username: string, password: string) {
  const user = await prisma.users.findFirst({ where: { email: username } });
  if (!user || (user.deleted_at && user.deleted_at < new Date())) {
    await argon2.verify("$argon2id$v=19$m=65536,t=3,p=4$invalidsalt$invalidhash", password).catch(() => {});
    return null;
  }

  try {
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    console.error("Password verification failed:", err);
    return null;
  }
}
