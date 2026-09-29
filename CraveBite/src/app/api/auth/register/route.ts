// src/app/api/auth/register/route.ts
// Registration endpoint: validates uniqueness, hashes password, creates User.
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

// ─── Input Validation Schema ──────────────────────────────────────────────────
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password too long."),
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate the request body
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check email uniqueness
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 3. Hash the password (bcrypt cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create the user
    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        // role defaults to CUSTOMER per the schema
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(
      { message: "Account created successfully.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
