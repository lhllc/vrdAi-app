import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" });

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    return res.status(200).json({ 
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      subscription_status: session.subscription_status
    });
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return res.status(500).json({ error: error.message });
  }
} 