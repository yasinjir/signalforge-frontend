import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Layers3,
  ListChecks,
  Plus,
  Sparkles,
} from 'lucide-react'
import {
  api,
  Project as ApiProject,
  Insight,
  Report,
  Prd,
  TaskRun,
} from './lib/api'

type Step = 'Project' | 'Inputs' | 'Insights' | 'Report' | 'PRD' | 'Tasks'
type View = 'landing' | 'projects' | Step | 'complete'

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

const seedProjects: Project[] = [
  {
    id: '1',
    name: 'Match Experience Improvement',
    initiative: 'Improve match discovery, join flow, and reminder experience',
    stage: 'Insights',
    updated: 'Today',
    status: 'In progress',
    context:
      'Recent user feedback suggests friction across the match experience. Users report confusion when finding past sessions, too many steps to join matches, and weak reminder timing.',
    goal:
      'Turn recent user feedback into structured product insight, a draft PRD, and a task breakdown for product planning.',
  },
  {
    id: '2',
    name: 'Player Search Quality Review',
    initiative: 'Improve search relevance and filtering experience',
    stage: 'Report',
    updated: 'Yesterday',
    status: 'Review ready',
  },
  {
    id: '3',
    name: 'Session Visibility Update',
    initiative: 'Make upcoming and past sessions easier to access',
    stage: 'PRD',
    updated: '2 days ago',
    status: 'Draft in progress',
  },
]

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

function TopNav({
  onGoLanding,
  onGoProjects,
}: {
  onGoLanding: () => void
  onGoProjects: () => void
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onGoLanding}>
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        <span>
          <span className="brand-kicker">Product operations platform</span>
          <span className="brand-name">SignalForge</span>
        </span>
      </button>

      <nav className="top-links">
        <button onClick={onGoLanding}>Overview</button>
        <button onClick={onGoProjects}>Projects</button>
      </nav>
    </header>
  )
}

