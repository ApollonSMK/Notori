
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // Generate a unique reference for the transaction
	const reference = crypto.randomUUID().replace(/-/g, '');

	// In a real application, you would store this reference ID in your database
    // associated with the user and the intended purchase.
    // This is crucial for backend verification in the next step.
    console.log(`Initiated payment with reference: ${reference}`);

	return NextResponse.json({ reference });
}
