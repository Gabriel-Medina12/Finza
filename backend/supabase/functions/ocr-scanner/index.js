// Supabase Edge Function (Deno) para escanear facturas con Gemini Flash API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Analiza esta imagen de factura física y extrae los siguientes datos en formato JSON estricto:
              {
                "amount": float, (El monto total neto de la compra)
                "currency": "USD" o "VES", (Determinado a partir de los símbolos de bolívares o dólares de la factura)
                "description": string, (Nombre del establecimiento comercial o razón social, ej: Farmatodo)
                "categoryId": "health" | "food" | "rent" | "moto" | "gym" | "barber"
              }
              No incluyas formateo markdown en tu respuesta, solo el JSON puro.`
            },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const outputText = result.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(outputText.trim());

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
