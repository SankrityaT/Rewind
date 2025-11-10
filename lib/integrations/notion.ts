import { getToken, isTokenExpired, saveToken } from './token-store';
import { supermemoryClient } from '@/lib/supermemory';


interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: any;
  url: string;
}

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

function extractTextFromBlocks(blocks: NotionBlock[]): string {
  let text = '';

  for (const block of blocks) {
    const type = block.type;

    if (block[type]?.rich_text) {
      const richText = block[type].rich_text;
      text += richText.map((t: any) => t.plain_text).join('') + '\n';
    }

    // Handle different block types
    if (type === 'heading_1' || type === 'heading_2' || type === 'heading_3') {
      text += '\n';
    }
  }

  return text.trim();
}

function getPageTitle(properties: any): string {
  // Notion pages can have different title property names
  for (const key in properties) {
    const prop = properties[key];
    if (prop.type === 'title' && prop.title && prop.title.length > 0) {
      return prop.title.map((t: any) => t.plain_text).join('');
    }
  }
  return 'Untitled';
}

export async function syncNotion(userId: string): Promise<number> {
  const storedToken = await getToken(userId, 'notion');
  if (!storedToken) {
    throw new Error('Notion not connected');
  }

  const accessToken = storedToken.accessToken;

  // Search for pages updated in the last 30 days
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const searchResponse = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
      page_size: 20,
    }),
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    throw new Error(`Failed to search Notion pages: ${error}`);
  }

  const searchData = await searchResponse.json();
  const pages: NotionPage[] = searchData.results || [];

  // Filter pages edited in last 30 days
  const recentPages = pages.filter(
    (page) => new Date(page.last_edited_time) > new Date(cutoffDate)
  );

  console.log(`[Notion] Found ${recentPages.length} recently edited pages`);

  let imported = 0;

  for (const page of recentPages) {
    try {
      // Fetch page blocks (content)
      const blocksResponse = await fetch(
        `https://api.notion.com/v1/blocks/${page.id}/children`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Notion-Version': '2022-06-28',
          },
        }
      );

      if (!blocksResponse.ok) {
        console.log(`[Notion] Could not fetch blocks for page ${page.id}`);
        continue;
      }

      const blocksData = await blocksResponse.json();
      const blocks: NotionBlock[] = blocksData.results || [];

      const title = getPageTitle(page.properties);
      const content = extractTextFromBlocks(blocks);

      if (!content || content.length < 10) {
        console.log(`[Notion] Skipping page ${title} - insufficient content`);
        continue;
      }

      const fullContent = `
Notion Page: ${title}

Last Edited: ${new Date(page.last_edited_time).toLocaleString()}
Created: ${new Date(page.created_time).toLocaleString()}

${content}

Link: ${page.url}
      `.trim();

      await supermemoryClient.memories.add({
        content: fullContent,
        metadata: {
          type: 'study',
          source: 'notion',
          pageId: page.id,
          priority: 'medium',
          reviewed: false,
          lastEdited: page.last_edited_time,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;
    } catch (error) {
      console.error(`[Notion] Failed to import page ${page.id}:`, error);
    }
  }

  console.log(`[Notion] Imported ${imported}/${recentPages.length} pages`);
  return imported;
}

export async function triggerNotionSync(userId: string) {
  try {
    const imported = await syncNotion(userId);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Notion] Sync error:', error);
    return { success: false, error: error.message };
  }
}
