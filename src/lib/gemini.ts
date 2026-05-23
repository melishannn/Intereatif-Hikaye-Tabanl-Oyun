export const generateEvent = async () => {};

export const generateAIFanComment = async (
  stats: any,
  context: string,
): Promise<any> => {
  try {
    const prompt = `
      You are a fan of an idol in an idol simulator game.
      Player stats: Success: ${stats.success}, Resilience: ${stats.resilience}, Talent: ${stats.talent}, Health: ${stats.health}.
      The player just did: "${context}".
      Generate a single, realistic, short social media comment about this.
      Return ONLY a JSON object with this format exactly: {"user": "@username", "text": "comment text", "isPositive": boolean}.
      No markdown, no extra text, no escaping.
    `;

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text response");

    return JSON.parse(text);
  } catch (e) {
    console.warn("Failed to generate AI comment, falling back", e);
    return {
      user: "@fan_default",
      text: "Vay canına, çok etkileyici!",
      isPositive: true,
    };
  }
};

export const generateAIDM = async (
  stats: any,
  milestone: string,
): Promise<any> => {
  try {
    const prompt = `
      You are a passionate fan DMing an idol in an idol simulator game.
      The player just achieved: "${milestone}".
      Player stats: Success: ${stats.success}, Resilience: ${stats.resilience}, Talent: ${stats.talent}, Health: ${stats.health}.
      Generate a single, realistic, heartfelt DM message.
      Return ONLY a JSON object with this format exactly: {"fan": "@username", "message": "message text"}.
      No markdown, no extra text, no escaping.
    `;

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text response");

    return JSON.parse(text);
  } catch (e) {
    console.warn("Failed to generate AI DM, falling back", e);
    return {
      fan: "@fan_default",
      message: "Harika bir iş başardın, seninle gurur duyuyorum!",
    };
  }
};

export const generateAIRivalInteraction = async (
  stats: any,
  event: string,
): Promise<any> => {
  try {
    const prompt = `
      You are a rival idol reacting to another idol in an idol simulator game.
      The player just: "${event}".
      Player stats: Success: ${stats.success}, Resilience: ${stats.resilience}, Talent: ${stats.talent}, Health: ${stats.health}.
      Generate a single, realistic, slightly competitive or jealous social media post.
      Return ONLY a JSON object with this format exactly: {"rival": "Rival Name", "message": "message text"}.
      No markdown, no extra text, no escaping.
    `;

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text response");

    return JSON.parse(text);
  } catch (e) {
    console.warn("Failed to generate AI Rival Interaction, falling back", e);
    return {
      rival: "Rakip İdol",
      message: "Başarın ilginç ama seni geçmem an meselesi.",
    };
  }
};
