import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronRight,
  ClipboardCheck,
  LogOut,
  Plus,
  Sparkles,
} from 'lucide-react'
import {
  api,
  ApiUnauthorizedError,
  Project as ApiProject,
  Insight,
  Report,
  Prd,
  setAccessTokenProvider,
  TaskRun,
  Workspace,
} from './lib/api'
import { supabase } from './lib/supabase'
import { AuthModal, type AuthMode } from './components/AuthModal'
import { EditProjectModal, type EditProjectForm } from './components/EditProjectModal'
import { GlassAlert } from './components/GlassAlert'
import { LoadingScreen } from './components/LoadingScreen'
import { MarketingPage } from './components/MarketingPage'
import {
  ProjectsDashboard,
  type ProjectFilters,
} from './components/ProjectsDashboard'

type Step = 'Project' | 'Inputs' | 'Insights' | 'Report' | 'PRD' | 'Tasks'
type View = 'projects' | Step | 'complete'
type ShellMode = 'marketing' | 'app'

type Project = {
  id: string
  name: string
  initiative: string
  stage: Step
  updated: string
  status: string
  context?: string
  goal?: string
}

const steps: Step[] = ['Project', 'Inputs', 'Insights', 'Report', 'PRD', 'Tasks']

const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  search: '',
  stage: 'All',
  status: 'All',
  includeArchived: false,
}

function toListProjectsParams(filters: ProjectFilters) {
  return {
    search: filters.search.trim() || undefined,
    stage: filters.stage !== 'All' ? filters.stage : undefined,
    status: filters.status !== 'All' ? filters.status : undefined,
    includeArchived: filters.includeArchived || undefined,
  }
}

const DEMO_PROJECT_ID = 'demo-local'

/** Local-only preview project; never mixed with API-backed project list. */
const demoProject: Project = {
  id: DEMO_PROJECT_ID,
  name: 'Match Experience Improvement (demo)',
  initiative: 'Improve match discovery, join flow, and reminder experience',
  stage: 'Insights',
  updated: 'Demo',
  status: 'Sample preview',
  context:
    'Recent user feedback suggests friction across the match experience. Users report confusion when finding past sessions, too many steps to join matches, and weak reminder timing.',
  goal:
    'Turn recent user feedback into structured product insight, a draft PRD, and a task breakdown for product planning.',
}

const sampleInput = `- The app is useful but finding past sessions is confusing.
- I want an easier way to reschedule matches.
- Notifications are helpful, but there are too many of them.
- It takes too many steps to join a match.
- I would love better filters for searching players.
- Match reminders sometimes come too late.
- I’m not always sure whether a match is confirmed or not.
- It would help if I could quickly see my upcoming matches in one place.
- Search results are okay, but filtering by skill level would help a lot.
- Sometimes the notification arrives after I have already missed the session.`

const insightData = {
  summary:
    'Users clearly value the match experience, but friction appears across discoverability, join flow, reminder timing, and search quality. The strongest product opportunities are simplifying the join flow, improving reminders, and making session information easier to access.',
  themes: [
    'Navigation and discoverability',
    'Match join flow',
    'Scheduling and rescheduling',
    'Notifications and reminder timing',
    'Search and filtering',
  ],
  painPoints: [
    'Users struggle to find past and upcoming sessions',
    'Joining a match feels too complex',
    'Reminder timing is unreliable or too late',
    'Match confirmation is not always clear',
    'Search filters are not specific enough',
  ],
  requests: [
    'Easier rescheduling',
    'Better player filters',
    'Central view for upcoming matches',
    'Clearer match confirmation state',
    'Improved reminder timing',
  ],
  repeated: [
    'Join flow complexity',
    'Reminder timing issues',
    'Session discoverability',
    'Search filtering limitations',
  ],
  priorities: [
    ['High', 'Simplify match join flow'],
    ['High', 'Improve reminder timing and confirmation clarity'],
    ['Medium', 'Improve session discoverability'],
    ['Medium', 'Improve filtering for player search'],
  ] as const,
}

const reportData = {
  executive:
    'SignalForge identified consistent user friction in the end-to-end match experience. The most urgent issues relate to joining matches, receiving timely reminders, and understanding session status. Secondary opportunities include improving discoverability and search quality.',
  findings: [
    'The match join flow feels heavier than expected',
    'Notification timing creates reliability issues',
    'Users need stronger visibility into upcoming and past sessions',
    'Search and filtering need more precision',
  ],
  problems: [
    'Joining a match requires too many steps',
    'Reminder timing is inconsistent',
    'Users cannot easily locate relevant session information',
    'Match state and confirmation are not always obvious',
  ],
  opportunities: [
    'Reduce the number of steps in the join flow',
    'Improve reminder timing logic and visibility',
    'Add a clearer session hub for upcoming and past matches',
    'Improve search filters, especially around skill level',
  ],
  focus:
    'Prioritize workflow simplification and reminder reliability first, then improve discoverability and filtering in a second wave.',
}

