const { OpenAI } = require("openai");

const ALLOWED_STYLES = ["formal", "professional", "fun", "creative", "minimalist"];
const ALLOWED_AUDIENCES = ["engineering", "product", "leadership", "marketing", "sales", "general", "academic"];
const ALLOWED_COUNTS = ["auto", "5", "8", "10", "15"];
const MAX_TOPIC_LEN = 200;
const MAX_PROMPT_LEN = 2000;

function buildSystemPrompt(style, audience, slideCount) {
  const styleGuides = {
    formal: "Use a highly formal, authoritative tone. Avoid colloquialisms. Use precise, measured language. Structure content with clear hierarchy.",
    professional: "Use a clear, confident, business-appropriate tone. Be concise and data-driven. Use action-oriented language.",
    fun: "Use an upbeat, energetic, conversational tone. Include emoji sparingly. Use vivid metaphors and engaging hooks. Keep it light but informative.",
    creative: "Use an expressive, imaginative tone. Employ unexpected analogies, bold statements, and storytelling techniques. Be visually descriptive.",
    minimalist: "Use an extremely concise, sparse tone. Every word must earn its place. Favor short sentences. Use whitespace conceptually — less is more."
  };

  const audienceGuides = {
    engineering: "Audience: engineers/developers. Use technical depth, include architecture concepts, code-level thinking, and performance considerations. Jargon is fine.",
    product: "Audience: product managers. Focus on user impact, metrics, roadmap, trade-offs. Balance technical detail with business context.",
    leadership: "Audience: executives/leadership. Lead with impact and outcomes. Use strategic framing, KPIs, and ROI. Keep technical details high-level.",
    marketing: "Audience: marketing team. Emphasize messaging, positioning, brand impact, and customer-facing narratives. Use compelling storytelling.",
    sales: "Audience: sales team. Focus on value propositions, competitive advantages, customer pain points, and actionable talking points.",
    general: "Audience: general/mixed. Use accessible language, avoid heavy jargon. Explain concepts clearly. Balance depth with approachability.",
    academic: "Audience: students/academics. Use educational structure, define key terms, provide examples, and build concepts progressively."
  };

  const countInstruction = slideCount === "auto"
    ? "Determine the optimal number of slides (typically 6-12) based on the topic complexity."
    : `Create exactly ${slideCount} slides.`;

  return `You are an expert presentation designer. Create a structured presentation following these guidelines:

STYLE: ${styleGuides[style]}
AUDIENCE: ${audienceGuides[audience]}
SLIDE COUNT: ${countInstruction}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "Presentation title",
  "subtitle": "Brief subtitle",
  "slides": [
    {
      "type": "title",
      "heading": "Main title",
      "content": "Subtitle or tagline",
      "speakerNotes": "Notes for the presenter"
    },
    {
      "type": "content",
      "heading": "Slide heading",
      "content": "Main paragraph or explanatory text",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Notes for the presenter"
    }
  ]
}

Slide types to use:
- "title" — Opening slide with heading + subtitle content. Always first.
- "content" — Standard slide with heading, optional content paragraph, and optional bullets array.
- "two-column" — Slide with heading and exactly 2 items in bullets array (left column, right column text).
- "quote" — Slide with a memorable quote in content and attribution in heading.
- "image-placeholder" — Slide with heading and content describing what image would go here.
- "closing" — Final slide with heading (thank you / call to action) and content. Always last.

Rules:
- First slide MUST be type "title". Last slide MUST be type "closing".
- Use a variety of slide types for visual interest.
- Every slide must have speakerNotes (2-3 sentences of presenter guidance).
- Bullets should have 3-5 items when used.
- Content should be presentation-ready (not placeholder text).
- Keep text concise — presentations are visual, not documents.`;
}

module.exports = async function (context, req) {
  // Validate API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-your-key-here") {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "OpenAI API key is not configured on the server." })
    };
    return;
  }

  // Parse and validate input
  const body = req.body;
  if (!body) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Request body is required." }) };
    return;
  }

  const { topic, prompt, style, audience, slideCount } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Topic is required." }) };
    return;
  }
  if (topic.length > MAX_TOPIC_LEN) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: `Topic must be ${MAX_TOPIC_LEN} characters or less.` }) };
    return;
  }
  if (prompt && prompt.length > MAX_PROMPT_LEN) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: `Prompt must be ${MAX_PROMPT_LEN} characters or less.` }) };
    return;
  }
  if (!ALLOWED_STYLES.includes(style)) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid style value." }) };
    return;
  }
  if (!ALLOWED_AUDIENCES.includes(audience)) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid audience value." }) };
    return;
  }
  if (!ALLOWED_COUNTS.includes(String(slideCount))) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid slide count." }) };
    return;
  }

  // Build the user message
  let userMessage = `Create a presentation about: ${topic.trim()}`;
  if (prompt && prompt.trim().length > 0) {
    userMessage += `\n\nAdditional details: ${prompt.trim()}`;
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildSystemPrompt(style, audience, String(slideCount)) },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "AI returned an empty response. Please try again." })
      };
      return;
    }

    let slideData;
    try {
      slideData = JSON.parse(content);
    } catch {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "AI returned invalid JSON. Please try again." })
      };
      return;
    }

    // Basic validation of returned structure
    if (!slideData.slides || !Array.isArray(slideData.slides) || slideData.slides.length === 0) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "AI returned an invalid presentation structure. Please try again." })
      };
      return;
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slideData)
    };

  } catch (err) {
    const status = err.status || err.statusCode || 500;
    let message = "An unexpected error occurred.";

    if (status === 401) {
      message = "Invalid OpenAI API key configured on the server.";
    } else if (status === 429) {
      message = "Rate limited by OpenAI. Please wait a moment and try again.";
    } else if (status === 400) {
      message = "Bad request to OpenAI API. Please try a different prompt.";
    }

    context.log.error("OpenAI API error:", err.message);

    context.res = {
      status: status === 401 || status === 429 ? status : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: message })
    };
  }
};
