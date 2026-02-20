
export interface JwtPayload {
    sub?: string;
    email?: string;
    role?: "attendee" | "manager" | "core";
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = atob(base64);
        return JSON.parse(jsonStr) as JwtPayload;
    } catch {
        return null;
    }
}


export function getUserRole(token: string): "attendee" | "manager" | "core" {
    const payload = decodeJwt(token);
    if (payload?.role && ["attendee", "manager", "core"].includes(payload.role)) {
        return payload.role;
    }
    return "attendee";
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
}
