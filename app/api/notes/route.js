import { NextResponse } from "next/server";
import notes from "@/lib/data/notes.json";

// GET /api/notes?class=Class 11&search=atom
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const classLevel = searchParams.get("class");
  const search = (searchParams.get("search") || "").toLowerCase().trim();

  let result = notes;

  if (classLevel) {
    result = result.filter((n) => n.class_level === classLevel);
  }

  if (search) {
    result = result.filter(
      (n) =>
        n.chapter.toLowerCase().includes(search) ||
        n.key_concepts.some((c) => c.toLowerCase().includes(search))
    );
  }

  result = [...result].sort((a, b) => a.order - b.order);

  return NextResponse.json({ count: result.length, notes: result });
}
