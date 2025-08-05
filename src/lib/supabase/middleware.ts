
import {createFactory} from 'react';
import {createClient} from '@/lib/supabase/server';
import {NextResponse, type NextRequest} from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // CHECK IF THE ROUTE IS PROTECTED
  const protectedRoutes = ['/home', '/streak', '/leaderboard', '/settings', '/profile', '/survey'];
  const isProtectedRoute = protectedRoutes.some((path) =>
    pathname.startsWith(path)
  );
  
  // CHECK IF THE ROUTE IS A GUEST ROUTE
  const guestRoutes = ['/login', '/reset-password', '/forgot-password'];
  const isGuestRoute = guestRoutes.some((path) =>
    pathname.startsWith(path)
  );

  if (!user && isProtectedRoute) {
    // if not logged in and trying to access a protected route, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  } else if (user && isGuestRoute) {
    // if logged in and trying to access a guest route, redirect to home
     const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  } else if (user) {
    // If the user is logged in, check if they have a category.
    const {data: profile, error} = await supabase
      .from('profiles')
      .select('category')
      .eq('id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile in middleware', error);
    }

    const isSurveyPage = pathname.startsWith('/survey');

    if (!profile?.category && !isSurveyPage && (isProtectedRoute || pathname === '/')) {
      // If user has no category and is not on the survey page, redirect them.
      const url = request.nextUrl.clone();
      url.pathname = '/survey';
      return NextResponse.redirect(url);
    } else if (profile?.category && isSurveyPage) {
       // If user has a category and is on the survey page, redirect them home.
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    } else if (profile?.category && pathname === '/') {
       // If user is fully set up and hits the root, go to home.
       const url = request.nextUrl.clone();
       url.pathname = '/home';
       return NextResponse.redirect(url);
    } else if (!user && pathname === '/') {
        // If user is logged out and hits the root, go to login.
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
  }


  return supabaseResponse;
}
