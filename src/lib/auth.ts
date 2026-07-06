import { cookies } from "next/headers";

export const SESSION_COOKIE = "champions_employee_session";

export interface EmployeeSession {
  employeeId: string;
  name: string | null;
}

export async function getSession(): Promise<EmployeeSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;

  try {
    return JSON.parse(session.value) as EmployeeSession;
  } catch {
    return null;
  }
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
