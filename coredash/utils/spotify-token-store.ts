import fs from "fs";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), ".spotify-token");

export function readSpotifyRefreshToken(): string | null {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8")).refreshToken ?? null;
  } catch {
    return null;
  }
}

export function writeSpotifyRefreshToken(token: string): void {
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ refreshToken: token }), "utf-8");
  } catch (err) {
    console.error("Could not write Spotify token:", err);
  }
}
