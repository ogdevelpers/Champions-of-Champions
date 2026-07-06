import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("employee_ids")
      .select("employee_id, name")
      .eq("employee_id", employeeId.trim().toUpperCase())
      .single();

    if (error || !data) {
      console.error("Login lookup failed:", error?.message);
      return NextResponse.json({ error: "Invalid employee ID. Please try again." }, { status: 401 });
    }

    const session = JSON.stringify({
      employeeId: data.employee_id,
      name: data.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session, sessionCookieOptions());

    return NextResponse.json({
      success: true,
      employee: { id: data.employee_id, name: data.name },
    });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
