import { readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const dir = join(process.cwd(), "public", "gifs");
  const files = readdirSync(dir).filter((f) => /\.(gif)$/i.test(f));
  return NextResponse.json(files.map((f) => `/gifs/${f}`));
}
