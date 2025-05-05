import { NextRequest, NextResponse } from "next/server";
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';

function setCORSHeaders(res: NextResponse) {
  const allowedOrigins = [
    'https://vrdai-web.vercel.app',
    'http://localhost:3000'
  ];
  const origin = allowedOrigins.includes(process.env.NEXT_PUBLIC_SITE_URL || '')
    ? (process.env.NEXT_PUBLIC_SITE_URL || allowedOrigins[0])
    : allowedOrigins[0];

  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization');
  return res;
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  return setCORSHeaders(res);
}

export async function POST(req: NextRequest) {
  // Verify API key
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.API_SECRET_KEY) {
    return setCORSHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return setCORSHeaders(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const { priceId, success_url, cancel_url } = body;

  if (!priceId) {
    return setCORSHeaders(NextResponse.json({ error: "Price ID is required" }, { status: 400 }));
  }

  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      return setCORSHeaders(NextResponse.json({ error: 'Could not get user session.' }, { status: 401 }));
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: success_url,
      cancel_url: cancel_url,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: user.email,
      metadata: {
        userId: user.id
      }
    });

    return setCORSHeaders(NextResponse.json({ url: session.url }));
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return setCORSHeaders(NextResponse.json({ error: error.message }, { status: 500 }));
  }
} 