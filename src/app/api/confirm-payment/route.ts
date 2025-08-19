
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
	transaction_id: string;
    reference: string;
}

export async function POST(req: NextRequest) {
	const { transaction_id, reference } = (await req.json()) as IRequestPayload;
    const { DEV_PORTAL_API_KEY, APP_ID } = process.env;

    if (!DEV_PORTAL_API_KEY || !APP_ID) {
        return NextResponse.json({ success: false, message: "Server configuration missing." }, { status: 500 });
    }

    // In a real app, you must fetch the reference from your database that you stored
    // in /api/initiate-payment and verify it matches the one from the request.
    // This prevents replay attacks.
    // const storedReference = await getReferenceFromDB(userSession.id);
    // if (reference !== storedReference) {
    //     return NextResponse.json({ success: false, message: "Invalid reference ID." }, { status: 400 });
    // }

    try {
        const response = await fetch(
            `https://developer.worldcoin.org/api/v2/minikit/transaction/${transaction_id}?app_id=${APP_ID}&type=payment`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${DEV_PORTAL_API_KEY}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API Error: ${response.statusText}`);
        }

        const transaction = await response.json();

        // Optimistically confirm if mined or pending, but not failed.
        // For critical transactions, you should poll this endpoint until status is 'mined'.
        if (transaction.reference === reference && transaction.status !== 'failed') {
            // Here, you would update your database to mark the purchase as complete.
            console.log("Payment confirmed for reference:", reference);
			return NextResponse.json({ success: true, status: transaction.status });
		} else {
            console.error("Payment confirmation failed:", transaction);
			return NextResponse.json({ success: false, status: transaction.status, message: "Transaction failed or reference mismatch." });
		}
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}