function StepShell({
  project,
  view,
  onStepClick,
  children,
}: {
  project: Project
  view: View
  onStepClick: (step: Step) => void
  children: React.ReactNode
}) {
  return (
    <div className="step-shell">
      <div className="project-bar card">
        <div className="project-bar-top">
          <div>
            <div className="muted-label">Current project</div>
            <h2>{project.name}</h2>
            <p className="muted-copy">{project.initiative}</p>
          </div>

          <div className="pill-row">
            <span className="pill">{project.status}</span>
            <span className="pill">Last updated {project.updated}</span>
          </div>
        </div>

        <div className="workflow-nav">
          {steps.map((step, index) => {
            const active = view === step
            const enabled = steps.indexOf(project.stage) >= index || active

            return (
              <button
                key={step}
                onClick={() => enabled && onStepClick(step)}
                className={
                  active
                    ? 'step-btn step-btn-active'
                    : enabled
                      ? 'step-btn'
                      : 'step-btn step-btn-disabled'
                }
              >
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
    <section className="card section-card">
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
    <div className="list-block">
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
  const [view, setView] = useState<View>('landing')
  const [projects, setProjects] = useState<Project[]>(seedProjects)
  const [currentProjectId, setCurrentProjectId] = useState(seedProjects[0].id)
  const [copied, setCopied] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const currentProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId) ?? projects[0],
    [projects, currentProjectId],
  )

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

  useEffect(() => {
    void loadProjectsFromApi()
  }, [])

  async function loadProjectsFromApi() {
    try {
      setApiError(null)
      const data = await api.listProjects()

      if (data.length > 0) {
        const mappedProjects = data.map(mapApiProject)
        setProjects(mappedProjects)
        setCurrentProjectId(mappedProjects[0].id)
      }
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'Could not load projects from backend.',
      )
    }
  }

  function updateProjectStageLocally(stage: Step, status = 'In progress') {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === currentProjectId
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

      setProjects((prev) => [mapped, ...prev])
      setCurrentProjectId(mapped.id)
      setView('Inputs')
      flashCopy('Project created')
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to create project.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function openProject(project: Project) {
    setCurrentProjectId(project.id)
    setView(project.stage)
  }

  async function generateInsightsFromInput() {
    try {
      setIsLoading(true)
      setApiError(null)

      if (!inputText.trim()) {
        throw new Error('Input is empty. Add feedback before generating insights.')
      }

      await api.createInput(currentProjectId, {
        title: 'Raw feedback batch',
        inputType: 'raw_text',
        contentText: inputText,
      })

      const insight = await api.generateInsights(currentProjectId)
      setApiInsight(insight)

      updateProjectStageLocally('Insights', 'insights_generated')
      flashCopy('Insights generated')
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to generate insights.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function generateReportFromInsights() {
    try {
      setIsLoading(true)
      setApiError(null)

      const report = await api.generateReport(currentProjectId)
      setApiReport(report)

      updateProjectStageLocally('Report', 'report_generated')
      flashCopy('Report generated')
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to generate report.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function generatePrdFromReport() {
    try {
      setIsLoading(true)
      setApiError(null)

      const generatedPrd = await api.generatePrd(currentProjectId)
      setPrd(mapPrd(generatedPrd))

      updateProjectStageLocally('PRD', 'prd_generated')
      flashCopy('PRD generated')
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to generate PRD.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function savePrdAndGenerateTasks() {
    try {
      setIsLoading(true)
      setApiError(null)

      await api.updatePrd(currentProjectId, {
        problemStatement: prd.problem,
        goalsText: prd.goals,
        targetUsersText: prd.users,
        scopeText: prd.scope,
        nonGoalsText: prd.nonGoals,
        successMetricsText: prd.metrics,
        risksText: prd.risks,
        openQuestionsText: prd.questions,
      })

      const taskRun = await api.generateTasks(currentProjectId)
      setApiTasks(taskRun)

      updateProjectStageLocally('Tasks', 'tasks_generated')
      flashCopy('Tasks generated')
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to generate tasks.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function flashCopy(message: string) {
    setCopied(message)
    window.setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="app-bg">
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-orb orb-three" />

      <TopNav
        onGoLanding={() => setView('landing')}
        onGoProjects={() => setView('projects')}
      />

      <main className="container app-main">
        {apiError ? (
          <div className="card" style={{ marginBottom: 20, borderColor: '#fecdd3' }}>
            <strong style={{ color: '#be123c' }}>API message</strong>
            <p className="muted-copy" style={{ marginTop: 8 }}>
              {apiError}
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {view === 'landing' && (
              <div className="stack-xl">
                <section className="hero-grid">
                  <div className="stack-lg">
                    <span className="eyebrow">Product operations platform</span>

                    <div className="stack-md">
                      <h1 className="hero-title">
                        From feedback collection to PRDs and execution-ready tasks
                      </h1>
                      <p className="hero-subtitle">
                        SignalForge gives product teams one structured system to
                        collect product signals, generate insight, standardize
                        requirements, and prepare work for delivery.
                      </p>
                    </div>

                    <div className="button-row">
                      <button className="btn btn-dark" onClick={() => setView('projects')}>
                        Explore SignalForge <ArrowRight size={16} />
                      </button>

                      <button
                        className="btn btn-light"
                        onClick={() => {
                          setCurrentProjectId(projects[0].id)
                          setView('Insights')
                        }}
                      >
                        Review current module
                      </button>
                    </div>

                    <div className="mini-grid">
                      {[
                        ['Collection', 'Forms, surveys, imports'],
                        ['Standardization', 'Insights and PRDs'],
                        ['Execution', 'Tasks for delivery'],
                      ].map(([label, value]) => (
                        <article key={label} className="mini-card card">
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="card hero-panel">
                    <div className="panel-header">
                      <div>
                        <div className="muted-label">Current release focus</div>
                        <h2>SignalForge Insights</h2>
                        <p>
                          The first public module demonstrates how raw feedback
                          becomes structured insight that teams can carry into
                          documentation and delivery.
                        </p>
                      </div>

                      <span className="badge badge-indigo">Module 01</span>
                    </div>

                    <div className="stats-row">
                      {[
                        ['Themes', '4'],
                        ['Pain points', '3'],
                        ['Priority cues', '4'],
                      ].map(([label, value]) => (
                        <div key={label} className="stat-card">
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="proof-box">
                      <div className="proof-title">What the current module proves</div>

                      {[
                        'Cluster scattered feedback into readable themes',
                        'Separate pain points from requests and signals',
                        'Create a reliable starting point for PRDs and tasks',
                      ].map((item) => (
                        <div key={item} className="proof-item">
                          <span className="proof-icon">
                            <CheckCircle2 size={14} />
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid-4">
                  {[
                    [
                      FolderKanban,
                      'Collect',
                      'Capture feedback and product inputs from structured or unstructured sources.',
                    ],
                    [
                      Layers3,
                      'Insights',
                      'Turn raw signals into themes, pain points, requests, and priority cues.',
                    ],
                    [
                      FileText,
                      'PRD Studio',
                      'Convert validated insight into a structured product requirements draft.',
                    ],
                    [
                      ListChecks,
                      'Tasks',
                      'Generate execution-ready tasks, user stories, and acceptance criteria.',
                    ],
                  ].map(([Icon, title, text]) => (
                    <article
                      key={title as string}
                      className={
                        title === 'Insights'
                          ? 'card feature-card feature-card-active'
                          : 'card feature-card'
                      }
                    >
                      <div
                        className={
                          title === 'Insights'
                            ? 'feature-icon feature-icon-indigo'
                            : 'feature-icon'
                        }
                      >
                        {typeof Icon !== 'string' && <Icon size={20} />}
                      </div>
                      <h3>SignalForge {title as string}</h3>
                      <p>{text as string}</p>
                    </article>
                  ))}
                </section>
              </div>
            )}

            {view === 'projects' && (
              <div className="stack-lg">
                <section className="card header-card">
                  <div>
                    <div className="muted-label">Projects</div>
                    <h2>Manage active product workflows</h2>
                    <p className="muted-copy wide-copy">
                      Create a project, resume the latest stage, or continue an
                      existing workflow from feedback to PRD and execution-ready
                      tasks.
                    </p>
                  </div>

                  <div className="button-row">
                    <button className="btn btn-dark" onClick={() => setView('Project')}>
                      <Plus size={16} /> Create project
                    </button>

                    <button
                      className="btn btn-light"
                      onClick={() => openProject(projects[0])}
                    >
                      Resume latest project
                    </button>

                    <button className="btn btn-light" onClick={loadProjectsFromApi}>
                      Sync backend projects
                    </button>
                  </div>
                </section>

                <section className="grid-3">
                  {projects.map((project) => (
                    <article key={project.id} className="card project-card">
                      <div className="tag-row">
                        <span className="badge badge-neutral">{project.stage}</span>
                        <span className="badge badge-green">{project.status}</span>
                      </div>

                      <h3>{project.name}</h3>
                      <p>{project.initiative}</p>

                      <div className="small-copy">Last updated {project.updated}</div>

                      <div className="button-row">
                        <button
                          className="btn btn-dark"
                          onClick={() => openProject(project)}
                        >
                          Open project
                        </button>
                        <button
                          className="btn btn-light"
                          onClick={() => openProject(project)}
                        >
                          Continue
                        </button>
                      </div>
                    </article>
                  ))}
                </section>
              </div>
            )}

            {view === 'Project' && (
              <StepShell
                project={currentProject}
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

            {view === 'Inputs' && (
              <StepShell
                project={currentProject}
                view={view}
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
            )}

            {view === 'Insights' && (
              <StepShell
                project={currentProject}
                view={view}
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
            )}

            {view === 'Report' && (
              <StepShell
                project={currentProject}
                view={view}
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
            )}

            {view === 'PRD' && (
              <StepShell
                project={currentProject}
                view={view}
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
            )}

            {view === 'Tasks' && (
              <StepShell
                project={currentProject}
                view={view}
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
            )}

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

      {copied ? (
        <div className="toast">
          <ClipboardCheck size={16} />
          <span>{copied}</span>
        </div>
      ) : null}
    </div>
  )
}