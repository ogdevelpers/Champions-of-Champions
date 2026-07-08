import { cookies } from "next/headers";

export const SESSION_COOKIE = "champions_employee_session";

export interface EmployeeSession {
  employeeId: string;
  name: string | null;
  email: string | null;
  canPlayGames: boolean;
}

export function parseSessionValue(value: string): EmployeeSession | null {
  try {
    const parsed = JSON.parse(value) as Partial<EmployeeSession>;
    if (!parsed.employeeId || typeof parsed.employeeId !== "string") return null;

    return {
      employeeId: parsed.employeeId,
      name: parsed.name ?? null,
      email: parsed.email ?? null,
      canPlayGames: parsed.canPlayGames === true,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<EmployeeSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;

  return parseSessionValue(session.value);
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export { isValidEmail, isTataAigEmail } from "@/lib/email";

export function normalizeEmployeeId(employeeId: string): string {
  return employeeId.trim().toUpperCase();
}
