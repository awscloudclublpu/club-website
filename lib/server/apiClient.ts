import { NextResponse } from "next/server";
import crypto from "crypto";

const API_URL = process.env.API_BASE_URL!;
const API_KEY = process.env.TRUSTED_CLIENT_API_KEY!;

if (!API_URL) throw new Error("API_BASE_URL missing");
if (!API_KEY) throw new Error("TRUSTED_CLIENT_API_KEY missing");

export async function serverApiFetch(
  path: string,
  options: RequestInit = {}
) {
  const requestId = crypto.randomUUID();
  const backendResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
      "X-REQUEST-ID": requestId,
      ...(options.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  let data: any = {};
  try {
    data = await backendResponse.json();
  } catch {
    data = {};
  }

  return {
    ok: backendResponse.ok,
    status: backendResponse.status,
    data,
    cookies: backendResponse.headers.getSetCookie?.() ?? [],
  };
}

/**
 * Helper to convert backend response → NextResponse
 */
export function buildApiResponse(result: Awaited<ReturnType<typeof serverApiFetch>>) {
  const response = NextResponse.json(
    result.ok
      ? { success: true, data: result.data }
      : {
          success: false,
          message:
            result.data?.detail ||
            result.data?.message ||
            "Request failed",
        },
    { status: result.status }
  );

  result.cookies.forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  return response;
}