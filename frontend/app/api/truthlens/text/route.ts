import { NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${AI_SERVICE_URL}/analyze/text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data?.detail ?? "Text analysis failed." },
                { status: response.status },
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "AI service is unavailable. Start the FastAPI server first." },
            { status: 503 },
        );
    }
}
