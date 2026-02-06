import { NextResponse } from 'next/server';
import { LoginSchema } from '@/app/schemas/auth.schema';
import { treeifyError } from 'zod/v4/core';

const apiUrl = process.env.API_BASE_URL;

if(!apiUrl){
	throw new Error("API_BASE_URL is not defined in environment variables");
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = LoginSchema.safeParse(body);

		if(!parsed.success){
			return NextResponse.json(
				{
					success: false,
					message: "Invalid login data",
					errors: treeifyError(parsed.error)
				}, { status: 400 }
			)
		}

		const backendResponse = await fetch(`${apiUrl}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(parsed.data)
		});

		const data = await backendResponse.json();

		if(!backendResponse.ok){
			return NextResponse.json(
				{
					success: false,
					message: data?.message || "Login failed",
				}, { status: backendResponse.status }
			);
		};

		return NextResponse.json(
			{
				success: true,
				message: "Login successful",
				data
			}, { status: backendResponse.status }
		);

	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "An error occurred during login",
				error: error instanceof Error ? error.message : String(error)
			}, { status: 500 }
		);
	}
};