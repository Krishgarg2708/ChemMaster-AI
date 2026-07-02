import { NextResponse } from "next/server";
import elements from "@/lib/data/elements.json";

// GET /api/elements?search=oxy&category=Halogen
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const category = searchParams.get("category");

  let result = elements;

  if (search) {
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(search) ||
        e.symbol.toLowerCase().includes(search)
    );
  }

  if (category) {
    result = result.filter((e) => e.category === category);
  }

  return NextResponse.json({ count: result.length, elements: result });
}
