import { MetadataProvider } from "./provider";
import { TmdbProvider } from "./tmdb";
import { MockMetadataProvider } from "./mock";

let cachedProvider: MetadataProvider | null = null;

export function getMetadataProvider(): MetadataProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const tmdb = new TmdbProvider();
  if (tmdb.isConfigured()) {
    cachedProvider = tmdb;
  } else {
    cachedProvider = new MockMetadataProvider();
  }

  return cachedProvider;
}

export * from "./provider";
export * from "./tmdb";
export * from "./mock";