const defaultPrd = {
  problem:
    'Users encounter friction across the match experience, especially when joining matches, understanding match state, finding sessions, and relying on reminders. These problems reduce confidence and increase effort in core product flows.',
  goals:
    '- Reduce friction in the match join flow\n- Improve reliability and clarity of reminders\n- Make upcoming and past sessions easier to access\n- Improve search relevance and filtering',
  users:
    '- Active players joining matches regularly\n- Users rescheduling or tracking upcoming sessions\n- Users searching for players or relevant matches',
  scope:
    '- Match join flow simplification\n- Reminder timing improvements\n- Session visibility improvements\n- Better search filters',
  nonGoals:
    '- Full redesign of the entire match ecosystem\n- New social features\n- Large-scale ranking system changes',
  metrics:
    '- Reduction in join-flow drop-off\n- Increase in successful match joins\n- Improvement in reminder engagement\n- Increase in session view usage\n- Increase in filtered search usage',
  risks:
    '- Improvements may span multiple surfaces in the product\n- Reminder improvements may depend on technical delivery constraints\n- Search/filter improvements may require additional data quality work',
  questions:
    '- Should reminder improvements be product-only or include infrastructure changes?\n- Should session visibility live in one hub or multiple surfaces?\n- What is the minimum viable improvement for confirmation clarity?',
}

const tasksData = {
  buckets: [
    {
      name: 'Match join flow',
      tasks: [
        'Audit current join flow steps',
        'Identify removable or mergeable steps',
        'Propose simplified join interaction',
        'Define success and failure states',
      ],
    },
    {
      name: 'Reminder and confirmation system',
      tasks: [
        'Audit current reminder timing logic',
        'Define improved reminder timing rules',
        'Add clearer confirmation state messaging',
        'Prepare acceptance criteria for reminder reliability',
      ],
    },
    {
      name: 'Session visibility',
      tasks: [
        'Design upcoming and past session visibility model',
        'Define information hierarchy for session hub',
        'Clarify where match state should appear',
      ],
    },
  ],
  stories: [
    'As a player, I want to join a match in fewer steps so I can complete the action faster.',
    'As a player, I want reliable reminders so I do not miss scheduled sessions.',
    'As a player, I want to clearly see whether a match is confirmed so I know what to expect.',
    'As a player, I want better search filters so I can find relevant players more efficiently.',
  ],
  criteria: [
    'The join flow removes unnecessary steps and keeps the path clear.',
    'Reminder timing is triggered early enough for user action.',
    'Match confirmation state is visible in relevant session surfaces.',
    'Users can filter search results using more specific criteria.',
  ],
}

function normalizeStage(stage?: string): Step {
  if (
    stage === 'Project' ||
    stage === 'Inputs' ||
    stage === 'Insights' ||
    stage === 'Report' ||
    stage === 'PRD' ||
    stage === 'Tasks'
  ) {
    return stage
  }

  return 'Project'
}

function formatUpdated(dateString?: string) {
  if (!dateString) return 'Unknown'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function mapApiProject(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    initiative: project.initiative ?? 'No initiative provided',
    stage: normalizeStage(project.currentStage),
    updated: formatUpdated(project.updatedAt),
    status: project.status,
    context: project.backgroundContext,
    goal: project.analysisGoal,
  }
}

function mapPrd(apiPrd: Prd) {
  return {
    problem: apiPrd.problemStatement,
    goals: apiPrd.goalsText,
    users: apiPrd.targetUsersText,
    scope: apiPrd.scopeText,
    nonGoals: apiPrd.nonGoalsText,
    metrics: apiPrd.successMetricsText,
    risks: apiPrd.risksText,
    questions: apiPrd.openQuestionsText,
  }
}

function AppTopNav({
  onGoProjects,
  onBackToSite,
  onLogout,
  userEmail,
}: {
  onGoProjects: () => void
  onBackToSite: () => void
  onLogout: () => void
  userEmail?: string
}) {
  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'SF'

  return (
    <header className="topbar glass-nav app-topbar">
      <button type="button" className="brand" onClick={onGoProjects}>
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        <span>
          <span className="brand-kicker">Workspace</span>
          <span className="brand-name">SignalForge</span>
        </span>
      </button>

      <nav className="top-links top-links-auth">
        <button type="button" className="nav-text-btn" onClick={onBackToSite}>
          Website
        </button>
        <button type="button" className="nav-text-btn nav-text-btn-active" onClick={onGoProjects}>
          Projects
        </button>
        {userEmail ? (
          <div className="user-menu-chip" title={userEmail}>
            <span className="user-menu-avatar">{initials}</span>
            <span className="auth-user-email">{userEmail}</span>
          </div>
        ) : null}
        <button type="button" className="btn-logout" onClick={onLogout}>
          <LogOut size={15} /> Sign out
        </button>
      </nav>
    </header>
  )
}

function NoProjectPrompt({
  onCreateProject,
  onGoProjects,
}: {
  onCreateProject: () => void
  onGoProjects: () => void
}) {
  return (
    <section className="glass-card section-card">
      <div className="section-head">
        <h3>Create a project first</h3>
        <p>
          Create a SignalForge project to turn raw feedback into structured
          insights, a report, PRD, and execution-ready tasks.
        </p>
      </div>

      <div className="button-row stack-top-lg">
        <button className="btn btn-dark" onClick={onCreateProject}>
          <Plus size={16} /> Create project
        </button>
        <button className="btn btn-light" onClick={onGoProjects}>
          Back to projects
        </button>
      </div>
    </section>
  )
}

