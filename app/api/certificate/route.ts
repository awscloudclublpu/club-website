export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json({
		message: 'Use POST /api/certificate/generate or GET /api/certificate/download/[certificate_uid]',
	})
}
