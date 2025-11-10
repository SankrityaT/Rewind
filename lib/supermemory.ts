import { Supermemory } from 'supermemory';

if (!process.env.SUPERMEMORY_API_KEY) {
  throw new Error('SUPERMEMORY_API_KEY is not set');
}

export const supermemoryClient = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY,
});
