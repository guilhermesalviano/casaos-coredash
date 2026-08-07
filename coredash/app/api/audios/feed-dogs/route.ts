import { readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const dir = join(process.cwd(), "public", "audios", "feed-dogs");
  const files = readdirSync(dir).filter((file) => /\.mp3$/i.test(file));

  return NextResponse.json(files.map((file) => `/audios/feed-dogs/${file}`));
}