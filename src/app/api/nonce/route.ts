
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Generates a random nonce for SIWE
function generateNonce() {
    const nonce = crypto.randomUUID().replace(/-/g, "");
    return nonce;
}

export function GET(req: NextRequest) {
    const nonce = generateNonce();
    // The nonce should be stored somewhere that is not tamperable by the client
    // We use a secure, http-only cookie here.
    cookies().set("siwe-nonce", nonce, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
    });
    return NextResponse.json({ nonce });
}
