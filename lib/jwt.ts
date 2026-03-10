
export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: "attendee" | "manager" | "core";
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

const VALID_ROLES = ["attendee", "manager", "core"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(value: unknown): value is ValidRole {
  return typeof value === "string" && VALID_ROLES.includes(value as ValidRole);
}

function normalizeBase64Url(input: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) {
    return null;
  }

  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (base64.length % 4)) % 4;

  return base64.padEnd(base64.length + paddingLength, "=");
}

function decodeBase64(base64: string): Uint8Array | null {
  try {
    if (typeof atob === "function") {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      return bytes;
    }

    if (typeof Buffer !== "undefined") {
      return Uint8Array.from(Buffer.from(base64, "base64"));
    }
  } catch {
    return null;
  }

  return null;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const normalizedPayload = normalizeBase64Url(payload);
    if (!normalizedPayload) return null;

    const payloadBytes = decodeBase64(normalizedPayload);
    if (!payloadBytes) return null;
    const jsonStr = new TextDecoder("utf-8", { fatal: true }).decode(payloadBytes);

    const parsed = JSON.parse(jsonStr);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserRole(token: string): ValidRole | null {
  const payload = decodeJwt(token);

  if (isValidRole(payload?.role)) {
    return payload.role;
  }

  return null;
}
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);

  if (!payload?.exp || typeof payload.exp !== "number") {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}
