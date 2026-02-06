import { NextResponse } from "next/server";
import { RegisterSchema } from "@/app/schemas/auth.schema";
import { treeifyError } from "zod/v4/core";

const apiUrl = process.env.API_BASE_URL;

if(!apiUrl){
    throw new Error("API_BASE_URL is not defined in environment variables");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = RegisterSchema.safeParse(body);

        if(!parsed.success){
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid registration data",
                    errors: treeifyError(parsed.error)
                }, { status: 400 }
            )
        };

        const backendResponse = await fetch(`${apiUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(parsed.data)
        });

        const data = await backendResponse.json();

        if(!backendResponse.ok){
            return NextResponse.json(
                {
                    success: false,
                    message: data?.message || "Registration failed"
                }, { status: backendResponse.status }
            )
        };

        return NextResponse.json(
            {
                success: true,
                message: data?.message || "Registration successful",
                data
            }, { status: backendResponse.status }
        )        


    } catch(error) {
        return NextResponse.json(
            {
                success: false,
                message: "An error occurred during registration",
                error: error instanceof Error ? error.message : String(error)
            }, { status: 500 }
        );
    }
}