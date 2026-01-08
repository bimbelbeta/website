import { ORPCError } from "@orpc/server";
import { o } from "../lib/orpc";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
	// Free users: 100 requests per 15 minutes
	free: {
		maxRequests: 100,
		windowMs: 15 * 60 * 1000, // 15 minutes
	},
	// Premium users: 500 requests per 15 minutes
	premium: {
		maxRequests: 500,
		windowMs: 15 * 60 * 1000, // 15 minutes
	},
} as const;

/**
 * In-memory rate limit store
 * In production, consider using Redis for distributed rate limiting
 */
interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt <= now) {
			rateLimitStore.delete(key);
		}
	}
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get rate limit key for a user and endpoint
 */
function getRateLimitKey(userId: string, path: string): string {
	return `${userId}:${path}`;
}

/**
 * Check and update rate limit for a user
 * @returns Object with rate limit info and whether request is allowed
 */
function checkRateLimit(
	userId: string,
	path: string,
	isPremium: boolean,
): {
	allowed: boolean;
	limit: number;
	remaining: number;
	resetAt: number;
} {
	const config = isPremium ? RATE_LIMIT_CONFIG.premium : RATE_LIMIT_CONFIG.free;
	const key = getRateLimitKey(userId, path);
	const now = Date.now();

	let entry = rateLimitStore.get(key);

	// If no entry or entry expired, create new one
	if (!entry || entry.resetAt <= now) {
		entry = {
			count: 1,
			resetAt: now + config.windowMs,
		};
		rateLimitStore.set(key, entry);

		return {
			allowed: true,
			limit: config.maxRequests,
			remaining: config.maxRequests - 1,
			resetAt: entry.resetAt,
		};
	}

	// Check if limit exceeded
	if (entry.count >= config.maxRequests) {
		return {
			allowed: false,
			limit: config.maxRequests,
			remaining: 0,
			resetAt: entry.resetAt,
		};
	}

	// Increment count
	entry.count++;

	return {
		allowed: true,
		limit: config.maxRequests,
		remaining: config.maxRequests - entry.count,
		resetAt: entry.resetAt,
	};
}

/**
 * Rate limiting middleware for content endpoints
 * Applies different limits for free and premium users
 */
export const rateLimit = o.middleware(async ({ context, next, path }) => {
	// Skip rate limiting if no user session (will be caught by auth middleware)
	if (!context.session?.user) {
		return next();
	}

	const userId = context.session.user.id;
	const isPremium = context.session.user.isPremium;
	// path is a readonly string array, join to create endpoint key
	const endpointPath = Array.isArray(path) ? path.join("/") : "unknown";

	const result = checkRateLimit(userId, endpointPath, isPremium);

	if (!result.allowed) {
		throw new ORPCError("TOO_MANY_REQUESTS", {
			message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
			data: {
				retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
			},
		});
	}

	// Continue with the request
	// Note: Rate limit headers would be set in the HTTP layer if needed
	return next();
});

/**
 * Export rate limit store for testing purposes
 */
export const _testUtils = {
	clearStore: () => rateLimitStore.clear(),
	getStore: () => rateLimitStore,
};
