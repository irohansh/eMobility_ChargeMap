const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    connectorType: 'Type 2' | 'CCS' | 'CHAdeMO' | 'Tesla';
    powerKW: number;
    status: 'available' | 'occupied' | 'out-of-order';
    amperage?: number;
    voltage?: number;
  }[];
  distance?: number;
}

export interface RealStation extends Station {
  realTimeData?: {
    source: string;
    lastUpdated: string;
    status: string;
    pricing?: string;
    amenities?: string;
  };
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

export interface Payment {
  _id: string;
  user: string;
  booking: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentIntentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripeChargeId?: string;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
  updatedAt: string;
}

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

  async getMyBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/users/me/bookings');
  }

  async updateProfile(profileData: { name: string; email: string; phone: string }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async createPaymentIntent(bookingId: string): Promise<{ clientSecret: string; paymentIntentId: string; amount: number }> {
    return this.request<{ clientSecret: string; paymentIntentId: string; amount: number }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<{ msg: string; payment: any; booking: any }> {
    return this.request<{ msg: string; payment: any; booking: any }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async getPaymentHistory(): Promise<any[]> {
    return this.request<any[]>('/payments/history');
  }

  async getRealStations(lat: number, lon: number, radius: number = 50): Promise<RealStation[]> {
    return this.request<RealStation[]>(`/real-stations/by-location?lat=${lat}&lon=${lon}&radius=${radius}`);
  }

  async getRealStationsByBounds(north: number, south: number, east: number, west: number): Promise<RealStation[]> {
    return this.request<RealStation[]>(`/real-stations/by-bounds?north=${north}&south=${south}&east=${east}&west=${west}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
