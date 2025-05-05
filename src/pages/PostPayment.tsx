import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function PostPayment() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Read the session_id from URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    // 2. Fetch the session to get customer_email
    fetch(`${process.env.REACT_APP_SITE_API}/api/stripe/session?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setEmail(data.customer_email);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Checking your payment…</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto text-center space-y-6">
      <h1 className="text-2xl font-bold">Thank you for subscribing!</h1>
      {email && <p className="text-gray-400">Receipt sent to <strong>{email}</strong></p>}
      <p>Please sign in with Google to finish setting up your account:</p>
      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: "/dashboard" }
          })
        }
        className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg"
      >
        Sign in with Google
      </button>
      <button
        onClick={() => navigate("/")}
        className="mt-2 text-sm text-gray-400 underline"
      >
        Back to Home
      </button>
    </div>
  );
} 