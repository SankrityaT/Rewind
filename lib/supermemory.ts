import { Supermemory } from 'supermemory';

if (!process.env.SUPERMEMORY_API_KEY) {
  throw new Error('SUPERMEMORY_API_KEY is not set');
}

export const supermemoryClient = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY,
});

export const USER_CONTAINER_TAG = process.env.NEXT_PUBLIC_USER_ID || 'user_demo_123';
