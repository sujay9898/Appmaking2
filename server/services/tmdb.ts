interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
}

export class TMDBService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TMDB API key not found. Movie search will not work.');
    }
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  getImageUrl(posterPath: string | null): string | null {
    if (!posterPath) return null;
    return `${this.imageBaseUrl}${posterPath}`;
  }

  async getMovieDetails(tmdbId: string): Promise<TMDBMovie | null> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/movie/${tmdbId}?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDB API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  }
}

export const tmdbService = new TMDBService();
