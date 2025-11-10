// Canvas LMS Integration (uses API token, not OAuth)
import { supermemoryClient } from '@/lib/supermemory';

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
}

interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  submission_types: string[];
  html_url: string;
}

interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  html_url: string;
}

export async function syncCanvas(userId: string, apiToken?: string, baseUrl?: string): Promise<number> {
  const token = apiToken || process.env.CANVAS_API_TOKEN;
  const canvasUrl = baseUrl || process.env.CANVAS_BASE_URL || 'https://canvas.instructure.com';

  if (!token) {
    throw new Error('Canvas API token not configured');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Fetch active courses
  const coursesResponse = await fetch(
    `${canvasUrl}/api/v1/courses?enrollment_state=active&per_page=20`,
    { headers }
  );

  if (!coursesResponse.ok) {
    const error = await coursesResponse.text();
    throw new Error(`Failed to fetch Canvas courses: ${error}`);
  }

  const courses: CanvasCourse[] = await coursesResponse.json();

  console.log(`[Canvas] Found ${courses.length} active courses`);

  let imported = 0;
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  for (const course of courses) {
    try {
      // Fetch upcoming assignments
      const assignmentsResponse = await fetch(
        `${canvasUrl}/api/v1/courses/${course.id}/assignments?per_page=10`,
        { headers }
      );

      if (assignmentsResponse.ok) {
        const assignments: CanvasAssignment[] = await assignmentsResponse.json();

        for (const assignment of assignments) {
          if (!assignment.due_at) continue;

          const dueDate = new Date(assignment.due_at);
          if (dueDate < cutoffDate) continue;

          // Clean HTML from description
          const description = assignment.description
            ? assignment.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            : 'No description';

          const content = `
Canvas Assignment: ${assignment.name}

Course: ${course.name} (${course.course_code})
Due Date: ${dueDate.toLocaleString()}
Points: ${assignment.points_possible}
Submission Types: ${assignment.submission_types.join(', ')}

${description}

Link: ${assignment.html_url}
          `.trim();

          await supermemoryClient.memories.add({
            content: content,
            metadata: {
              type: 'study',
              source: 'canvas',
              courseId: course.id.toString(),
              courseName: course.name,
              assignmentId: assignment.id.toString(),
              priority: 'high',
              reviewed: false,
              deadline: assignment.due_at,
              importedAt: new Date().toISOString(),
              tags: [`user_${userId}`],
            },
          });

          imported++;
        }
      }

      // Fetch recent announcements
      const announcementsResponse = await fetch(
        `${canvasUrl}/api/v1/courses/${course.id}/discussion_topics?only_announcements=true&per_page=5`,
        { headers }
      );

      if (announcementsResponse.ok) {
        const announcements: CanvasAnnouncement[] = await announcementsResponse.json();

        for (const announcement of announcements) {
          const postedDate = new Date(announcement.posted_at);
          if (postedDate < cutoffDate) continue;

          // Clean HTML
          const message = announcement.message
            ? announcement.message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            : '';

          const content = `
Canvas Announcement: ${announcement.title}

Course: ${course.name} (${course.course_code})
Posted: ${postedDate.toLocaleString()}

${message}

Link: ${announcement.html_url}
          `.trim();

          await supermemoryClient.memories.add({
            content: content,
            metadata: {
              type: 'study',
              source: 'canvas',
              courseId: course.id.toString(),
              courseName: course.name,
              announcementId: announcement.id.toString(),
              priority: 'medium',
              reviewed: false,
              postedAt: announcement.posted_at,
              importedAt: new Date().toISOString(),
              tags: [`user_${userId}`],
            },
          });

          imported++;
        }
      }
    } catch (error) {
      console.error(`[Canvas] Failed to import from course ${course.name}:`, error);
    }
  }

  console.log(`[Canvas] Imported ${imported} items`);
  return imported;
}

export async function triggerCanvasSync(userId: string, apiToken?: string, baseUrl?: string) {
  try {
    const imported = await syncCanvas(userId, apiToken, baseUrl);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Canvas] Sync error:', error);
    return { success: false, error: error.message };
  }
}
