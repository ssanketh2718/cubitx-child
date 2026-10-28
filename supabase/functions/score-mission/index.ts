
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve((req: Request): Response => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        status: "method_not_allowed",
        message: "Only POST requests are accepted.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        status: "unauthorized",
        message: "A valid authorization header is required.",
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Scoring remains disabled pending security and evidence review.
  // Do not write scores or trust client-supplied scoring decisions.
  return new Response(
    JSON.stringify({
      status: "pending_review",
      message: "Mission scoring is temporarily unavailable pending review.",
    }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});
