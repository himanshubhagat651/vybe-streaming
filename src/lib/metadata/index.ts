import { MetadataProvider } from "./provider";
import { TmdbProvider } from "./tmdb";
import { MockMetadataProvider } from "./mock";

export function getMetadataProvider(): MetadataProvider {
  const tmdb = new TmdbProvider();
  if (tmdb.isConfigured()) {
    return tmdb;
  }
  return new MockMetadataProvider();
}

export * from "./provider";
export * from "./tmdb";
export * from "./mock";
