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

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';
export type SocialPlatform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'linkedin' | 'other';
export type ContentType = 'video' | 'image' | 'text';

export interface ScheduledPost {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content_type?: ContentType;
  platform: SocialPlatform;
  status: PostStatus;
  scheduled_date: string;
  published_date?: string;
  content_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TutorialStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  status: TutorialStatus;
  current_step: number;
  completed_steps: number[];
  started_at?: string;
  completed_at?: string;
  last_interaction_at: string;
  created_at: string;
  updated_at: string;
}

export interface TutorialBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description?: string;
  earned_at: string;
}

export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'navigate' | 'observe';
  tip?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  badge?: {
    id: string;
    name: string;
    description: string;
  };
}
