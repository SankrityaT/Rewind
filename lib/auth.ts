import { auth } from '@clerk/nextjs/server';

/**
 * Get the current user's ID from Clerk
 * Returns the user ID or throws an error if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized - no user ID found');
  }

  return userId;
}

/**
 * Get the Supermemory container tag for the current user
 * This is used to isolate each user's memories in Supermemory
 */
export async function getUserContainerTag(): Promise<string> {
  const userId = await getCurrentUserId();
  return `user_${userId}`;
}

/**
 * Check if a user is authenticated (for client components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}
