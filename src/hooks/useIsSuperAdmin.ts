import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns whether the currently signed-in user is a platform super admin.
 * `null` while still loading.
 */
export function useIsSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setIsSuperAdmin(false);
        return;
      }
      const { data, error } = await supabase.rpc('is_super_admin', { _user_id: user.id });
      if (!cancelled) setIsSuperAdmin(!error && data === true);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return isSuperAdmin;
}
