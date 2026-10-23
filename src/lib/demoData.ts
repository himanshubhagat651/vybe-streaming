import { MediaItem, Genre } from "./types";

export const DEMO_GENRES: Genre[] = [
  { id: "all", name: "All", slug: "all" },
  { id: "action", name: "Action", slug: "action" },
  { id: "sci-fi", name: "Sci-Fi", slug: "sci-fi" },
  { id: "drama", name: "Drama", slug: "drama" },
  { id: "thriller", name: "Thriller", slug: "thriller" },
  { id: "anime", name: "Anime", slug: "anime" },
  { id: "comedy", name: "Comedy", slug: "comedy" },
  { id: "fantasy", name: "Fantasy", slug: "fantasy" },
];

export const DEMO_MEDIA: MediaItem[] = [
  {
    id: "m-693134",
    tmdbId: 693134,
    imdbId: "tt15239678",
    type: "movie",
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    overview:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
    rating: 8.6,
    voteCount: 4890,
    releaseYear: "2024",
    runtime: "2h 46m",
    quality: "4K",
    ageRating: "PG-13",
    genres: ["Sci-Fi", "Action", "Adventure"],
    director: "Denis Villeneuve",
    featured: true,
    trendingRank: 1,
    languageAvailable: ["eng", "hindi", "french"],
    cast: [
      { id: "c-1", name: "Timothée Chalamet", character: "Paul Atreides" },
      { id: "c-2", name: "Zendaya", character: "Chani" },
      { id: "c-3", name: "Rebecca Ferguson", character: "Lady Jessica" },
      { id: "c-4", name: "Javier Bardem", character: "Stilgar" },
      { id: "c-5", name: "Austin Butler", character: "Feyd-Rautha" },
    ],
  },
  {
    id: "m-157336",
    tmdbId: 157336,
    imdbId: "tt0816692",
    type: "movie",
    title: "Interstellar",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80",
    rating: 8.7,
    voteCount: 34500,
    releaseYear: "2014",
    runtime: "2h 49m",
    quality: "4K",
    ageRating: "PG-13",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    director: "Christopher Nolan",
    trendingRank: 2,
    languageAvailable: ["eng", "hindi"],
    cast: [
      { id: "c-6", name: "Matthew McConaughey", character: "Joseph Cooper" },
      { id: "c-7", name: "Anne Hathaway", character: "Dr. Amelia Brand" },
      { id: "c-8", name: "Jessica Chastain", character: "Murphy Cooper" },
      { id: "c-9", name: "Michael Caine", character: "Professor Brand" },
    ],
  },
  {
    id: "tv-94605",
    tmdbId: 94605,
    imdbId: "tt11126994",
    type: "tv",
    title: "Arcane",
    tagline: "Every legend has a beginning.",
    overview:
      "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    rating: 9.0,
    voteCount: 15200,
    releaseYear: "2021",
    runtime: "2 Seasons",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Animation", "Sci-Fi", "Action", "Anime"],
    director: "Christian Linke, Alex Yee",
    trendingRank: 3,
    languageAvailable: ["eng", "french", "hindi"],
    cast: [
      { id: "c-10", name: "Hailee Steinfeld", character: "Vi" },
      { id: "c-11", name: "Ella Purnell", character: "Jinx" },
      { id: "c-12", name: "Katie Leung", character: "Caitlyn Kiramman" },
      { id: "c-13", name: "Kevin Alejandro", character: "Jayce Talis" },
    ],
    seasons: [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 9,
        episodes: [
          {
            episodeNumber: 1,
            title: "Welcome to the Playground",
            overview: "Orphaned sisters Vi and Powder bring trouble to Zaun's underground streets following a heist in posh Piltover.",
            duration: "43m",
            thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 2,
            title: "Some Mysteries Are Better Left Unsolved",
            overview: "Idealistic inventor Jayce attempts to harness arcane magic with science despite warnings from his mentor.",
            duration: "41m",
            thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 3,
            title: "The Base Violence Necessary for Change",
            overview: "An epic showdown between old rivals results in a fateful moment for Zaun. Powder faces heartbreak.",
            duration: "44m",
            thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 4,
            title: "Happy Progress Day!",
            overview: "With Piltover prospering on Hextech, Jayce and Viktor weigh their next move while a familiar face resurfaces.",
            duration: "40m",
            thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
      {
        seasonNumber: 2,
        name: "Season 2",
        episodeCount: 9,
        episodes: [
          {
            episodeNumber: 1,
            title: "Heavy Is the Crown",
            overview: "In the wake of disaster, Piltover mobilizes as tensions between the twin cities reach a boiling point.",
            duration: "45m",
            thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 2,
            title: "Watch It All Burn",
            overview: "Old allies form desperate pacts as the shimmer cartel undergoes ruthless internal transformation.",
            duration: "43m",
            thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "tv-1396",
    tmdbId: 1396,
    imdbId: "tt0903747",
    type: "tv",
    title: "Breaking Bad",
    tagline: "All hail the king.",
    overview:
      "Walter White, a New Mexico chemistry teacher diagnosed with terminal lung cancer, teams up with former student Jesse Pinkman to manufacture and sell crystal meth in order to secure his family's financial future.",
    posterUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80",
    rating: 9.5,
    voteCount: 142000,
    releaseYear: "2008",
    runtime: "5 Seasons",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Drama", "Crime", "Thriller"],
    director: "Vince Gilligan",
    trendingRank: 4,
    languageAvailable: ["eng", "hindi"],
    cast: [
      { id: "c-14", name: "Bryan Cranston", character: "Walter White" },
      { id: "c-15", name: "Aaron Paul", character: "Jesse Pinkman" },
      { id: "c-16", name: "Anna Gunn", character: "Skyler White" },
      { id: "c-17", name: "Dean Norris", character: "Hank Schrader" },
    ],
    seasons: [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 7,
        episodes: [
          {
            episodeNumber: 1,
            title: "Pilot",
            overview: "When an unassuming chemistry teacher discovers he has cancer, he decides to start cooking meth.",
            duration: "58m",
            thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 2,
            title: "Cat's in the Bag...",
            overview: "Walt and Jesse attempt to dispose of two bodies, leaving a chaotic chemical aftermath.",
            duration: "48m",
            thumbnailUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 3,
            title: "...And the Bag's in the River",
            overview: "Walt wrestles with a grim moral dilemma while keeping captive dealer Krazy-8 in Jesse's basement.",
            duration: "48m",
            thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "m-27205",
    tmdbId: 27205,
    imdbId: "tt1375666",
    type: "movie",
    title: "Inception",
    tagline: "Your mind is the scene of the crime.",
    overview:
      "Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    posterUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
    rating: 8.4,
    voteCount: 36000,
    releaseYear: "2010",
    runtime: "2h 28m",
    quality: "4K",
    ageRating: "PG-13",
    genres: ["Sci-Fi", "Action", "Thriller"],
    director: "Christopher Nolan",
    trendingRank: 5,
    languageAvailable: ["eng", "hindi"],
    cast: [
      { id: "c-18", name: "Leonardo DiCaprio", character: "Dom Cobb" },
      { id: "c-19", name: "Joseph Gordon-Levitt", character: "Arthur" },
      { id: "c-20", name: "Elliot Page", character: "Ariadne" },
      { id: "c-21", name: "Tom Hardy", character: "Eames" },
    ],
  },
  {
    id: "tv-105248",
    tmdbId: 105248,
    imdbId: "tt12590266",
    type: "tv",
    title: "Cyberpunk: Edgerunners",
    tagline: "Night City will eat you alive.",
    overview:
      "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner: a mercenary outlaw also known as a cyberpunk.",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80",
    rating: 8.6,
    voteCount: 4200,
    releaseYear: "2022",
    runtime: "1 Season",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Anime", "Action", "Sci-Fi"],
    director: "Hiroyuki Imaishi",
    trendingRank: 6,
    languageAvailable: ["eng", "japanese"],
    cast: [
      { id: "c-22", name: "KENN", character: "David Martinez" },
      { id: "c-23", name: "Aoi Yuuki", character: "Lucy" },
      { id: "c-24", name: "Hiroki Touchi", character: "Maine" },
    ],
    seasons: [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 10,
        episodes: [
          {
            episodeNumber: 1,
            title: "Let You Down",
            overview: "David Martinez endures the harsh reality of Santo Domingo until tragedy forces him into chrome.",
            duration: "24m",
            thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
          },
          {
            episodeNumber: 2,
            title: "Like a Boy",
            overview: "David tests his newly implanted Sandevistan on the mean streets and crosses paths with a mysterious netrunner.",
            duration: "25m",
            thumbnailUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "tv-1429",
    tmdbId: 1429,
    type: "tv",
    title: "Attack on Titan",
    tagline: "To defeat monsters, we must become them.",
    overview:
      "Several hundred years ago, humans were nearly exterminated by giants. Giants are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather than as a food source. A small percentage of humanity survived by enclosing themselves in a city protected by extremely high walls.",
    posterUrl: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/8BQX7YkM1Qe5D9V33x5C24P033n.jpg",
    rating: 9.0,
    voteCount: 16500,
    releaseYear: "2013",
    runtime: "4 Seasons",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Anime", "Action", "Fantasy", "Sci-Fi"],
    director: "Tetsurō Araki",
    trendingRank: 4,
    languageAvailable: ["eng", "japanese", "french", "hindi"],
    cast: [
      { id: "c-aot1", name: "Yuki Kaji", character: "Eren Yeager" },
      { id: "c-aot2", name: "Yui Ishikawa", character: "Mikasa Ackerman" },
      { id: "c-aot3", name: "Marina Inoue", character: "Armin Arlert" },
      { id: "c-aot4", name: "Hiroshi Kamiya", character: "Levi Ackerman" },
    ],
    seasons: [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 25,
        episodes: [
          {
            episodeNumber: 1,
            title: "To You, in 2000 Years: The Fall of Shiganshina, Part 1",
            overview: "After 100 years of peace, humanity is suddenly reminded of the terror of being at the Titans' mercy.",
            duration: "24m",
            thumbnailUrl: "https://image.tmdb.org/t/p/w1280/8BQX7YkM1Qe5D9V33x5C24P033n.jpg",
          },
          {
            episodeNumber: 2,
            title: "That Day: The Fall of Shiganshina, Part 2",
            overview: "Eren vows to wipe out every last Titan following Shiganshina's breach.",
            duration: "24m",
            thumbnailUrl: "https://image.tmdb.org/t/p/w1280/8BQX7YkM1Qe5D9V33x5C24P033n.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "tv-85937",
    tmdbId: 85937,
    type: "tv",
    title: "Demon Slayer: Kimetsu no Yaiba",
    tagline: "Sword in hand, slay the despair.",
    overview:
      "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Tanjiro resolves to become a demon slayer so he can turn his sister back into a human and kill the demon that massacred his family.",
    posterUrl: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/nTvM4mhqZlHIvUkI1gVnWumrSlq.jpg",
    rating: 8.7,
    voteCount: 14100,
    releaseYear: "2019",
    runtime: "4 Seasons",
    quality: "4K",
    ageRating: "TV-14",
    genres: ["Anime", "Action", "Fantasy", "Adventure"],
    director: "Haruo Sotozaki",
    trendingRank: 5,
    languageAvailable: ["eng", "japanese", "hindi"],
    cast: [
      { id: "c-ds1", name: "Natsuki Hanae", character: "Tanjiro Kamado" },
      { id: "c-ds2", name: "Akari Kito", character: "Nezuko Kamado" },
      { id: "c-ds3", name: "Hiro Shimono", character: "Zenitsu Agatsuma" },
      { id: "c-ds4", name: "Yoshitsugu Matsuoka", character: "Inosuke Hashibira" },
    ],
    seasons: [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 26,
        episodes: [
          {
            episodeNumber: 1,
            title: "Cruelty",
            overview: "Tanjiro Kamado's peaceful life changes forever when his family is attacked by a demon.",
            duration: "24m",
            thumbnailUrl: "https://image.tmdb.org/t/p/w1280/nTvM4mhqZlHIvUkI1gVnWumrSlq.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "tv-95479",
    tmdbId: 95479,
    type: "tv",
    title: "Jujutsu Kaisen",
    tagline: "Curse the world or save it.",
    overview:
      "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    posterUrl: "https://image.tmdb.org/t/p/w500/hFWP5HkbVEe40hrXgtCe5xQC64n.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/4fJ8y9vK17mX77rM921D3F8R3uL.jpg",
    rating: 8.6,
    voteCount: 11200,
    releaseYear: "2020",
    runtime: "2 Seasons",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Anime", "Action", "Fantasy", "Supernatural"],
    director: "Sunghoo Park",
    trendingRank: 7,
    languageAvailable: ["eng", "japanese"],
    cast: [
      { id: "c-jjk1", name: "Junya Enoki", character: "Yuji Itadori" },
      { id: "c-jjk2", name: "Yuichi Nakamura", character: "Satoru Gojo" },
      { id: "c-jjk3", name: "Yuma Uchida", character: "Megumi Fushiguro" },
    ],
    seasons: [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 24,
        episodes: [
          {
            episodeNumber: 1,
            title: "Ryomen Sukuna",
            overview: "Yuji Itadori swallows a cursed talisman to save his friends.",
            duration: "24m",
            thumbnailUrl: "https://image.tmdb.org/t/p/w1280/4fJ8y9vK17mX77rM921D3F8R3uL.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "tv-13916",
    tmdbId: 13916,
    type: "tv",
    title: "Death Note",
    tagline: "The human whose name is written in this note shall die.",
    overview:
      "Light Yagami is an ace student with great prospects, who's bored out of his mind. One day he finds the 'Death Note': a notebook dropped by a rogue Shinigami death god. Any human whose name is written in the notebook dies, and Light has vowed to use the power of the Death Note to rid the world of evil.",
    posterUrl: "https://image.tmdb.org/t/p/w500/tC78Pck2YCsUAtEdZwuHYUFYtOj.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/iJ2pY5t4gP9v3t4P8a2Y7z4u4Q8.jpg",
    rating: 8.6,
    voteCount: 18400,
    releaseYear: "2006",
    runtime: "1 Season",
    quality: "1080p",
    ageRating: "TV-14",
    genres: ["Anime", "Mystery", "Thriller", "Supernatural"],
    director: "Tetsurō Araki",
    trendingRank: 9,
    languageAvailable: ["eng", "japanese", "french"],
    cast: [
      { id: "c-dn1", name: "Mamoru Miyano", character: "Light Yagami" },
      { id: "c-dn2", name: "Kappei Yamaguchi", character: "L" },
    ],
  },
  {
    id: "tv-209867",
    tmdbId: 209867,
    type: "tv",
    title: "Solo Leveling",
    tagline: "Only I level up.",
    overview:
      "They say whatever doesn't kill you makes you stronger, but that's not the case for the world's weakest hunter Sung Jinwoo. After being brutally slaughtered by monsters in a high-ranking dungeon, Jinwoo came back with the System, a program only he can see, that's leveling him up in every way.",
    posterUrl: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuClJknQd7.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/4fF81t4v8tV29t4y8F827h9k2L.jpg",
    rating: 8.6,
    voteCount: 3800,
    releaseYear: "2024",
    runtime: "1 Season",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Anime", "Action", "Fantasy", "Sci-Fi"],
    director: "Shunsuke Nakashige",
    trendingRank: 2,
    languageAvailable: ["eng", "japanese", "hindi"],
    cast: [
      { id: "c-sl1", name: "Taito Ban", character: "Sung Jinwoo" },
      { id: "c-sl2", name: "Genta Nakamura", character: "Yoo Jinho" },
    ],
  },
  {
    id: "tv-114410",
    tmdbId: 114410,
    type: "tv",
    title: "Chainsaw Man",
    tagline: "Tear through the darkness.",
    overview:
      "Denji is a young man who works as a Devil Hunter with Pochita, the 'Chainsaw Devil'. While living his miserable life paying off debts he inherited from his parents, he gets betrayed and killed. But as he's losing consciousness, Pochita makes a contract with Denji, and he revives as 'Chainsaw Man'.",
    posterUrl: "https://image.tmdb.org/t/p/w500/npdB6eFz43J7AlvxagFUHp3L2io.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/wFjBoEos19SV5rdv24v20k85n.jpg",
    rating: 8.4,
    voteCount: 4600,
    releaseYear: "2022",
    runtime: "1 Season",
    quality: "4K",
    ageRating: "TV-MA",
    genres: ["Anime", "Action", "Horror", "Supernatural"],
    director: "Ryu Nakayama",
    trendingRank: 8,
    languageAvailable: ["eng", "japanese"],
    cast: [
      { id: "c-cm1", name: "Kikunosuke Toya", character: "Denji" },
      { id: "c-cm2", name: "Tomori Kusunoki", character: "Makima" },
    ],
  },
  {
    id: "m-129",
    tmdbId: 129,
    type: "movie",
    title: "Spirited Away",
    tagline: "The tunnel led to a mysterious spirit world.",
    overview:
      "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    posterUrl: "https://image.tmdb.org/t/p/w500/393mh1AJ0GYWVD7DesqY95qnvAc.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia99GQI.jpg",
    rating: 8.5,
    voteCount: 16200,
    releaseYear: "2001",
    runtime: "2h 5m",
    quality: "4K",
    ageRating: "PG",
    genres: ["Anime", "Animation", "Family", "Fantasy"],
    director: "Hayao Miyazaki",
    trendingRank: 10,
    languageAvailable: ["eng", "japanese", "french"],
    cast: [
      { id: "c-sa1", name: "Rumi Hiiragi", character: "Chihiro Ogino" },
      { id: "c-sa2", name: "Miyu Irino", character: "Haku" },
    ],
  },
  {
    id: "m-372058",
    tmdbId: 372058,
    type: "movie",
    title: "Your Name.",
    tagline: "I am looking for you, whom I have never met.",
    overview:
      "High schoolers Mitsuha and Taki are complete strangers living separate lives in Tokyo and rural Japan. But when they suddenly swap bodies, a bizarre connection forms between them that transcends time and space.",
    posterUrl: "https://image.tmdb.org/t/p/w500/q719jXXEzvNyfqiaS1mD9alj1p.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/dIWwZW7dJJ1q499NVWpvLJvzyJJ.jpg",
    rating: 8.5,
    voteCount: 11400,
    releaseYear: "2016",
    runtime: "1h 46m",
    quality: "4K",
    ageRating: "PG",
    genres: ["Anime", "Romance", "Drama", "Fantasy"],
    director: "Makoto Shinkai",
    trendingRank: 11,
    languageAvailable: ["eng", "japanese"],
    cast: [
      { id: "c-yn1", name: "Ryunosuke Kamiki", character: "Taki Tachibana" },
      { id: "c-yn2", name: "Mone Kamishiraishi", character: "Mitsuha Miyamizu" },
    ],
  },
  {
    id: "m-550",
    tmdbId: 550,
    imdbId: "tt0137523",
    type: "movie",
    title: "Fight Club",
    tagline: "Mischief. Mayhem. Soap.",
    overview:
      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground 'fight clubs' forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
    posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80",
    rating: 8.4,
    voteCount: 28400,
    releaseYear: "1999",
    runtime: "2h 19m",
    quality: "1080p",
    ageRating: "R",
    genres: ["Drama", "Thriller"],
    director: "David Fincher",
    trendingRank: 7,
    languageAvailable: ["eng", "hindi"],
    cast: [
      { id: "c-25", name: "Edward Norton", character: "The Narrator" },
      { id: "c-26", name: "Brad Pitt", character: "Tyler Durden" },
      { id: "c-27", name: "Helena Bonham Carter", character: "Marla Singer" },
    ],
  },
  {
    id: "m-10195",
    tmdbId: 10195,
    imdbId: "tt0371746",
    type: "movie",
    title: "Iron Man",
    tagline: "Heroes aren't born. They're built.",
    overview:
      "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil and vows to protect the world as Iron Man.",
    posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1920&q=80",
    rating: 7.9,
    voteCount: 25100,
    releaseYear: "2008",
    runtime: "2h 6m",
    quality: "4K",
    ageRating: "PG-13",
    genres: ["Action", "Sci-Fi", "Adventure"],
    director: "Jon Favreau",
    trendingRank: 8,
    languageAvailable: ["eng", "hindi"],
    cast: [
      { id: "c-28", name: "Robert Downey Jr.", character: "Tony Stark / Iron Man" },
      { id: "c-29", name: "Gwyneth Paltrow", character: "Pepper Potts" },
      { id: "c-30", name: "Jeff Bridges", character: "Obadiah Stane" },
    ],
  },
];

export function getFeaturedMedia(): MediaItem {
  return DEMO_MEDIA.find((m) => m.featured) || DEMO_MEDIA[0];
}

export function getTrendingMovies(): MediaItem[] {
  return DEMO_MEDIA.filter((m) => m.type === "movie");
}

export function getTrendingSeries(): MediaItem[] {
  return DEMO_MEDIA.filter((m) => m.type === "tv");
}

export function getAllAnime(): MediaItem[] {
  return DEMO_MEDIA.filter((m) =>
    m.genres.some((g) => g.toLowerCase() === "anime")
  );
}

export function getMediaByGenre(genre: string): MediaItem[] {
  if (genre.toLowerCase() === "all") return DEMO_MEDIA;
  return DEMO_MEDIA.filter((m) =>
    m.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
  );
}

export function getMediaById(id: string): MediaItem | undefined {
  return DEMO_MEDIA.find((m) => m.id === id || String(m.tmdbId) === id);
}

export function getMediaByTmdbId(tmdbId: number, type?: string): MediaItem | undefined {
  return DEMO_MEDIA.find((m) => m.tmdbId === tmdbId && (!type || m.type === type));
}

export function searchMedia(query: string, genreSlug?: string): MediaItem[] {
  let list = DEMO_MEDIA;
  if (genreSlug && genreSlug !== "all") {
    list = list.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === genreSlug.toLowerCase())
    );
  }
  if (!query.trim()) return list;

  const q = query.toLowerCase().trim();
  return list.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.overview && m.overview.toLowerCase().includes(q)) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.cast.some((c) => c.name.toLowerCase().includes(q))
  );
}
