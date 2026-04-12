import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { routeAccessMap } from './lib/settings';
import { NextResponse } from 'next/server';

const matchers = Object.keys(routeAccessMap).map(route => ({
    matcher: createRouteMatcher([route]),
    allowRoles: routeAccessMap[route]
}));

// 🔥 Pages d'erreur publiques (accessibles sans auth)
const publicErrorPages = createRouteMatcher([
    '/errors/connection-error',
    '/errors/unauthorized',
    '/errors/not-found',
    '/errors/server-error',
]);

export default clerkMiddleware(async (auth, req) => {

    // ✅ Laisser passer les pages d'erreur sans vérification
    if (publicErrorPages(req)) {
        return NextResponse.next();
    }

    const { sessionClaims } = await auth();

    // Normalise en minuscules pour matcher le routeAccessMap
    const role = (
    (sessionClaims?.metadata as { role?: string } | undefined)?.role ?? ''
    ).toLowerCase()

    // const role =
    //     (sessionClaims?.metadata as { role?: string } | undefined)?.role ?? '';

    for (const { matcher, allowRoles } of matchers) {
        if (matcher(req)) {
            // 🚨 Pas de session → page de connexion
            if (!sessionClaims) {
                return NextResponse.redirect(new URL('/', req.url));
            }

            // 🚫 Rôle non autorisé → unauthorized au lieu du dashboard du rôle
            if (!allowRoles.includes(role)) {
                return NextResponse.redirect(
                    new URL('/errors/unauthorized', req.url)
                );
            }
        }
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};