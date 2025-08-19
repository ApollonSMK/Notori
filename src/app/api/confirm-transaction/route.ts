
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
	transaction_id: string;
}

export async function POST(req: NextRequest) {
	const { transaction_id } = (await req.json()) as IRequestPayload;
    const { DEV_PORTAL_API_KEY, APP_ID } = process.env;

    if (!DEV_PORTAL_API_KEY || !APP_ID) {
        return NextResponse.json({ success: false, message: "Server configuration missing." }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://developer.worldcoin.org/api/v2/minikit/transaction/${transaction_id}?app_id=${APP_ID}&type=transaction`,
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
        return NextResponse.json({ success: true, transaction });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}
