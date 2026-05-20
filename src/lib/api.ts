const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(options?.headers ?? {}),
      },
    });
  
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || `Request failed with status ${response.status}`);
    }
  
    return response.json() as Promise<T>;
  }
export type Project = {
  id: string;
  name: string;
  initiative?: string;
  backgroundContext?: string;
  analysisGoal?: string;
  currentStage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  id: string;
  projectId: string;
  inputType: string;
  title?: string;
  contentText: string;
  contentJson?: string;
  createdAt: string;
  updatedAt: string;
};

export type Insight = {
  id: string;
  projectId: string;
  status: string;
  summary: string;
  themes: string[];
  painPoints: string[];
  featureRequests: string[];
  repeatedSignals: string[];
  priorityCues: { level: string; text: string }[];
  createdAt: string;
  updatedAt: string;
};

export type Report = {
  id: string;
  projectId: string;
  status: string;
  executiveSummary: string;
  keyFindings: string[];
  topProblems: string[];
  opportunities: string[];
  recommendedFocus: string;
  createdAt: string;
  updatedAt: string;
};

export type Prd = {
  id: string;
  projectId: string;
  status: string;
  problemStatement: string;
  goalsText: string;
  targetUsersText: string;
  scopeText: string;
  nonGoalsText: string;
  successMetricsText: string;
  risksText: string;
  openQuestionsText: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskRun = {
  id: string;
  projectId: string;
  status: string;
  workBuckets: { name: string; tasks: string[] }[];
  tasks: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
};

export const api = {
  listProjects() {
    return request<Project[]>('/projects');
  },

  createProject(data: {
    name: string;
    initiative?: string;
    backgroundContext?: string;
    analysisGoal?: string;
  }) {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createInput(
    projectId: string,
    data: {
      title?: string;
      inputType?: string;
      contentText: string;
      contentJson?: string;
    },
  ) {
    return request<ProjectInput>(`/projects/${projectId}/inputs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  generateInsights(projectId: string) {
    return request<Insight>(`/projects/${projectId}/insights/generate`, {
      method: 'POST',
    });
  },

  getLatestInsights(projectId: string) {
    return request<Insight>(`/projects/${projectId}/insights/latest`);
  },

  generateReport(projectId: string) {
    return request<Report>(`/projects/${projectId}/reports/generate`, {
      method: 'POST',
    });
  },

  getLatestReport(projectId: string) {
    return request<Report>(`/projects/${projectId}/reports/latest`);
  },

  generatePrd(projectId: string) {
    return request<Prd>(`/projects/${projectId}/prd/generate`, {
      method: 'POST',
    });
  },

  getLatestPrd(projectId: string) {
    return request<Prd>(`/projects/${projectId}/prd/latest`);
  },

  updatePrd(
    projectId: string,
    data: Partial<{
      problemStatement: string;
      goalsText: string;
      targetUsersText: string;
      scopeText: string;
      nonGoalsText: string;
      successMetricsText: string;
      risksText: string;
      openQuestionsText: string;
    }>,
  ) {
    return request<Prd>(`/projects/${projectId}/prd/latest`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  generateTasks(projectId: string) {
    return request<TaskRun>(`/projects/${projectId}/tasks/generate`, {
      method: 'POST',
    });
  },

  getLatestTasks(projectId: string) {
    return request<TaskRun>(`/projects/${projectId}/tasks/latest`);
  },
};