import { MetadataProvider } from "./provider";
import { TmdbProvider } from "./tmdb";
import { ScreenScapeProvider } from "./screenscape";
import { MockMetadataProvider } from "./mock";

export function getMetadataProvider(): MetadataProvider {
  const tmdb = new TmdbProvider();
  if (tmdb.isConfigured()) {
    return tmdb;
  }
  // Default to live ScreenScape catalog & search provider
  return new ScreenScapeProvider();
}

export * from "./provider";
export * from "./tmdb";
export * from "./screenscape";
export * from "./mock";
