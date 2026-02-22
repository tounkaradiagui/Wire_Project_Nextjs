import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { routeAccessMap } from './lib/settings';
import { NextResponse } from 'next/server';

const matchers = Object.keys(routeAccessMap).map(route => ({
  matcher: createRouteMatcher([route]),
  allowRoles: routeAccessMap[route]
}));

export default clerkMiddleware(async (auth, req) => {

  // Get session if exists
  const { sessionClaims } = await auth();

//   if (user.publicMetadata.isBanned) {
//   return NextResponse.redirect(new URL("/banned", req.url));
// }

  // SAFE role extraction
  const role =
    (sessionClaims?.metadata as { role?: string } | undefined)?.role ?? '';

  for (const { matcher, allowRoles } of matchers) {
    if (matcher(req)) {
      // 🚨 If no session -> redirect to sign in
      if (!sessionClaims) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // 🚫 unauthorized role
      if (!allowRoles.includes(role)) {
        return NextResponse.redirect(new URL(`/${role || ''}`, req.url));
      }
    }
  }
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};