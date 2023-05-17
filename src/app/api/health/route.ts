import { NextResponse } from "next/server";

// a health check endpoint
export async function GET(request: Request) {
  return NextResponse.json({name: 'John Doe'})
}
