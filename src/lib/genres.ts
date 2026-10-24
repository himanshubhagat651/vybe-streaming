export interface GenreDef {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const ALL_GENRES: GenreDef[] = [
  { id: "all", name: "All Genres", slug: "all", icon: "🎬", description: "All entertainment catalog" },
  { id: "action", name: "Action", slug: "action", icon: "💥", description: "Adrenaline, martial arts & stunts" },
  { id: "comedy", name: "Comedy", slug: "comedy", icon: "😂", description: "Laughs, sitcoms & satire" },
  { id: "drama", name: "Drama", slug: "drama", icon: "🎭", description: "Emotional storytelling & character journeys" },
  { id: "sci-fi", name: "Sci-Fi", slug: "sci-fi", icon: "🚀", description: "Futuristic sagas, space & technology" },
  { id: "thriller", name: "Thriller", slug: "thriller", icon: "🔪", description: "Suspense & edge-of-seat tension" },
  { id: "horror", name: "Horror", slug: "horror", icon: "👻", description: "Supernatural, chills & psychological fear" },
  { id: "romance", name: "Romance", slug: "romance", icon: "❤️", description: "Love stories, rom-coms & passion" },
  { id: "anime", name: "Anime", slug: "anime", icon: "🏮", description: "Japanese animation & shonen sagas" },
  { id: "fantasy", name: "Fantasy", slug: "fantasy", icon: "🧙", description: "Mythical realms, magic & epic lore" },
  { id: "adventure", name: "Adventure", slug: "adventure", icon: "🗺️", description: "Quests, expeditions & journeys" },
  { id: "crime", name: "Crime", slug: "crime", icon: "🕵️", description: "Detectives, heists & underworlds" },
  { id: "mystery", name: "Mystery", slug: "mystery", icon: "🔍", description: "Puzzles, whodunits & intrigue" },
  { id: "animation", name: "Animation", slug: "animation", icon: "✨", description: "Animated features & family classics" },
  { id: "documentary", name: "Documentary", slug: "documentary", icon: "🌍", description: "Real world stories, nature & history" },
  { id: "family", name: "Family", slug: "family", icon: "👨‍👩‍👧", description: "Fun for viewers of all ages" },
  { id: "war", name: "War & Military", slug: "war", icon: "⚔️", description: "Battlefield epics & military history" },
  { id: "music", name: "Music", slug: "music", icon: "🎵", description: "Musicals, concerts & rhythm" },
];

export function getGenreBySlug(slug: string): GenreDef | undefined {
  return ALL_GENRES.find((g) => g.slug.toLowerCase() === slug.toLowerCase());
}
