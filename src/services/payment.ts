import { supabase } from '@/db/supabase';
import type { Product, Order, OrderItem } from '@/types';

export const paymentService = {
  // Get all active products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to load products');
    }

    return Array.isArray(data) ? data : [];
  },

  // Create Stripe checkout session
  async createCheckout(items: OrderItem[]): Promise<{ url: string; sessionId: string; orderId: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to make a purchase');
    }

    const { data, error } = await supabase.functions.invoke('create_stripe_checkout', {
      body: JSON.stringify({
        items,
        currency: 'usd',
        payment_method_types: ['card']
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('Edge function error in create_stripe_checkout:', errorMsg || error?.message);
      throw new Error(errorMsg || error?.message || 'Failed to create checkout session');
    }

    if (data?.code !== 'SUCCESS') {
      throw new Error(data?.message || 'Failed to create checkout session');
    }

    return data.data;
  },

  // Verify payment after Stripe redirect
  async verifyPayment(sessionId: string): Promise<{
    verified: boolean;
    status: string;
    amount?: number;
    currency?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('verify_stripe_payment', {
      body: JSON.stringify({ sessionId }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('Edge function error in verify_stripe_payment:', errorMsg || error?.message);
      throw new Error(errorMsg || error?.message || 'Failed to verify payment');
    }

    if (data?.code !== 'SUCCESS') {
      throw new Error(data?.message || 'Failed to verify payment');
    }

    return data.data;
  },

  // Get user's order history
  async getOrders(): Promise<Order[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to view orders');
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to load orders');
    }

    return Array.isArray(data) ? data : [];
  },

  // Get single order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch order:', error);
      throw new Error('Failed to load order');
    }

    return data;
  },

  // Retry payment for pending order
  async retryPayment(orderId: string): Promise<{ url: string; sessionId: string }> {
    const order = await this.getOrder(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Can only retry payment for pending orders');
    }

    return this.createCheckout(order.items as OrderItem[]);
  }
};
