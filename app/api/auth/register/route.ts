import { NextResponse } from "next/server";
import { RegisterSchema } from "@/app/schemas/auth.schema";
import { treeifyError } from "zod/v4/core";
import { serverApiFetch, buildApiResponse } from "@/lib/server/apiClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration data",
          errors: treeifyError(parsed.error),
        },
        { status: 400 }
      );
    }

    const result = await serverApiFetch("/register", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return buildApiResponse(result);

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}