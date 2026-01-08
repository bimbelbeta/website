/**
 * Premium content access configuration
 * Client-side helpers that mirror server-side logic
 *
 * IMPORTANT: These are for UI display only. Server-side validation is the source of truth.
 */

/**
 * Check if a user can access specific content
 * - Admin users can access all content
 * - Premium users can access all content
 * - Free users can only access: first subtest (order=1) AND first content per category (order=1)
 *
 * @param userIsPremium - Whether the user has premium access
 * @param userRole - The user's role (e.g., "admin", "user")
 * @param subtestOrder - The order of the subtest (1 = first subtest)
 * @param contentOrder - The order of the content within its category (1 = first content)
 * @returns Whether the user can access the content
 */
export function canAccessContent(
	userIsPremium: boolean,
	userRole: string | undefined,
	subtestOrder: number,
	contentOrder: number,
): boolean {
	// Admin can access everything
	if (userRole === "admin") return true;
	// Premium users can access everything
	if (userIsPremium) return true;
	// Free users: only first content from first subtest
	return isFirstSubtest(subtestOrder) && isFirstContent(contentOrder);
}

/**
 * Check if the subtest is the first one (free for all users)
 * @param subtestOrder - The order of the subtest
 */
export function isFirstSubtest(subtestOrder: number): boolean {
	return subtestOrder === 1;
}

/**
 * Check if the content is the first one in its category (free for first subtest)
 * @param contentOrder - The order of the content within its category
 */
export function isFirstContent(contentOrder: number): boolean {
	return contentOrder === 1;
}

/**
 * Check if a subtest requires premium access (for UI display)
 * Only the first subtest (order=1) is accessible to free users
 *
 * @param subtestOrder - The order of the subtest
 * @param userRole - The user's role
 * @param userIsPremium - Whether the user has premium access
 */
export function isSubtestPremium(subtestOrder: number, userRole?: string, userIsPremium?: boolean): boolean {
	// Admin and premium users see no lock
	if (userRole === "admin" || userIsPremium) return false;
	return subtestOrder !== 1;
}
