import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  start_date: string;
  end_date: string | null;
  amount: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setIsPremium(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setLoading(false);
        return;
      }

      if (data) {
        // Check if subscription is still valid
        const endDate = data.end_date ? new Date(data.end_date) : null;
        const isActive = !endDate || endDate > new Date();
        
        setSubscription(data);
        setIsPremium(isActive);
      } else {
        setSubscription(null);
        setIsPremium(false);
      }
      
      setLoading(false);
    }

    fetchSubscription();
  }, [user]);

  return { subscription, isPremium, loading };
}
