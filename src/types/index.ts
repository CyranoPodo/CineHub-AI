export type MovieStatus = 'watchlist' | 'ignored' | 'watched-liked' | 'watched-disliked';

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate?: string;
  rating?: number;
  imdbRating?: string;
  rottenTomatoes?: string;
  matchScore?: number; // Personalized AI rating
  genres?: string[];
  backdropPath?: string;
  trivia?: string[];
  frames?: string[];
  availableOn?: string[]; // List of platform names where movie is available
}

export interface UserSettings {
  subscriptions: string[]; // e.g. ["Netflix", "Disney+", "Prime Video"]
}

export interface UserInteraction {
  id?: string;
  movieId: string;
  userId: string;
  title: string;
  posterPath: string;
  status: MovieStatus;
  updatedAt: any; // Firestore Timestamp
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: any;
}

export interface MovieList {
  id?: string;
  userId: string;
  name: string;
  movieIds: string[];
  createdAt: any;
}
