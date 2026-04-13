import { NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000";
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export async function POST(request: Request) {
    try {
        const incoming = await request.formData();
        const file = incoming.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }

        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!file.type.startsWith("image/") || !ALLOWED_IMAGE_EXT.has(ext)) {
            return NextResponse.json(
                { error: "Unsupported file type. Only .jpg, .jpeg, .png, and .webp are allowed." },
                { status: 400 },
            );
        }

        const outgoing = new FormData();
        outgoing.append("file", file, file.name);

        const response = await fetch(`${AI_SERVICE_URL}/analyze/file`, {
            method: "POST",
            body: outgoing,
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data?.detail ?? "File analysis failed." },
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
