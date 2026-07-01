/**
 * PLANNING FOR OPENAI SERVICE:
 * 1. Read the OPENAI_API_KEY from environment variables.
 * 2. If the API key is missing, immediately fail-safe by returning fallback values without making network calls.
 * 3. Use standard fetch() to invoke the OpenAI Chat Completions API with gpt-4o-mini.
 * 4. Implement strict timeout and try-catch handling to ensure UI interactions remain responsive.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Suggests an expense category based on the provided description.
 * Expected categories: "software", "travel", "equipment", "marketing", "other"
 */
export async function suggestExpenseCategory(description: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    console.warn("OpenAI API key is missing. Skipping category suggestion.");
    return "other";
  }

  if (!description || description.trim() === "") {
    return "other";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout limit

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that categorizes business expenses. You must respond with EXACTLY one of the following category strings: 'software', 'travel', 'equipment', 'marketing', 'other'. Do not include any punctuation, quotes, uppercase letters, or additional explanation.",
          },
          {
            role: "user",
            content: `Categorize this expense: "${description}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data?.choices?.[0]?.message?.content?.trim()?.toLowerCase();

    const validCategories = ["software", "travel", "equipment", "marketing", "other"];
    if (suggestion && validCategories.includes(suggestion)) {
      return suggestion;
    }

    return "other";
  } catch (error) {
    console.error("suggestExpenseCategory error:", error);
    return "other"; // Default graceful fallback
  }
}

/**
 * Polishes rough freelancer notes into a professional invoice line-item description.
 */
export async function polishInvoiceLineItemDescription(roughNotes: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    console.warn("OpenAI API key is missing. Skipping line item polishing.");
    return roughNotes;
  }

  if (!roughNotes || roughNotes.trim() === "") {
    return roughNotes;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout limit

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional copywriter. Rewrite the user's rough notes into a concise, professional invoice line-item description (max 100 characters). Respond with ONLY the polished text. Do not add quotes, introductions, bullet points, or sign-offs.",
          },
          {
            role: "user",
            content: `Rough notes: "${roughNotes}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    const polished = data?.choices?.[0]?.message?.content?.trim();

    return polished || roughNotes;
  } catch (error) {
    console.error("polishInvoiceLineItemDescription error:", error);
    return roughNotes; // Default graceful fallback
  }
}
