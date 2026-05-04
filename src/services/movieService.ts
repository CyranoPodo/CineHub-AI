import { GoogleGenAI } from "@google/genai";
import { Movie } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const movieService = {
  async getRecommendations(interests: string, limit: number = 5): Promise<Movie[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Recommend ${limit} movies based on these interests: ${interests}. 
        Return ONLY a JSON array of objects with these keys: 
        - id (string)
        - title (string)
        - overview (string)
        - posterPath (string: MUST be the official high-resolution movie poster URL from TMDB. Use the format: https://image.tmdb.org/t/p/original/POSTER_PATH. Accuracy is critical: ensure the image matches exactly the one on the official TMDB/IMDb page.)
        - releaseDate (string)
        - rating (number 0-10)
        - imdbRating (string: e.g. "8.5/10")
        - rottenTomatoes (string: e.g. "94%")
        - matchScore (number 0-100: YOUR AI estimate of how much the user will like this based on interests: ${interests})
        - genres (string[])
        - availableOn (string[]: Platforms where this movie is available, e.g., ["Netflix", "Disney+", "Prime Video", "Apple TV", "Now TV", "Paramount+"])
        - trivia (string[]: 3-5 verified behind-the-scenes facts)
        - frames (string[]: 4 image urls of movie frames or cinematic shots)
        `,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error("Non sono riuscito a generare i consigli. Verifica la tua connessione o riprova tra poco.");
    }
  },

  async searchMovies(query: string): Promise<Movie[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for movies matching: "${query}". 
        Return ONLY a JSON array of objects with these keys: 
        - id, title, overview, 
        - posterPath (MUST be the official high-resolution movie poster URL from TMDB, specifically using the https://image.tmdb.org/t/p/original/ pattern), 
        - releaseDate, rating, 
        - imdbRating (e.g. "7.8"), 
        - rottenTomatoes (e.g. "85%"), 
        - matchScore (estimate relative to typical user interest 0-100),
        - genres, availableOn (platforms like Netflix, Disney+, etc.), 
        - trivia (verified facts), 
        - frames (4 iconic cinematography frame urls).`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error) {
      console.error("Error searching movies:", error);
      throw new Error("La ricerca è fallita. Il servizio AI potrebbe essere temporaneamente non disponibile.");
    }
  },

  async parseSocialImport(textOrImage: string, isImage: boolean = false): Promise<Movie[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract movie titles from this text or description of a social media post: "${textOrImage}". 
        Return ONLY a JSON array of Movie objects with keys: 
        - id, title, overview, 
        - posterPath (MUST be the official high-resolution movie poster URL from TMDB following the https://image.tmdb.org/t/p/original/ standard), 
        - releaseDate, rating, 
        - imdbRating, 
        - rottenTomatoes, 
        - matchScore,
        - genres, availableOn (streaming platforms), trivia, frames.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error) {
      console.error("Error parsing social import:", error);
      throw new Error("Non è stato possibile analizzare i dati importati. Assicurati che il testo contenga riferimenti a film leggibili.");
    }
  },

  async getComboRecommendations(titles: string[]): Promise<Movie[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analizza questa combinazione di film che l'utente adora: ${titles.join(", ")}. 
        Trova 3 film (diversi da quelli citati) che abbiano un "DNA" comune a questa specifica combinazione.
        Per calcolare il 'matchScore' (0-100), esegui un'analisi incrociata profonda dei seguenti fattori dei film di input:
        1. Temi ricorrenti e profondità filosofica
        2. Stile visivo, fotografia e firma del regista
        3. Mood emotivo e ritmo narrativo
        Il matchScore deve essere un numero intero (0-100) che rappresenta quanto accuratamente il consiglio riflette l'intersezione di questi specifici fattori. Sii molto selettivo: un 90+ deve essere un match quasi perfetto nel DNA cinematografico.

        Ritorna SOLO un array JSON di oggetti Movie con chiavi: 
        - id, title, overview, 
        - posterPath (MUST be the official high-resolution movie poster URL from TMDB), 
        - releaseDate, rating, 
        - imdbRating, 
        - rottenTomatoes, 
        - matchScore (calcolato con l'analisi sopra),
        - genres, availableOn (streaming platforms), trivia, frames.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error) {
      console.error("Error fetching combo recommendations:", error);
      throw new Error("Impossibile generare CineCombo al momento. Riprova più tardi.");
    }
  },

  async getMoviesByMood(mood: string, limit: number = 6): Promise<Movie[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Recommend ${limit} movies for someone feeling: "${mood}". 
        The recommendations should deeply resonate with this specific mood.
        Return ONLY a JSON array of objects with these keys: 
        - id, title, overview, 
        - posterPath (MUST be high-resolution TMDB URL following the https://image.tmdb.org/t/p/original/ pattern), 
        - releaseDate, rating, imdbRating, rottenTomatoes, 
        - matchScore (AI estimate 0-100 of how well it matches the mood "${mood}"),
        - genres, availableOn (platforms), trivia, frames.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error) {
      console.error("Error fetching mood recommendations:", error);
      throw new Error("Non sono riuscito a trovare film per questo mood. Riprova con un'altra emozione!");
    }
  }
};
