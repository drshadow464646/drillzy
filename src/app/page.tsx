
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SplashPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if the user has completed the survey
    const { data: profile } = await supabase
      .from('profiles')
      .select('category')
      .eq('id', user.id)
      .single();

    if (profile?.category) {
      redirect('/home');
    } else {
      redirect('/survey');
    }
  } else {
    redirect('/login');
  }

  // This part of the component will never be rendered due to the redirects
  return null;
}
