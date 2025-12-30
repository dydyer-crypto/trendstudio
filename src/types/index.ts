export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  role: UserRole;
  credits: number;
  referral_code?: string;
  referred_by?: string;
  referral_earnings?: number;
  created_at?: string;
  updated_at?: string;
}

export type ReferralStatus = 'pending' | 'completed' | 'credited';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: ReferralStatus;
  reward_amount: number;
  created_at: string;
  completed_at?: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  customer_email?: string;
  customer_name?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  credits: number;
  price: number;
  currency: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
