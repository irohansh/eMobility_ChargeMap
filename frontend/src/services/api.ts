const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Station {
  _id: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  chargers: {
    _id: string;
    connectorType: 'Type 2' | 'CCS' | 'CHAdeMO';
    powerKW: number;
    status: 'available' | 'occupied' | 'out-of-order';
  }[];
}

export interface Booking {
  _id: string;
  user: string;
  station: Station;
  chargerId: string;
  startTime: string;
  endTime: string;
  vehicleInfo: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: User;
  station: Station;
  booking: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface CreateBookingRequest {
  stationId: string;
  chargerId: string;
  startTime: string;
  endTime: string;
  vehicleInfo?: string;
}

export interface CreateReviewRequest {
  stationId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface StationRecommendationRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  connectorTypes?: string[];
  minPowerKW?: number;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Station methods
  async getAllStations(): Promise<Station[]> {
    return this.request<Station[]>('/stations');
  }

  async getStationById(id: string): Promise<Station> {
    return this.request<Station>(`/stations/${id}`);
  }

  async getStationRoute(id: string): Promise<any> {
    return this.request<any>(`/stations/${id}/route`);
  }

  async getStationRecommendations(request: StationRecommendationRequest): Promise<Station[]> {
    return this.request<Station[]>('/stations/recommendations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAvailableSlots(stationId: string): Promise<any> {
    return this.request<any>(`/stations/${stationId}/slots`);
  }

  async seedStations(): Promise<any> {
    return this.request<any>('/stations/seed', {
      method: 'POST',
    });
  }

  // Booking methods
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId: string): Promise<void> {
    return this.request<void>(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async completeBooking(bookingId: string): Promise<void> {
    return this.request<void>(`/bookings/${bookingId}/complete`, {
      method: 'POST',
    });
  }

  // User methods
  async getMyBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/users/me/bookings');
  }

  async updateProfile(profileData: { name: string; email: string; phone: string }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Review methods
  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
