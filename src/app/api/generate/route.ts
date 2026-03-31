import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model, max_tokens, system, messages } = body;

    if (!prompt && (!messages || !Array.isArray(messages))) {
      return NextResponse.json({ error: "No prompt or messages provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Anthropic API key" }, { status: 500 });
    }

    const finalMessages = messages || [{ role: "user", content: prompt }];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: Math.min(max_tokens || 4000, 4000), // Asegurar que sea un número válido y limitar a 4000
        system: system || undefined,
        messages: finalMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Anthropic API Error" }, { status: response.status });
    }

    const text = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
