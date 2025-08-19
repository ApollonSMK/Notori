
import { NextRequest, NextResponse } from 'next/server';

// MOCK: Replace with actual verifyCloudProof from '@worldcoin/minikit-js'
async function verifyCloudProof(payload: any, app_id: string, action: string, signal: string) {
    console.log("Verifying cloud proof with:", { payload, app_id, action, signal });
    // This is a mock verification. In a real app, this would call the World ID cloud service.
    // The service would validate the proof, merkle_root, and nullifier_hash.
    if (payload.proof && payload.merkle_root && payload.nullifier_hash) {
        // And if the nullifier hasn't been used for this action before
        return { success: true, detail: "Verification successful." };
    }
    return { success: false, code: "invalid_proof", detail: "The provided proof was invalid." };
}

interface IRequestPayload {
    payload: {
        proof: string;
        merkle_root: string;
        nullifier_hash: string;
        verification_level: string;
    };
    action: string;
    signal: string;
}

export async function POST(req: NextRequest) {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    
    // These should come from your environment variables for security
    const app_id = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`;
    
    if (!app_id) {
        return NextResponse.json({ success: false, detail: "App ID is not configured." }, { status: 500 });
    }

    try {
        const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

        if (verifyRes.success) {
            // Proof is valid. Here you can perform backend actions like:
            // - Marking the user as verified in your database
            // - Associating the nullifier_hash with the user's account for sybil resistance
            return NextResponse.json({ success: true, detail: "Successfully verified." }, { status: 200 });
        } else {
            // Proof is invalid or has been used before
            return NextResponse.json(verifyRes, { status: 400 });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ success: false, detail: `Internal server error: ${errorMessage}` }, { status: 500 });
    }
}
