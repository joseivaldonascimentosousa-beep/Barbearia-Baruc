
export enum AppView {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  PRODUCTS = 'PRODUCTS',
  USER_PROFILE = 'USER_PROFILE',
  ADMIN = 'ADMIN'
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  isActive: boolean;
  salesCount: number;
}

export interface BlockedSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ProductReservation {
  id: string;
  userId: string;
  userName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  date: string;
  status: 'PENDING' | 'PICKED_UP' | 'CANCELLED';
  borderColor?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  date: string; // ISO string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  isManual: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isAdmin: boolean;
  visitCount: number;
  totalProductSpend: number;
}
