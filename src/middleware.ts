import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Edge-compatible (sans Prisma)
 *
 * Vérifie uniquement la PRÉSENCE du cookie de session Better Auth.
 * La validation complète de la session (signature, expiration, DB) se fait
 * dans les API routes via getSession().
 *
 * Pourquoi ? Prisma n'est pas compatible avec l'Edge Runtime de Vercel.
 * Ce middleware est "optimiste" : il fait confiance au cookie pour l'accès initial.
 */

const SESSION_COOKIE_NAME = 'better-auth.session_token';

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

  // Vérification "légère" : présence du cookie de session
  // La validation complète se fait dans les API routes via getSession()
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    // API routes : Retourner JSON 401
    if (pathname.startsWith('/api')) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Pages : Rediriger vers /signin
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
