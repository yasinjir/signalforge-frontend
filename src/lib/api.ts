// Backend/product backlog (see README.md and docs/DEPLOYMENT.md):
// 5. Better error UI — toast, inline retry, error types
// 7. Real LLM pipeline for insights/report/PRD/tasks generation

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

let getAccessToken: (() => Promise<string | null>) | null = null;

export function setAccessTokenProvider(
  provider: () => Promise<string | null>,
) {
  getAccessToken = provider;
}

export class ApiUnauthorizedError extends Error {
  constructor(message = 'Your session expired. Please sign in again.') {
    super(message);
    this.name = 'ApiUnauthorizedError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = Boolean(options?.body);
  const token = getAccessToken ? await getAccessToken() : null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      cache: 'no-store',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });

    if (response.status === 401) {
      throw new ApiUnauthorizedError();
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        errorBody ||
          `Request failed: ${response.status} ${response.statusText} for ${path}`,
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiUnauthorizedError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`API request failed for ${path}: ${error.message}`);
    }

    throw new Error(`API request failed for ${path}`);
  }
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

export type Workspace = {
  project: Project;
  inputs: ProjectInput[];
  latestInsight: Insight | null;
  latestReport: Report | null;
  latestPrd: Prd | null;
  latestTasks: TaskRun | null;
};

export type UpdateProjectInput = {
  name?: string;
  initiative?: string;
  backgroundContext?: string;
  analysisGoal?: string;
  status?: string;
};

export type DeleteProjectResponse = {
  deleted: boolean;
  id: string;
};

export type ListProjectsParams = {
  search?: string;
  stage?: string;
  status?: string;
  includeArchived?: boolean;
};

function buildProjectsQuery(params?: ListProjectsParams): string {
  if (!params) return '';

  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  if (params.stage?.trim()) {
    query.set('stage', params.stage.trim());
  }

  if (params.status?.trim()) {
    query.set('status', params.status.trim());
  }

  if (params.includeArchived) {
    query.set('includeArchived', 'true');
  }

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  listProjects(params?: ListProjectsParams) {
    return request<Project[]>(`/projects${buildProjectsQuery(params)}`);
  },

  getWorkspace(projectId: string) {
    return request<Workspace>(`/projects/${projectId}/workspace`);
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

  updateProject(projectId: string, data: UpdateProjectInput) {
    return request<Project>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  archiveProject(projectId: string) {
    return request<Project>(`/projects/${projectId}/archive`, {
      method: 'PATCH',
    });
  },

  deleteProject(projectId: string) {
    return request<DeleteProjectResponse>(`/projects/${projectId}`, {
      method: 'DELETE',
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
