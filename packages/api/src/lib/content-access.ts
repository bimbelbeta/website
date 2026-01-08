/**
 * Content access control helpers
 * Centralized logic for determining content access based on premium status and role
 */

/**
 * Check if a user can access specific content detail (video, notes, practice questions)
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
