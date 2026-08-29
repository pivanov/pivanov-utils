/**
 * Service-worker-safe Cache Storage helpers.
 *
 * This entry point (`@pivanov/utils/cache`) is self-contained on purpose: it
 * pulls in no React, no event bus, no DOM helpers and no shared barrel, so it
 * can be imported from a service worker without dragging the rest of the
 * package along.
 *
 * Two layers are available:
 * - `storage*` for JSON metadata, with optional TTL envelopes.
 * - `cache*Response` and friends for raw `Request`/`Response` traffic, where
 *   the body, status and headers survive untouched.
 */

export * from "./response";
export * from "./storage";
export * from "./support";
