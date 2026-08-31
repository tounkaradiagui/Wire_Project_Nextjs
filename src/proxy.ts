import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { routeAccessMap } from './lib/settings';
import { NextResponse } from 'next/server';

const matchers = Object.keys(routeAccessMap).map(route => ({
    matcher: createRouteMatcher([route]),
    allowRoles: routeAccessMap[route]
}));

// Routes publiques — jamais bloquées même sans session
const publicRoutes = createRouteMatcher([
    '/',
    '/sign-in',
    '/ecoles(.*)',
    '/errors(.*)',
    '/maintenance',
]);

const publicErrorPages = createRouteMatcher([
    '/errors/connection-error',
    '/errors/unauthorized',
    '/errors/not-found',
    '/errors/server-error',
]);

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";
const MAINTENANCE_BYPASS = process.env.MAINTENANCE_BYPASS_SECRET;

export default clerkMiddleware(async (auth, req) => {
    // ── Mode maintenance ──────────────────────────────────────
    if (MAINTENANCE_MODE) {
        const bypassCookie = req.cookies.get("maintenance_bypass")?.value;
        const bypassQuery = req.nextUrl.searchParams.get("bypass");
        const hasAccess = bypassCookie === MAINTENANCE_BYPASS || bypassQuery === MAINTENANCE_BYPASS;
        const isMaintPage = req.nextUrl.pathname === "/maintenance";

        if (!hasAccess && !isMaintPage) {
            return NextResponse.redirect(new URL("/maintenance", req.url));
        }
    }

    // Routes publiques → laisser passer sans vérification
    if (publicRoutes(req) || publicErrorPages(req)) {
        return NextResponse.next();
    }

    const { sessionClaims } = await auth();

    const role = (
        (sessionClaims?.metadata as { role?: string } | undefined)?.role ?? ''
    ).toLowerCase();

    for (const { matcher, allowRoles } of matchers) {
        if (matcher(req)) {
            // Pas de session → page de connexion
            if (!sessionClaims) {
                return NextResponse.redirect(new URL('/sign-in', req.url));
            }
            // Rôle non autorisé
            if (!allowRoles.includes(role)) {
                return NextResponse.redirect(new URL('/errors/unauthorized', req.url));
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