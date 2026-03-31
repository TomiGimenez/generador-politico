import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Anthropic API key" }, { status: 500 });
    }

    const body = await req.json();

    const { model, max_tokens, system, messages } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Formato de mensaje inválido" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: Math.min(max_tokens, 4000, 8000), // Limitar tokens
        system: system || undefined,
        messages,
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
