
import {createClient} from '@/lib/supabase/server';
import {NextResponse, type NextRequest} from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
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