function StepShell({
  project,
  view,
  onStepClick,
  isDemoMode,
  children,
}: {
  project: Project
  view: View
  onStepClick: (step: Step) => void
  isDemoMode?: boolean
  children: React.ReactNode
}) {
  const stageIndex = steps.indexOf(project.stage)
  const progressPercent =
    stageIndex >= 0 ? ((stageIndex + 1) / steps.length) * 100 : 0

  return (
    <div className="step-shell">
      {isDemoMode ? (
        <div className="glass-card demo-banner">
          <strong>Demo preview</strong>
          <p className="muted-copy">
            Sample content only. Create a project and sync with the backend to
            save real outputs.
          </p>
        </div>
      ) : null}

      <div className="project-bar glass-card project-bar-premium">
        <div className="project-bar-top">
          <div>
            <div className="muted-label">Current project</div>
            <h2>{project.name}</h2>
            <p className="muted-copy">{project.initiative}</p>
          </div>

          <div className="pill-row">
            <span className="pill pill-stage">{project.stage}</span>
            <span className="pill">{project.status}</span>
            <span className="pill pill-muted">Updated {project.updated}</span>
          </div>
        </div>

        <div className="workflow-progress" aria-hidden>
          <div className="workflow-progress-track">
            <div
              className="workflow-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="workflow-nav workflow-nav-scroll">
          {steps.map((step, index) => {
            const active = view === step
            const completed = steps.indexOf(project.stage) > index
            const enabled = steps.indexOf(project.stage) >= index || active

            return (
              <button
                key={step}
                type="button"
                onClick={() => enabled && onStepClick(step)}
                className={[
                  'step-btn',
                  active ? 'step-btn-active' : '',
                  completed ? 'step-btn-complete' : '',
                  !enabled ? 'step-btn-disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="step-btn-index">{index + 1}</span>
                {step}
              </button>
            )
          })}
        </div>
      </div>

      {children}
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="glass-card section-card content-panel">
      <div className="section-head">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>

      {children}
    </section>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="list-block glass-inset">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authNotice, setAuthNotice] = useState<string | null>(null)
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [shellMode, setShellMode] = useState<ShellMode>('marketing')

  const [view, setView] = useState<View>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [archivingProjectId, setArchivingProjectId] = useState<string | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [projectFilters, setProjectFilters] =
    useState<ProjectFilters>(DEFAULT_PROJECT_FILTERS)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)
  const [editProjectForm, setEditProjectForm] = useState<EditProjectForm>({
    name: '',
    initiative: '',
    context: '',
    goal: '',
  })
  const [isSavingProjectEdit, setIsSavingProjectEdit] = useState(false)

  const [inputText, setInputText] = useState(sampleInput)

  const [apiInsight, setApiInsight] = useState<Insight | null>(null)
  const [apiReport, setApiReport] = useState<Report | null>(null)
  const [apiTasks, setApiTasks] = useState<TaskRun | null>(null)

  const [projectForm, setProjectForm] = useState({
    name: 'Match Experience Improvement',
    initiative: 'Improve match discovery, join flow, and reminder experience',
    context:
      'Recent user feedback suggests friction across the match experience. Users report confusion when finding past sessions, too many steps to join matches, and weak reminder timing.',
    goal:
      'Turn recent user feedback into structured product insight, a draft PRD, and a task breakdown for product planning.',
  })

  const [prd, setPrd] = useState(defaultPrd)

  const currentProject = useMemo(() => {
    if (isDemoMode) return demoProject
    if (!currentProjectId) return undefined
    return projects.find((project) => project.id === currentProjectId)
  }, [projects, currentProjectId, isDemoMode])

  const activeProjectId = isDemoMode ? null : currentProjectId

  const createFlowProject = useMemo(
    (): Project => ({
      id: 'new',
      name: projectForm.name || 'New project',
      initiative: projectForm.initiative || 'No initiative provided',
      stage: 'Project',
      updated: 'Now',
      status: 'Draft',
      context: projectForm.context,
      goal: projectForm.goal,
    }),
    [projectForm],
  )

  const stepShellProject = currentProject ?? createFlowProject

  const feedbackCount = useMemo(
    () =>
      inputText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean).length,
    [inputText],
  )

  const renderedInsight = {
    summary: apiInsight?.summary ?? insightData.summary,
    themes: apiInsight?.themes ?? insightData.themes,
    painPoints: apiInsight?.painPoints ?? insightData.painPoints,
    requests: apiInsight?.featureRequests ?? insightData.requests,
    repeated: apiInsight?.repeatedSignals ?? insightData.repeated,
    priorities:
      apiInsight?.priorityCues.map((item) => [item.level, item.text] as const) ??
      insightData.priorities,
  }

  const renderedReport = {
    executive: apiReport?.executiveSummary ?? reportData.executive,
    findings: apiReport?.keyFindings ?? reportData.findings,
    problems: apiReport?.topProblems ?? reportData.problems,
    opportunities: apiReport?.opportunities ?? reportData.opportunities,
    focus: apiReport?.recommendedFocus ?? reportData.focus,
  }

  const renderedTasks = {
    buckets: apiTasks?.workBuckets ?? tasksData.buckets,
    stories: apiTasks?.userStories ?? tasksData.stories,
    criteria: apiTasks?.acceptanceCriteria ?? tasksData.criteria,
  }

  const hasActiveProjectFilters = useMemo(
    () =>
      projectFilters.search.trim() !== '' ||
      projectFilters.stage !== 'All' ||
      projectFilters.status !== 'All' ||
      projectFilters.includeArchived,
    [projectFilters],
  )

  useEffect(() => {
    setAccessTokenProvider(async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      return currentSession?.access_token ?? null
    })

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
      if (!nextSession) {
        clearProductState()
        setShellMode('marketing')
        setAuthModalOpen(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (shellMode === 'app' && session?.user?.id) {
      void loadProjectsFromApi()
    }
  }, [shellMode, session?.user?.id])

  useEffect(() => {
    if (!authLoading && shellMode === 'app' && !session) {
      setShellMode('marketing')
      setAuthMode('sign-in')
      setAuthError(null)
      setAuthNotice(null)
      setAuthModalOpen(true)
    }
  }, [authLoading, shellMode, session])

  function clearWorkspaceOutputs() {
    setApiInsight(null)
    setApiReport(null)
    setApiTasks(null)
    setPrd(defaultPrd)
    setInputText(sampleInput)
  }

  function clearProductState() {
    setProjects([])
    setCurrentProjectId(null)
    setIsDemoMode(false)
    clearWorkspaceOutputs()
    setApiError(null)
    setView('projects')
    setOpeningProjectId(null)
    setEditingProjectId(null)
    setArchivingProjectId(null)
    setDeletingProjectId(null)
    setEditProjectId(null)
    setProjectFilters(DEFAULT_PROJECT_FILTERS)
    setIsLoading(false)
  }

  function leaveCurrentProject() {
    setCurrentProjectId(null)
    clearWorkspaceOutputs()
    setView('projects')
  }

  function openAuthModal(mode: AuthMode = 'sign-in') {
    setAuthMode(mode)
    setAuthError(null)
    setAuthNotice(null)
    setAuthModalOpen(true)
  }

  function closeAuthModal() {
    if (isAuthSubmitting) return
    setAuthModalOpen(false)
    setAuthError(null)
    setAuthNotice(null)
  }

  function enterAppWorkspace() {
    if (!session) {
      openAuthModal('sign-in')
      return
    }

    setShellMode('app')
    setView('projects')
    void loadProjectsFromApi()
  }

  function returnToMarketing() {
    setShellMode('marketing')
    setApiError(null)
  }

  function resolveApiError(error: unknown, fallback: string) {
    if (error instanceof ApiUnauthorizedError) {
      setAuthError(error.message)
      void supabase.auth.signOut()
      return error.message
    }

    return error instanceof Error ? error.message : fallback
  }

  async function handleSignIn() {
    setAuthError(null)
    setAuthNotice(null)
    setIsAuthSubmitting(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    })

    if (error) {
      setAuthError(error.message)
    } else if (data.session) {
      setAuthModalOpen(false)
      setShellMode('app')
      setView('projects')
    }

    setIsAuthSubmitting(false)
  }

  async function handleSignUp() {
    setAuthError(null)
    setAuthNotice(null)
    setIsAuthSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPassword,
    })

    if (error) {
      setAuthError(error.message)
    } else if (data.session) {
      setAuthModalOpen(false)
      setShellMode('app')
      setView('projects')
    } else {
      setAuthNotice(
        'Account created. Check your email if confirmation is required, then sign in.',
      )
      setAuthMode('sign-in')
    }

    setIsAuthSubmitting(false)
  }

  async function handleSignOut() {
    setAuthError(null)
    setAuthNotice(null)
    await supabase.auth.signOut()
    clearProductState()
    setShellMode('marketing')
    setAuthModalOpen(false)
  }

  async function loadProjectsFromApi(filtersOverride?: ProjectFilters) {
    if (isLoading || !session) return

    const filters = filtersOverride ?? projectFilters

    try {
      setIsLoading(true)
      setApiError(null)

      const data = await api.listProjects(toListProjectsParams(filters))
      const mappedProjects = data.map(mapApiProject)
      setProjects(mappedProjects)
      setApiError(null)
      setIsDemoMode(false)

      if (
        currentProjectId &&
        !mappedProjects.some((project) => project.id === currentProjectId)
      ) {
        leaveCurrentProject()
      }
    } catch (error) {
      setApiError(resolveApiError(error, 'Could not load projects from backend.'))
    } finally {
      setIsLoading(false)
    }
  }

  function clearProjectFilters() {
    setProjectFilters(DEFAULT_PROJECT_FILTERS)
    void loadProjectsFromApi(DEFAULT_PROJECT_FILTERS)
  }

  function openEditProject(project: Project) {
    setEditProjectId(project.id)
    setEditProjectForm({
      name: project.name,
      initiative: project.initiative,
      context: project.context ?? '',
      goal: project.goal ?? '',
    })
  }

  function closeEditProject() {
    if (isSavingProjectEdit) return
    setEditProjectId(null)
  }

  async function saveEditProject() {
    if (!editProjectId || !editProjectForm.name.trim()) return

    try {
      setIsSavingProjectEdit(true)
      setEditingProjectId(editProjectId)
      setApiError(null)

      const updated = await api.updateProject(editProjectId, {
        name: editProjectForm.name.trim(),
        initiative: editProjectForm.initiative,
        backgroundContext: editProjectForm.context,
        analysisGoal: editProjectForm.goal,
      })

      const mapped = mapApiProject(updated)
      setProjects((prev) =>
        prev.map((project) => (project.id === mapped.id ? mapped : project)),
      )
      setApiError(null)
      setEditProjectId(null)
      flashCopy('Project updated')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to update project.'))
    } finally {
      setIsSavingProjectEdit(false)
      setEditingProjectId(null)
    }
  }

  async function handleArchiveProject(project: Project) {
    if (
      !window.confirm(
        'Archive this project? You can include archived projects later from filters.',
      )
    ) {
      return
    }

    try {
      setArchivingProjectId(project.id)
      setApiError(null)

      await api.archiveProject(project.id)

      if (currentProjectId === project.id) {
        leaveCurrentProject()
      }

      await loadProjectsFromApi()
      flashCopy('Project archived')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to archive project.'))
    } finally {
      setArchivingProjectId(null)
    }
  }

  async function handleDeleteProject(project: Project) {
    if (
      !window.confirm(
        'Delete this project and all generated outputs? This cannot be undone.',
      )
    ) {
      return
    }

    try {
      setDeletingProjectId(project.id)
      setApiError(null)

      await api.deleteProject(project.id)

      if (currentProjectId === project.id) {
        leaveCurrentProject()
      }

      setProjects((prev) => prev.filter((item) => item.id !== project.id))
      flashCopy('Project deleted')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to delete project.'))
    } finally {
      setDeletingProjectId(null)
    }
  }

  function requireBackendProject(): string | null {
    if (!activeProjectId) {
      setApiError('Create a project first to use backend generation.')
      setView('Project')
      return null
    }
    return activeProjectId
  }

  function updateProjectStageLocally(stage: Step, status = 'In progress') {
    if (!activeProjectId) return

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              stage,
              updated: 'Now',
              status,
            }
          : project,
      ),
    )

    setView(stage)
  }

  async function createProject() {
    try {
      setIsLoading(true)
      setApiError(null)

      const created = await api.createProject({
        name: projectForm.name,
        initiative: projectForm.initiative,
        backgroundContext: projectForm.context,
        analysisGoal: projectForm.goal,
      })

      const mapped = mapApiProject(created)

      setApiError(null)
      setIsDemoMode(false)
      setApiInsight(null)
      setApiReport(null)
      setApiTasks(null)
      setPrd(defaultPrd)
      setInputText(sampleInput)
      setProjects((prev) => [mapped, ...prev])
      setCurrentProjectId(mapped.id)
      setView('Inputs')
      flashCopy('Project created')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to create project.'))
    } finally {
      setIsLoading(false)
    }
  }

  function hydrateWorkspace(workspace: Workspace) {
    const mappedProject = mapApiProject(workspace.project)

    setIsDemoMode(false)
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === mappedProject.id)
      if (exists) {
        return prev.map((p) => (p.id === mappedProject.id ? mappedProject : p))
      }
      return [mappedProject, ...prev]
    })

    setCurrentProjectId(mappedProject.id)

    const latestInput = workspace.inputs?.[0]
    if (latestInput?.contentText) {
      setInputText(latestInput.contentText)
    } else {
      setInputText(sampleInput)
    }

    setApiInsight(workspace.latestInsight ?? null)
    setApiReport(workspace.latestReport ?? null)
    setPrd(workspace.latestPrd ? mapPrd(workspace.latestPrd) : defaultPrd)
    setApiTasks(workspace.latestTasks ?? null)

    setView(mappedProject.stage)
  }

  async function openProject(project: Project) {
    if (project.id === DEMO_PROJECT_ID) {
      setIsDemoMode(true)
      setView(project.stage)
      return
    }

    try {
      setOpeningProjectId(project.id)
      setIsLoading(true)
      setApiError(null)

      const workspace = await api.getWorkspace(project.id)
      hydrateWorkspace(workspace)
      setApiError(null)
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to load project workspace.'))
    } finally {
      setOpeningProjectId(null)
      setIsLoading(false)
    }
  }

  function startDemoPreview() {
    setIsDemoMode(true)
    setView('Insights')
  }

  async function generateInsightsFromInput() {
    const projectId = requireBackendProject()
    if (!projectId) return

    try {
      setIsLoading(true)
      setApiError(null)

      if (!inputText.trim()) {
        throw new Error('Input is empty. Add feedback before generating insights.')
      }

      await api.createInput(projectId, {
        title: 'Raw feedback batch',
        inputType: 'raw_text',
        contentText: inputText,
      })

      const insight = await api.generateInsights(projectId)
      setApiInsight(insight)
      setApiError(null)

      updateProjectStageLocally('Insights', 'insights_generated')
      flashCopy('Insights generated')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to generate insights.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function generateReportFromInsights() {
    const projectId = requireBackendProject()
    if (!projectId) return

    try {
      setIsLoading(true)
      setApiError(null)

      const report = await api.generateReport(projectId)
      setApiReport(report)
      setApiError(null)

      updateProjectStageLocally('Report', 'report_generated')
      flashCopy('Report generated')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to generate report.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function generatePrdFromReport() {
    const projectId = requireBackendProject()
    if (!projectId) return

    try {
      setIsLoading(true)
      setApiError(null)

      const generatedPrd = await api.generatePrd(projectId)
      setPrd(mapPrd(generatedPrd))
      setApiError(null)

      updateProjectStageLocally('PRD', 'prd_generated')
      flashCopy('PRD generated')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to generate PRD.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function savePrdAndGenerateTasks() {
    const projectId = requireBackendProject()
    if (!projectId) return

    try {
      setIsLoading(true)
      setApiError(null)

      await api.updatePrd(projectId, {
        problemStatement: prd.problem,
        goalsText: prd.goals,
        targetUsersText: prd.users,
        scopeText: prd.scope,
        nonGoalsText: prd.nonGoals,
        successMetricsText: prd.metrics,
        risksText: prd.risks,
        openQuestionsText: prd.questions,
      })

      const taskRun = await api.generateTasks(projectId)
      setApiTasks(taskRun)
      setApiError(null)

      updateProjectStageLocally('Tasks', 'tasks_generated')
      flashCopy('Tasks generated')
    } catch (error) {
      setApiError(resolveApiError(error, 'Failed to generate tasks.'))
    } finally {
      setIsLoading(false)
    }
  }

  function flashCopy(message: string) {
    setCopied(message)
    window.setTimeout(() => setCopied(null), 1400)
  }

  if (authLoading) {
    return <LoadingScreen />
  }

  if (shellMode === 'marketing') {
    return (
      <div className="app-bg marketing-bg">
        <div className="ambient-gradient" aria-hidden />
        <div className="bg-orb orb-one" />
        <div className="bg-orb orb-two" />
        <div className="bg-orb orb-three" />

        <MarketingPage
          isSignedIn={Boolean(session)}
          userEmail={session?.user.email ?? undefined}
          onStartWorkspace={() => openAuthModal('sign-in')}
          onOpenWorkspace={enterAppWorkspace}
          onSignIn={() => openAuthModal('sign-in')}
          onSignOut={() => void handleSignOut()}
          onScrollToWorkflow={() => {
            document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        <AuthModal
          open={authModalOpen}
          authMode={authMode}
          authEmail={authEmail}
          authPassword={authPassword}
          authError={authError}
          authNotice={authNotice}
          isSubmitting={isAuthSubmitting}
          onClose={closeAuthModal}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onSignIn={() => void handleSignIn()}
          onSignUp={() => void handleSignUp()}
          onToggleMode={() => {
            setAuthError(null)
            setAuthNotice(null)
            setAuthMode((mode) => (mode === 'sign-in' ? 'sign-up' : 'sign-in'))
          }}
        />
      </div>
    )
  }

  if (!session) {
    return <LoadingScreen />
  }

  return (
    <div className="app-bg app-shell-bg">
      <div className="ambient-gradient" aria-hidden />
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-orb orb-three" />

      <AppTopNav
        onGoProjects={() => setView('projects')}
        onBackToSite={returnToMarketing}
        onLogout={() => void handleSignOut()}
        userEmail={session.user.email ?? undefined}
      />

      <main className="container app-main">
        {apiError ? (
          <GlassAlert
            message={apiError}
            onRetry={() => void loadProjectsFromApi()}
            onDismiss={() => setApiError(null)}
          />
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {view === 'projects' && (
              <ProjectsDashboard
                projects={projects}
                filters={projectFilters}
                hasActiveFilters={hasActiveProjectFilters}
                isLoading={isLoading}
                openingProjectId={openingProjectId}
                editingProjectId={editingProjectId}
                archivingProjectId={archivingProjectId}
                deletingProjectId={deletingProjectId}
                onFiltersChange={setProjectFilters}
                onApplyFilters={() => void loadProjectsFromApi()}
                onClearFilters={clearProjectFilters}
                onCreateProject={() => {
                  setIsDemoMode(false)
                  setView('Project')
                }}
                onOpenProject={(project) => void openProject(project as Project)}
                onEditProject={(p) => openEditProject(p as Project)}
                onArchiveProject={(project) =>
                  void handleArchiveProject(project as Project)
                }
                onDeleteProject={(project) =>
                  void handleDeleteProject(project as Project)
                }
                onSync={() => void loadProjectsFromApi()}
              />
            )}

            {view === 'Project' && (
              <StepShell
                project={stepShellProject}
                view={view}
                onStepClick={(step) => setView(step)}
              >
                <SectionCard
                  title="Create a new project"
                  description="Define the context for your analysis before turning feedback into insights, PRDs, and tasks."
                >
                  <div className="form-grid">
                    <div className="field">
                      <label>Project name</label>
                      <input
                        value={projectForm.name}
                        onChange={(event) =>
                          setProjectForm({
                            ...projectForm,
                            name: event.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Feature or initiative</label>
                      <input
                        value={projectForm.initiative}
                        onChange={(event) =>
                          setProjectForm({
                            ...projectForm,
                            initiative: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="field stack-top">
                    <label>Background context</label>
                    <textarea
                      value={projectForm.context}
                      onChange={(event) =>
                        setProjectForm({
                          ...projectForm,
                          context: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field stack-top">
                    <label>Analysis goal</label>
                    <textarea
                      value={projectForm.goal}
                      onChange={(event) =>
                        setProjectForm({
                          ...projectForm,
                          goal: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="button-row stack-top-lg">
                    <button
                      className="btn btn-dark"
                      onClick={createProject}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create project'}{' '}
                      <ChevronRight size={16} />
                    </button>

                    <button className="btn btn-light" onClick={() => setView('projects')}>
                      Cancel
                    </button>
                  </div>
                </SectionCard>
              </StepShell>
            )}

            {view === 'Inputs' &&
              (currentProject ? (
              <StepShell
                project={currentProject}
                view={view}
                isDemoMode={isDemoMode}
                onStepClick={(step) => setView(step)}
              >
                <div className="grid-2-wide">
                  <SectionCard
                    title="Add product inputs"
                    description="Paste feedback, notes, table-like content, or upload a CSV file to begin analysis."
                  >
                    <div className="helper-box">
                      <strong>Supported input types</strong>
                      <p>
                        SignalForge v1 accepts raw user feedback, interview
                        notes, support patterns, survey responses, structured
                        text blocks, and CSV input.
                      </p>
                    </div>

                    <div className="field stack-top">
                      <label>Raw feedback</label>
                      <textarea
                        className="tall-textarea"
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                      />
                      <div className="small-copy">
                        {feedbackCount} raw feedback lines ready to analyze.
                      </div>
                    </div>

                    <div className="button-row stack-top-lg">
                      <button
                        className="btn btn-indigo"
                        onClick={generateInsightsFromInput}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Generating...' : 'Generate insights'}
                      </button>

                      <button
                        className="btn btn-light"
                        onClick={() => setInputText(sampleInput)}
                      >
                        Use demo content
                      </button>

                      <button className="btn btn-light" onClick={() => setInputText('')}>
                        Clear input
                      </button>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Structured input guidance"
                    description="The first prototype uses a realistic mixed-source scenario."
                  >
                    <div className="helper-box stack-md">
                      <div>
                        <strong>Structured notes</strong>
                        <p>
                          Source mix: in-app feedback, support messages, survey
                          responses.
                        </p>
                      </div>

                      <div className="upload-box">
                        <strong>CSV upload</strong>
                        <p>
                          In the first prototype, CSV upload is represented as a
                          simulated upload area instead of a fully working parser.
                        </p>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </StepShell>
              ) : (
                <NoProjectPrompt
                  onCreateProject={() => setView('Project')}
                  onGoProjects={() => setView('projects')}
                />
              ))}

            {view === 'Insights' &&
              (currentProject ? (
              <StepShell
                project={currentProject}
                view={view}
                isDemoMode={isDemoMode}
                onStepClick={(step) => setView(step)}
              >
                <SectionCard
                  title="Structured insights"
                  description="SignalForge analyzed the input and organized it into actionable product signals."
                >
                  <div className="summary-box">
                    <strong>Summary insight</strong>
                    <p>{renderedInsight.summary}</p>
                  </div>

                  <div className="grid-2 stack-top-lg">
                    <ListBlock title="Themes" items={renderedInsight.themes} />
                    <ListBlock title="Pain points" items={renderedInsight.painPoints} />
                  </div>

                  <div className="grid-2 stack-top">
                    <ListBlock
                      title="Feature requests"
                      items={renderedInsight.requests}
                    />
                    <ListBlock
                      title="Repeated signals"
                      items={renderedInsight.repeated}
                    />
                  </div>

                  <div className="priority-box stack-top">
                    <strong>Priority cues</strong>
                    <div className="stack-top">
                      {renderedInsight.priorities.map(([level, text]) => (
                        <div key={text} className="priority-item">
                          <span
                            className={
                              level === 'High'
                                ? 'badge badge-red'
                                : 'badge badge-amber'
                            }
                          >
                            {level}
                          </span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="button-row stack-top-lg">
                    <button
                      className="btn btn-dark"
                      onClick={generateReportFromInsights}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Generate report'}
                    </button>

                    <button className="btn btn-light" onClick={() => setView('Inputs')}>
                      Refine input
                    </button>
                  </div>
                </SectionCard>
              </StepShell>
              ) : (
                <NoProjectPrompt
                  onCreateProject={() => setView('Project')}
                  onGoProjects={() => setView('projects')}
                />
              ))}

            {view === 'Report' &&
              (currentProject ? (
              <StepShell
                project={currentProject}
                view={view}
                isDemoMode={isDemoMode}
                onStepClick={(step) => setView(step)}
              >
                <SectionCard
                  title="Insight report"
                  description="A concise summary of findings for product review and stakeholder communication."
                >
                  <div className="stack-md">
                    <ListBlock
                      title="Executive summary"
                      items={[renderedReport.executive]}
                    />

                    <div className="grid-2">
                      <ListBlock title="Key findings" items={renderedReport.findings} />
                      <ListBlock title="Top problems" items={renderedReport.problems} />
                    </div>

                    <div className="grid-2">
                      <ListBlock
                        title="Suggested opportunities"
                        items={renderedReport.opportunities}
                      />
                      <ListBlock
                        title="Recommended focus"
                        items={[renderedReport.focus]}
                      />
                    </div>
                  </div>

                  <div className="button-row stack-top-lg">
                    <button
                      className="btn btn-dark"
                      onClick={generatePrdFromReport}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Generate PRD draft'}
                    </button>

                    <button className="btn btn-light" onClick={() => setView('Insights')}>
                      Back to insights
                    </button>

                    <button
                      className="btn btn-light"
                      onClick={() => flashCopy('Report copied')}
                    >
                      Copy report
                    </button>
                  </div>
                </SectionCard>
              </StepShell>
              ) : (
                <NoProjectPrompt
                  onCreateProject={() => setView('Project')}
                  onGoProjects={() => setView('projects')}
                />
              ))}

            {view === 'PRD' &&
              (currentProject ? (
              <StepShell
                project={currentProject}
                view={view}
                isDemoMode={isDemoMode}
                onStepClick={(step) => setView(step)}
              >
                <SectionCard
                  title="PRD draft"
                  description="SignalForge converted the validated insight into a standardized product requirements document."
                >
                  <div className="stack-md">
                    {[
                      ['Problem statement', 'problem'],
                      ['Goals', 'goals'],
                      ['Target users', 'users'],
                      ['Scope', 'scope'],
                      ['Non-goals', 'nonGoals'],
                      ['Success metrics', 'metrics'],
                      ['Risks', 'risks'],
                      ['Open questions', 'questions'],
                    ].map(([label, key]) => (
                      <div className="field-block" key={key}>
                        <label>{label}</label>
                        <textarea
                          value={prd[key as keyof typeof prd]}
                          onChange={(event) =>
                            setPrd({
                              ...prd,
                              [key]: event.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="button-row stack-top-lg">
                    <button
                      className="btn btn-dark"
                      onClick={savePrdAndGenerateTasks}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Generate task draft'}
                    </button>

                    <button
                      className="btn btn-light"
                      onClick={() => flashCopy('PRD copied')}
                    >
                      Copy PRD
                    </button>
                  </div>
                </SectionCard>
              </StepShell>
              ) : (
                <NoProjectPrompt
                  onCreateProject={() => setView('Project')}
                  onGoProjects={() => setView('projects')}
                />
              ))}

            {view === 'Tasks' &&
              (currentProject ? (
              <StepShell
                project={currentProject}
                view={view}
                isDemoMode={isDemoMode}
                onStepClick={(step) => setView(step)}
              >
                <SectionCard
                  title="Task draft"
                  description="SignalForge converted the PRD into execution-ready work items for delivery planning."
                >
                  <div className="grid-3 stack-top">
                    {renderedTasks.buckets.map((bucket) => (
                      <div key={bucket.name} className="list-block">
                        <h4>{bucket.name}</h4>
                        <ul>
                          {bucket.tasks.map((task) => (
                            <li key={task}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid-2 stack-top-lg">
                    <ListBlock title="User stories" items={renderedTasks.stories} />
                    <ListBlock
                      title="Acceptance criteria"
                      items={renderedTasks.criteria}
                    />
                  </div>

                  <div className="button-row stack-top-lg">
                    <button
                      className="btn btn-dark"
                      onClick={() => {
                        updateProjectStageLocally('Tasks', 'Workflow complete')
                        setView('complete')
                      }}
                    >
                      Complete workflow
                    </button>

                    <button
                      className="btn btn-light"
                      onClick={() => flashCopy('Tasks copied')}
                    >
                      Copy tasks
                    </button>
                  </div>
                </SectionCard>
              </StepShell>
              ) : (
                <NoProjectPrompt
                  onCreateProject={() => setView('Project')}
                  onGoProjects={() => setView('projects')}
                />
              ))}

            {view === 'complete' && (
              <section className="completion-wrap">
                <div className="completion-card">
                  <span className="badge badge-white-soft">Workflow complete</span>

                  <h2>SignalForge generated reusable outputs for this project</h2>

                  <p>
                    Your project now includes structured insights, a summary
                    report, a PRD draft, and task outputs for planning and
                    delivery.
                  </p>

                  <div className="grid-4 stack-top-lg">
                    {[
                      'Structured insights',
                      'Report draft',
                      'PRD draft',
                      'Task draft',
                    ].map((item) => (
                      <div key={item} className="completion-item">
                        <div className="muted-light">Generated output</div>
                        <strong>{item}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="button-row stack-top-lg">
                    <button className="btn btn-white" onClick={() => setView('projects')}>
                      Return to projects
                    </button>

                    <button className="btn btn-outline-white" onClick={() => setView('Project')}>
                      Create another project
                    </button>

                    <button
                      className="btn btn-outline-white"
                      onClick={() => flashCopy('Final outputs copied')}
                    >
                      Copy final outputs
                    </button>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <EditProjectModal
        open={editProjectId !== null}
        form={editProjectForm}
        isSaving={isSavingProjectEdit}
        onClose={closeEditProject}
        onChange={setEditProjectForm}
        onSave={() => void saveEditProject()}
      />

      {copied ? (
        <div className="toast">
          <ClipboardCheck size={16} />
          <span>{copied}</span>
        </div>
      ) : null}
    </div>
  )
}