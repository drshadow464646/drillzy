
import {createClient} from '@/lib/supabase/server';
import {NextResponse, type NextRequest} from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {error} = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(requestUrl.origin + next);
    }
  }

  console.error('ERROR: No auth code received or error exchanging code.');
  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=Could not authenticate user`
  );
}
