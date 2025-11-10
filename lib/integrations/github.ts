import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';


interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: { login: string };
  head: { ref: string };
  base: { ref: string };
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: { login: string };
  labels: Array<{ name: string }>;
}

export async function syncGitHub(userId: string): Promise<number> {
  const storedToken = await getToken(userId, 'github');
  if (!storedToken) {
    throw new Error('GitHub not connected');
  }

  let accessToken = storedToken.accessToken;
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[GitHub] Refreshing expired token');
    const newTokens = await refreshAccessToken('github', storedToken.refreshToken);
    accessToken = newTokens.access_token;

    await saveToken({
      ...storedToken,
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || storedToken.refreshToken,
      expiresAt: newTokens.expires_in
        ? Date.now() + newTokens.expires_in * 1000
        : storedToken.expiresAt,
    });
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Fetch user's repositories (recently updated)
  const reposResponse = await fetch(
    'https://api.github.com/user/repos?sort=updated&per_page=10&affiliation=owner,collaborator',
    { headers }
  );

  if (!reposResponse.ok) {
    const error = await reposResponse.text();
    throw new Error(`Failed to fetch GitHub repos: ${error}`);
  }

  const repos: GitHubRepo[] = await reposResponse.json();

  console.log(`[GitHub] Found ${repos.length} repositories`);

  let imported = 0;
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  for (const repo of repos.slice(0, 5)) { // Limit to 5 repos to avoid rate limits
    const updatedDate = new Date(repo.updated_at);
    if (updatedDate < cutoffDate) continue;

    try {
      // Import repo info
      const repoContent = `
GitHub Repository: ${repo.full_name}

Description: ${repo.description || 'No description'}
Language: ${repo.language || 'N/A'}
Stars: ${repo.stargazers_count}
Last Updated: ${updatedDate.toLocaleString()}

Link: ${repo.html_url}
      `.trim();

      await supermemoryClient.memories.add({
        content: repoContent,
        metadata: {
          type: 'personal',
          source: 'github',
          repoId: repo.id.toString(),
          repoName: repo.full_name,
          priority: 'medium',
          reviewed: false,
          updatedAt: repo.updated_at,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;

      // Fetch recent PRs
      const prsResponse = await fetch(
        `https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=5&sort=updated&direction=desc`,
        { headers }
      );

      if (prsResponse.ok) {
        const prs: GitHubPullRequest[] = await prsResponse.json();

        for (const pr of prs) {
          const prUpdated = new Date(pr.updated_at);
          if (prUpdated < cutoffDate) continue;

          const prContent = `
GitHub Pull Request #${pr.number}: ${pr.title}

Repository: ${repo.full_name}
Author: ${pr.user.login}
Status: ${pr.state}
Branch: ${pr.head.ref} → ${pr.base.ref}
Created: ${new Date(pr.created_at).toLocaleString()}
Updated: ${prUpdated.toLocaleString()}

${pr.body || 'No description'}

Link: ${pr.html_url}
          `.trim();

          await supermemoryClient.memories.add({
            content: prContent,
            metadata: {
              type: 'personal',
              source: 'github-pr',
              repoId: repo.id.toString(),
              repoName: repo.full_name,
              prNumber: pr.number.toString(),
              prState: pr.state,
              priority: pr.state === 'open' ? 'high' : 'low',
              reviewed: false,
              updatedAt: pr.updated_at,
              importedAt: new Date().toISOString(),
              tags: [`user_${userId}`],
            },
          });

          imported++;
        }
      }

      // Fetch recent issues assigned to user
      const issuesResponse = await fetch(
        `https://api.github.com/repos/${repo.full_name}/issues?state=open&per_page=5&assignee=@me`,
        { headers }
      );

      if (issuesResponse.ok) {
        const issues: GitHubIssue[] = await issuesResponse.json();

        for (const issue of issues) {
          // Skip pull requests (they also appear in issues endpoint)
          if ('pull_request' in issue) continue;

          const issueContent = `
GitHub Issue #${issue.number}: ${issue.title}

Repository: ${repo.full_name}
Author: ${issue.user.login}
Status: ${issue.state}
Labels: ${issue.labels.map(l => l.name).join(', ') || 'None'}
Created: ${new Date(issue.created_at).toLocaleString()}

${issue.body || 'No description'}

Link: ${issue.html_url}
          `.trim();

          await supermemoryClient.memories.add({
            content: issueContent,
            metadata: {
              type: 'personal',
              source: 'github-issue',
              repoId: repo.id.toString(),
              repoName: repo.full_name,
              issueNumber: issue.number.toString(),
              issueState: issue.state,
              priority: 'high',
              reviewed: false,
              updatedAt: issue.updated_at,
              importedAt: new Date().toISOString(),
              tags: [`user_${userId}`],
            },
          });

          imported++;
        }
      }
    } catch (error) {
      console.error(`[GitHub] Failed to import from repo ${repo.full_name}:`, error);
    }
  }

  console.log(`[GitHub] Imported ${imported} items`);
  return imported;
}

export async function triggerGitHubSync(userId: string) {
  try {
    const imported = await syncGitHub(userId);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[GitHub] Sync error:', error);
    return { success: false, error: error.message };
  }
}
