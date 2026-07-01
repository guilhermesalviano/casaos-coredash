export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number | null;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string | null;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  embedUrl: string;
}

export interface SpotifyPlayerResponse {
  connected: boolean;
  track: SpotifyTrack | null;
  devices: SpotifyDevice[];
}

export interface SpotifySearchItem {
  id: string;
  type: "track" | "album" | "playlist";
  name: string;
  subtitle: string;
  imageUrl: string | null;
  uri: string;
  embedUrl: string;
}

export interface SpotifyLibrary {
  playlists: SpotifySearchItem[];
  recentTracks: SpotifySearchItem[];
}

export type SpotifyControlAction =
  | { action: "play" }
  | { action: "pause" }
  | { action: "next" }
  | { action: "prev" }
  | { action: "transfer"; deviceId: string }
  | { action: "play_uri"; uri: string; deviceId?: string };

