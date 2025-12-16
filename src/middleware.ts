import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/better-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Better Auth routes (gère sa propre authentification)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Routes API publiques (lecture seule)
  const publicApiRoutes = [
    /^\/api\/conversations$/,
    /^\/api\/conversations\/[^/]+$/,
    /^\/api\/users\/[^/]+\/contributions$/,
  ];

  const isPublicApiRoute =
    pathname.startsWith('/api') &&
    request.method === 'GET' &&
    publicApiRoutes.some((pattern) => pattern.test(pathname));

  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    // API routes : Retourner JSON 401
    if (pathname.startsWith('/api')) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Pages : Rediriger vers /signin
    // Paramètre redirect pour revenir après login (meilleure UX)
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(private)/:path*', // Toutes pages privées
    '/api/:path*', // Toutes API routes (sauf auth, filtré ci-dessus)
  ],
};
