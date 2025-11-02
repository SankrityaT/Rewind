export interface MemoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'study' | 'interview' | 'meeting' | 'note';
  fields: TemplateField[];
  example: string;
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const memoryTemplates: MemoryTemplate[] = [
  {
    id: 'study-note',
    name: 'Study Note',
    description: 'Quick learning note in first-person style',
    icon: '📚',
    type: 'study',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'text',
        placeholder: 'e.g., System Design, React, Algorithms',
        required: true,
      },
      {
        name: 'content',
        label: 'What I learned',
        type: 'textarea',
        placeholder: 'Write in first person: "Learned about...", "Need to remember...", "Key insight..."',
        required: true,
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['low', 'medium', 'high'],
      },
    ],
    example: 'Studied load balancing today. Round Robin is the simplest - just cycles through servers. Least Connections sends traffic to the server with fewest active connections. Need to remember: Round Robin = simple but can overload.',
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    description: 'Company research and interview notes',
    icon: '💼',
    type: 'interview',
    fields: [
      {
        name: 'company',
        label: 'Company',
        type: 'text',
        placeholder: 'e.g., Google, Meta, Stripe',
        required: true,
      },
      {
        name: 'position',
        label: 'Position',
        type: 'text',
        placeholder: 'e.g., Senior Frontend Engineer',
      },
      {
        name: 'content',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Research notes, prep checklist, things to mention...',
        required: true,
      },
      {
        name: 'deadline',
        label: 'Interview Date',
        type: 'date',
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['low', 'medium', 'high'],
      },
    ],
    example: 'Google interview prep - they love system design. Need to review: distributed caching, load balancing, database sharding. Practice explaining trade-offs clearly. Remember to ask about team structure and growth opportunities.',
  },
  {
    id: 'algorithm-practice',
    name: 'Algorithm Practice',
    description: 'Coding problem and solution',
    icon: '⚡',
    type: 'study',
    fields: [
      {
        name: 'subject',
        label: 'Algorithm Type',
        type: 'text',
        placeholder: 'e.g., Dynamic Programming, Graph Traversal',
        required: true,
      },
      {
        name: 'problemName',
        label: 'Problem Name',
        type: 'text',
        placeholder: 'e.g., Two Sum, Longest Substring',
      },
      {
        name: 'content',
        label: 'Solution & Insights',
        type: 'textarea',
        placeholder: 'Key approach, time/space complexity, gotchas...',
        required: true,
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['low', 'medium', 'high'],
      },
    ],
    example: 'Solved "Longest Substring Without Repeating Characters" - sliding window approach. Key insight: use a hash map to track last seen position. Time: O(n), Space: O(min(m,n)). Tricky part: updating the window start correctly when duplicate found.',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Action items and key decisions',
    icon: '🤝',
    type: 'meeting',
    fields: [
      {
        name: 'meetingTitle',
        label: 'Meeting Title',
        type: 'text',
        placeholder: 'e.g., Sprint Planning, 1:1 with Manager',
        required: true,
      },
      {
        name: 'content',
        label: 'Notes & Action Items',
        type: 'textarea',
        placeholder: 'Key decisions, action items, follow-ups...',
        required: true,
      },
      {
        name: 'deadline',
        label: 'Follow-up Date',
        type: 'date',
      },
    ],
    example: 'Sprint planning - committed to auth refactor and API optimization. Action items: 1) Review OAuth2 flow by Wed, 2) Benchmark current API performance, 3) Schedule design review with Sarah. Need to follow up on database migration timeline.',
  },
  {
    id: 'concept-deep-dive',
    name: 'Concept Deep Dive',
    description: 'Detailed explanation of a concept',
    icon: '🧠',
    type: 'study',
    fields: [
      {
        name: 'subject',
        label: 'Concept',
        type: 'text',
        placeholder: 'e.g., React Reconciliation, CAP Theorem',
        required: true,
      },
      {
        name: 'content',
        label: 'Explanation',
        type: 'textarea',
        placeholder: 'Explain in your own words, include examples...',
        required: true,
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['low', 'medium', 'high'],
      },
    ],
    example: 'CAP Theorem - can only have 2 of 3: Consistency, Availability, Partition Tolerance. In practice, partition tolerance is required (networks fail), so choose between CP or AP. Example: MongoDB is CP (consistency over availability), Cassandra is AP (availability over consistency).',
  },
  {
    id: 'quick-tip',
    name: 'Quick Tip',
    description: 'Short, actionable insight',
    icon: '💡',
    type: 'note',
    fields: [
      {
        name: 'subject',
        label: 'Topic',
        type: 'text',
        placeholder: 'e.g., Git, VSCode, Terminal',
      },
      {
        name: 'content',
        label: 'Tip',
        type: 'textarea',
        placeholder: 'Quick tip or trick...',
        required: true,
      },
    ],
    example: 'Git tip: Use `git commit --amend --no-edit` to add changes to the last commit without changing the message. Super useful for quick fixes before pushing.',
  },
];

export function getTemplate(id: string): MemoryTemplate | undefined {
  return memoryTemplates.find(t => t.id === id);
}

export function formatTemplateContent(template: MemoryTemplate, values: Record<string, any>): string {
  // Format content based on template type
  let content = values.content || '';
  
  // Add metadata to content for better context
  const metadata: string[] = [];
  
  if (values.problemName) {
    metadata.push(`Problem: ${values.problemName}`);
  }
  
  if (values.meetingTitle) {
    metadata.push(`Meeting: ${values.meetingTitle}`);
  }
  
  if (values.position) {
    metadata.push(`Position: ${values.position}`);
  }
  
  if (metadata.length > 0) {
    content = `${metadata.join(' | ')}\n\n${content}`;
  }
  
  return content;
}

export function extractMetadataFromTemplate(template: MemoryTemplate, values: Record<string, any>) {
  const metadata: Record<string, any> = {
    type: template.type,
    priority: values.priority || 'medium',
    reviewed: false,
    createdViaTemplate: template.id,
  };

  // Add template-specific metadata
  if (values.subject) metadata.subject = values.subject;
  if (values.company) metadata.company = values.company;
  if (values.position) metadata.position = values.position;
  if (values.deadline) metadata.deadline = values.deadline;
  if (values.problemName) metadata.problemName = values.problemName;
  if (values.meetingTitle) metadata.meetingTitle = values.meetingTitle;

  return metadata;
}
