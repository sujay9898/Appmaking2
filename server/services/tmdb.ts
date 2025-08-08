interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview?: string;
  genre_ids?: number[];
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
}

export class TMDBService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '19861d6a9e6917178763eb4dadcc1b2f';
    if (!this.apiKey) {
      console.warn('TMDB API key not found. Movie search will not work.');
    }
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    if (!this.apiKey) {
      console.warn('TMDB API key not configured, returning mock search data');
      return this.getMockSearchData(query);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        console.warn(`TMDB API error: ${response.status}, falling back to mock search data`);
        return this.getMockSearchData(query);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error searching movies:', error);
      console.warn('Falling back to mock search data');
      return this.getMockSearchData(query);
    }
  }

  getImageUrl(posterPath: string | null): string | null {
    if (!posterPath) return null;
    return `${this.imageBaseUrl}${posterPath}`;
  }

  async getTrendingMovies(): Promise<TMDBMovie[]> {
    if (!this.apiKey) {
      console.warn('TMDB API key not configured, returning mock data');
      return this.getMockTrendingData();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/trending/movie/day?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        console.warn(`TMDB API error: ${response.status}, falling back to mock data`);
        return this.getMockTrendingData();
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      console.warn('Falling back to mock data');
      return this.getMockTrendingData();
    }
  }

  async getTrendingAll(): Promise<TMDBMovie[]> {
    if (!this.apiKey) {
      console.warn('TMDB API key not configured, returning mock data');
      return this.getMockTrendingData();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/trending/all/day?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        console.warn(`TMDB API error: ${response.status}, falling back to mock data`);
        return this.getMockTrendingData();
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error fetching trending content:', error);
      console.warn('Falling back to mock data');
      return this.getMockTrendingData();
    }
  }

  private getMockTrendingData(): TMDBMovie[] {
    return [
      {
        id: 1234821,
        title: "Jurassic World Dominion",
        poster_path: "/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg",
        release_date: "2022-06-10",
        overview: "Four years after Isla Nublar was destroyed, dinosaurs now live alongside humans..."
      },
      {
        id: 505642,
        title: "Black Panther: Wakanda Forever",
        poster_path: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
        release_date: "2022-11-11",
        overview: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation..."
      },
      {
        id: 438148,
        title: "Minions: The Rise of Gru",
        poster_path: "/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg",
        release_date: "2022-07-01",
        overview: "A fanboy of a supervillain supergroup known as the Vicious 6..."
      },
      {
        id: 616037,
        title: "Thor: Love and Thunder",
        poster_path: "/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
        release_date: "2022-07-08",
        overview: "After his retirement is interrupted by Gorr the God Butcher..."
      },
      {
        id: 361743,
        title: "Top Gun: Maverick",
        poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        release_date: "2022-05-27",
        overview: "After more than thirty years of service as one of the Navy's top aviators..."
      }
    ];
  }

  private getMockSearchData(query: string): TMDBMovie[] {
    // Return a subset of trending data as search results
    return this.getMockTrendingData().filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  async getGenres(): Promise<TMDBGenre[]> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBGenreResponse = await response.json();
      return data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  async getMoviesByGenre(genreId: number): Promise<TMDBMovie[]> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&sort_by=popularity.desc`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      throw error;
    }
  }

  async getPopularMovies(): Promise<TMDBMovie[]> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/movie/popular?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
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
