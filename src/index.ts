/**
 * OINIO Soul Proxy - Sovereign Oracle on Cloudflare Edge
 * 
 * The Conscience Layer for the decentralized web.
 * Every agent, regardless of stack, can consult this universal source of truth.
 */

import { evaluate, guardianCheck, resonanceHash } from './sdk-logic';

export default {
  async fetch(request: Request): Promise<Response> {
    // 1. Handle CORS for public accessibility
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      let intent = "";
      let actor = "anonymous";

      // 2. Accept intent via GET (quick testing) or POST (for agents)
      if (request.method === "POST") {
        const body = await request.json();
        intent = body.intent || "";
        actor = body.actor || "anonymous";
      } else {
        const url = new URL(request.url);
        intent = url.searchParams.get("intent") || "";
        actor = url.searchParams.get("actor") || "anonymous";
      }

      if (!intent) {
        return new Response(
          JSON.stringify({ 
            error: "No intent provided.",
            usage: "POST / { intent: string } or GET ?intent=..."
          }), 
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // 3. Execute the Conscience Layer
      const result = await evaluate({ intent, actor });
      const check = await guardianCheck({ intent, actor });
      const sigil = resonanceHash(result);

      // 4. Return the Resonance Response
      return new Response(
        JSON.stringify({
          status: check.approved ? "AUTHORIZED" : "VETOED",
          score: result.resonanceScore.toFixed(2),
          alignment: result.alignment.toUpperCase(),
          reason: result.reasoning,
          sigil: sigil,
          actor: actor,
          intent: intent.slice(0, 100) + (intent.length > 100 ? "..." : "")
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-OINIO-Version": "0.0.1"
          }
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Resonance failure." }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
};
