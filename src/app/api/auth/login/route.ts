import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { isTataAigEmail } from "@/lib/email";
import {
  SESSION_COOKIE,
  normalizeEmployeeId,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "edge";

interface EmployeeRecord {
  employee_id: string;
  name: string | null;
  email: string | null;
  is_active: boolean;
  can_play_games: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, name, email } = body as {
      employeeId?: string;
      name?: string;
      email?: string;
    };

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !isTataAigEmail(email)) {
      return NextResponse.json(
        { error: "Please use your official @tataaig.com email address" },
        { status: 400 }
      );
    }

    const normalizedId = normalizeEmployeeId(employeeId);
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("employee_ids")
      .select("employee_id, name, email, is_active, can_play_games")
      .eq("employee_id", normalizedId)
      .single();

    if (error || !data) {
      console.error("Login lookup failed:", error?.message);
      return NextResponse.json({ error: "Invalid employee ID. Please try again." }, { status: 401 });
    }

    const employee = data as EmployeeRecord;

    if (!employee.is_active) {
      return NextResponse.json(
        { error: "This employee account is inactive. Please contact your administrator." },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from("employee_ids")
      .update({
        name: trimmedName,
        email: normalizedEmail,
      })
      .eq("employee_id", normalizedId);

    if (updateError) {
      console.error("Login profile update failed:", updateError.message);
      return NextResponse.json(
        { error: "Could not save your details. Please try again." },
        { status: 500 }
      );
    }

    const session = JSON.stringify({
      employeeId: employee.employee_id,
      name: trimmedName,
      email: normalizedEmail,
      canPlayGames: employee.can_play_games,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session, sessionCookieOptions());

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.employee_id,
        name: trimmedName,
        email: normalizedEmail,
        canPlayGames: employee.can_play_games,
      },
    });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
