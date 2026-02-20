"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserRole, isTokenExpired, decodeJwt } from "@/lib/jwt";

export default function DashboardPage() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token || isTokenExpired(token)) {
            localStorage.removeItem("authToken");
            router.replace("/auth/login");
            return;
        }

        const userRole = getUserRole(token);
        const payload = decodeJwt(token);
        setRole(userRole);
        setEmail(payload?.email || null);
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #132E59 50%, #0B1D3A 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <span className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-200/60 font-mono text-sm">
                        AUTHENTICATING...
                    </span>
                </div>
            </div>
        );
    }

    const roleConfig = {
        core: {
            label: "CORE_MEMBER",
            color: "text-orange-400",
            borderColor: "border-orange-500",
            bgColor: "bg-orange-950/30",
            shadowColor: "shadow-[0_0_20px_rgba(249,115,22,0.2)]",
            description: "Full system access — manage events, users, and platform settings.",
        },
        manager: {
            label: "MANAGER",
            color: "text-cyan-300",
            borderColor: "border-cyan-400",
            bgColor: "bg-cyan-950/30",
            shadowColor: "shadow-[0_0_20px_rgba(0,229,255,0.2)]",
            description: "Event management access — create and manage events.",
        },
        attendee: {
            label: "ATTENDEE",
            color: "text-emerald-400",
            borderColor: "border-emerald-500",
            bgColor: "bg-emerald-950/30",
            shadowColor: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
            description: "Browse and register for events.",
        },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.attendee;

    return (
        <div className="relative min-h-screen overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #132E59 50%, #0B1D3A 100%)' }}>
            <video
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
                src="/video/background.mp4"
                autoPlay
                loop
                muted
                playsInline
            />
            <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-b from-transparent via-blue-950/30 to-blue-950" />

            <div className="relative z-20 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-5rem)]">
                <div className="w-full max-w-2xl">
                    <div className="animate-fade-in-up">
                        {/* Role Badge */}
                        <div className="mb-8 text-center">
                            <div
                                className={`inline-block px-4 py-2 ${config.bgColor} border ${config.borderColor}/50 rounded mb-4 ${config.shadowColor}`}
                            >
                                <span
                                    className={`${config.color} font-semibold text-xs uppercase tracking-widest`}
                                >
                                    [{config.label}]
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-white mb-2">
                                <span className="text-cyan-300">▸</span> DASHBOARD
                            </h1>
                            {email && (
                                <p className="text-blue-200/60 text-sm font-mono">
                                    Logged in as {email}
                                </p>
                            )}
                        </div>

                        {/* Role Info Card */}
                        <div className="mission-panel p-6 rounded-xl mb-6">
                            <p className="text-blue-100/80 text-sm font-mono mb-4">
                                {config.description}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="telemetry-dot active" />
                                <span className="text-blue-200/50 text-xs font-mono uppercase tracking-wider">
                                    System Online — Dashboard Coming Soon
                                </span>
                            </div>
                        </div>

                        {/* Coming Soon Message */}
                        <div className="p-4 panel-glow rounded-lg text-center mb-8 bg-[#0F2E4E]/60">
                            <p className="text-blue-200/40 text-sm font-mono">
                                &lt;!-- Dashboard UI is under development --&gt;
                            </p>
                            <p className="text-blue-200/60 text-sm font-mono mt-2">
                                Your role-specific dashboard will appear here.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/"
                                className="px-6 py-3 bg-transparent border-3 border-cyan-400 text-cyan-300 font-bold rounded-none hover:bg-cyan-400/10 transition-all duration-300 text-sm text-center comic-border uppercase tracking-wider"
                            >
                                &lt; BACK_HOME
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("authToken");
                                    router.push("/auth/login");
                                }}
                                className="px-6 py-3 bg-transparent border-3 border-blue-400/40 text-blue-200/60 font-bold rounded-none hover:bg-red-950/20 hover:border-red-500 hover:text-red-400 transition-all duration-300 text-sm comic-border uppercase tracking-wider"
                            >
                                ▸ LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
