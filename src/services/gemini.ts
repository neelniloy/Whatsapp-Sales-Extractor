import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// In Vite, environment variables must be prefixed with VITE_ and accessed via import.meta.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
const MODEL_NAME = "gemini-2.5-flash";

let genAI: GoogleGenAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenAI({ apiKey: API_KEY });
}

const SYSTEM_INSTRUCTION = `
You are a strict financial data extraction engine.

Your task:
Extract confirmed business transactions from WhatsApp chat messages.

CRITICAL DEFINITIONS:
A "transaction" exists ONLY IF:
- The customer explicitly confirms an order (e.g. "ok", "den", "confirm", "both", "done"), AND
- A total amount is explicitly stated OR can be directly inferred from stated quantity × unit price.

DO NOT extract a transaction if:
- Price is mentioned but order is not confirmed.
- Order is discussed but total amount is missing.
- Customer says "pore janabo", "dekhi", "confirm kori nai".
- Amount is referenced indirectly (e.g. "same as last time").
- Seller sends amount before customer confirmation.

PAYMENT STATUS RULES (VERY IMPORTANT):
- Mark PAID ONLY IF messages clearly state payment is completed ("payment done", "paid", "send").
- Mark PARTIAL ONLY IF partial/advance payment is clearly stated AND total amount is known.
- Mentions like "ss pathalam", "check koren" are NOT proof of payment.
- If unsure, ALWAYS use UNKNOWN.

MULTIPLE TRANSACTIONS:
- Do NOT merge transactions from different dates.
- Do NOT merge transactions from different customers.
- Same customer on different days = separate transactions.

LANGUAGE:
- Messages may be Bangla, English, or mixed.
- Emojis and slang are common.
- Ignore greetings, follow-ups, and noise.

OUTPUT RULES:
- Output VALID JSON ONLY.
- Do NOT include explanations.
- Do NOT guess missing data.
- If information is unclear, use null.
- If no valid transaction exists, return an empty JSON array.

For each transaction, extract:
- customer_name (string)
- order_description (string)
- amount (number or null)
- currency (BDT, USD, GBP, UNKNOWN)
- transaction_date (YYYY-MM-DD or null)
- payment_status (PAID, DUE, PARTIAL, UNKNOWN)
- partial_amount (number or null) - Extract ONLY if payment_status is PARTIAL.
- unit (number or null) - Extract the quantity of items (e.g., 3 for "3 shirts", 5 for "5 kg").
- confidence_score (0.0–1.0)

This is a data extraction task, NOT a summarization task.
Accuracy is more important than completeness.
`;

const transactionSchema = {
  type: Type.OBJECT,
  properties: {
    customer_name: { type: Type.STRING, nullable: true },
    order_description: { type: Type.STRING, nullable: true },
    amount: { type: Type.NUMBER, nullable: true },
    currency: { type: Type.STRING, enum: ["BDT", "USD", "GBP", "UNKNOWN"] },
    transaction_date: { type: Type.STRING, nullable: true },
    payment_status: { type: Type.STRING, enum: ["PAID", "DUE", "PARTIAL", "UNKNOWN"] },
    partial_amount: { type: Type.NUMBER, nullable: true },
    unit: { type: Type.NUMBER, nullable: true },
    confidence_score: { type: Type.NUMBER },
  },
  required: ["currency", "payment_status", "confidence_score"],
};

export async function extractTransactions(chatLog: string): Promise<Transaction[]> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: API_KEY });
  }

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: chatLog,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: transactionSchema,
        },
      },
    });

    const responseText = response.text;
    if (!responseText) return [];
    
    // Sanitize: Remove markdown code blocks if present
    const sanitizedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

    return JSON.parse(sanitizedText) as Transaction[];
  } catch (error: any) {
    console.error("Extraction error:", error);
    // Return a more user-friendly error message if possible
    if (error.message?.includes('API key')) {
      throw new Error("Gemini API Key is invalid or missing. Please check your settings.");
    }
    if (error.status === 503) {
      throw new Error("The AI service is currently overloaded. Please try again in a moment.");
    }
    throw new Error(error.message || "Failed to process the chat log.");
  }
}
