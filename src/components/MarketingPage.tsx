import { motion } from 'framer-motion'
import {
  ArrowRight,
  FileText,
  FolderKanban,
  Github,
  Layers3,
  ListChecks,
  LogOut,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const WORKFLOW_STEPS = [
  {
    step: '01',
    icon: FolderKanban,
    title: 'Collect feedback',
    text: 'Gather raw notes, survey responses, and support signals in one structured inbox.',
  },
  {
    step: '02',
    icon: Layers3,
    title: 'Generate insights',
    text: 'Surface themes, pain points, requests, and priority cues your team can act on.',
  },
  {
    step: '03',
    icon: FileText,
    title: 'Draft PRD',
    text: 'Convert validated insight into a clear requirements document ready for review.',
  },
  {
    step: '04',
    icon: ListChecks,
    title: 'Prepare tasks',
    text: 'Break the PRD into user stories, work buckets, and acceptance criteria.',
  },
] as const

type MarketingPageProps = {
  isSignedIn: boolean
  userEmail?: string
  onStartWorkspace: () => void
  onOpenWorkspace: () => void
  onSignIn: () => void
  onSignOut: () => void
  onScrollToWorkflow: () => void
}

export function MarketingPage({
  isSignedIn,
  userEmail,
  onStartWorkspace,
  onOpenWorkspace,
  onSignIn,
  onSignOut,
  onScrollToWorkflow,
}: MarketingPageProps) {
  const primaryCta = isSignedIn ? onOpenWorkspace : onStartWorkspace
  const primaryLabel = isSignedIn ? 'Open workspace' : 'Start workspace'

  return (
    <div className="marketing-page">
      <header className="marketing-nav glass-nav">
        <button
          type="button"
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="brand-kicker">Product operations platform</span>
            <span className="brand-name">SignalForge</span>
          </span>
        </button>

        <nav className="marketing-nav-links" aria-label="Primary">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <a href="#use-cases">Use cases</a>
          {isSignedIn ? (
            <>
              <span className="nav-user-chip">{userEmail}</span>
              <button type="button" className="btn btn-dark btn-sm" onClick={onOpenWorkspace}>
                Open workspace
              </button>
              <button type="button" className="btn-logout" onClick={onSignOut}>
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <button type="button" className="nav-text-btn" onClick={onSignIn}>
                Sign in
              </button>
              <button type="button" className="btn btn-dark btn-sm" onClick={onStartWorkspace}>
                Start workspace
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="marketing-main container-wide">
        <motion.section
          className="marketing-hero"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div className="marketing-hero-copy" variants={fadeUp} transition={{ duration: 0.55 }}>
            <span className="status-pill">
              <span className="status-pill-dot" />
              Open-source product operations platform
            </span>

            <h1 className="hero-title marketing-hero-title">
              Turn scattered feedback into{' '}
              <span className="text-gradient">execution-ready</span> product work
            </h1>

            <p className="hero-subtitle marketing-hero-subtitle">
              SignalForge turns scattered product feedback into structured insights,
              PRDs, and execution-ready tasks — so your team moves from signals to
              specs with clarity.
            </p>

            <div className="button-row hero-cta-row">
              <button type="button" className="btn btn-dark btn-lg" onClick={primaryCta}>
                {primaryLabel} <ArrowRight size={16} />
              </button>
              <button type="button" className="btn btn-glass btn-lg" onClick={onScrollToWorkflow}>
                See workflow
              </button>
            </div>

            <p className="hero-footnote muted-copy">
              Structured workflow · Authenticated workspaces · Production API
            </p>
          </motion.div>

          <motion.div
            className="hero-visual-stack"
            variants={fadeUp}
            transition={{ duration: 0.65, delay: 0.12 }}
          >
            <div className="hero-visual-glow" aria-hidden />
            <div className="hero-preview glass-card hero-preview-main">
              <div className="hero-preview-header">
                <span className="muted-label">Workspace preview</span>
                <span className="badge badge-indigo">Live flow</span>
              </div>

              <div className="hero-preview-pipeline">
                {[
                  { label: 'Feedback', icon: MessageSquare },
                  { label: 'Insight', icon: Layers3 },
                  { label: 'PRD', icon: FileText },
                  { label: 'Tasks', icon: ListChecks },
                ].map((item, index, arr) => (
                  <div key={item.label} className="hero-preview-pipeline-item">
                    <div className="hero-preview-pipeline-node">
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {index < arr.length - 1 ? (
                      <div className="hero-preview-pipeline-line" />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="hero-preview-layers">
                <div className="hero-preview-layer glass-inset hero-preview-layer-back">
                  <span className="layer-label">Feedback inbox</span>
                  <p>“Join flow feels heavy” · “Reminders arrive too late” · “Hard to find past sessions”</p>
                </div>
                <div className="hero-preview-layer glass-inset hero-preview-layer-mid">
                  <span className="layer-label">Insight summary</span>
                  <p>Friction clusters around join flow, reminder timing, and session discoverability.</p>
                </div>
                <div className="hero-preview-layer glass-inset hero-preview-layer-front">
                  <div className="hero-preview-split">
                    <div>
                      <span className="layer-label">PRD draft</span>
                      <p>Problem, goals, scope, and success metrics — ready for review.</p>
                    </div>
                    <div>
                      <span className="layer-label">Task list</span>
                      <ul className="hero-task-list">
                        <li>Simplify join flow</li>
                        <li>Improve reminder rules</li>
                        <li>Design session hub</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          className="trust-strip glass-card"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {[
            { icon: Workflow, label: 'Structured workflow' },
            { icon: Zap, label: 'Workspace hydration' },
            { icon: Shield, label: 'Authenticated projects' },
            { icon: Rocket, label: 'Production-ready API' },
          ].map((item) => (
            <div key={item.label} className="trust-strip-item">
              <span className="trust-strip-icon">
                <item.icon size={15} />
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.section>

        <section id="workflow" className="marketing-section">
          <div className="section-intro">
            <span className="eyebrow">How it works</span>
            <h2>One repeatable path from signals to delivery</h2>
            <p className="muted-copy section-lead">
              Every project follows the same product operations flow — so feedback
              never gets lost between research, requirements, and execution planning.
            </p>
          </div>

          <div className="workflow-track" aria-hidden>
            <div className="workflow-track-line" />
          </div>

          <motion.div
            className="grid-4 workflow-cards"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
          >
            {WORKFLOW_STEPS.map((card) => (
              <motion.article
                key={card.title}
                className="glass-card workflow-card"
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
              >
                <span className="workflow-step-num">{card.step}</span>
                <div className="workflow-card-icon">
                  <card.icon size={20} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section id="product" className="marketing-section">
          <div className="section-intro">
            <span className="eyebrow">Product preview</span>
            <h2>A workspace built for product clarity</h2>
            <p className="muted-copy section-lead">
              Stage-based navigation, hydrated outputs, and readable panels — designed
              for day-to-day product work.
            </p>
          </div>

          <motion.div
            className="product-preview-panel glass-card"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="preview-top">
              <div>
                <div className="muted-label">Current project</div>
                <h3>Match Experience Improvement</h3>
                <p className="muted-copy">Improve discovery, join flow, and reminder experience</p>
              </div>
              <div className="preview-pills">
                <span className="pill pill-active-stage">Insights</span>
                <span className="pill">In progress</span>
              </div>
            </div>

            <div className="preview-tabs" role="tablist" aria-label="Workflow stages">
              {['Project', 'Inputs', 'Insights', 'Report', 'PRD', 'Tasks'].map((tab) => (
                <span
                  key={tab}
                  className={tab === 'Insights' ? 'preview-tab preview-tab-active' : 'preview-tab'}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="preview-grid">
              <div className="preview-block glass-inset">
                <strong>Summary insight</strong>
                <p>
                  Users value the match experience, but friction appears across join
                  flow, reminder timing, and session discoverability.
                </p>
                <div className="preview-tags">
                  <span className="badge badge-neutral">Join flow</span>
                  <span className="badge badge-neutral">Reminders</span>
                </div>
              </div>
              <div className="preview-block glass-inset">
                <strong>Execution tasks</strong>
                <ul>
                  <li>Audit current join flow steps</li>
                  <li>Define improved reminder timing rules</li>
                  <li>Design session visibility model</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="use-cases" className="marketing-section">
          <div className="section-intro">
            <span className="eyebrow">Use cases</span>
            <h2>Where teams use SignalForge</h2>
          </div>

          <motion.div
            className="grid-2 use-case-grid"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              {
                icon: Target,
                title: 'Founders validating product ideas',
                text: 'Organize early feedback into themes and a draft PRD without spreadsheet sprawl.',
              },
              {
                icon: Users,
                title: 'Product managers organizing feedback',
                text: 'Keep research, requirements, and planning artifacts aligned in one workflow.',
              },
              {
                icon: MessageSquare,
                title: 'OSS maintainers shaping roadmap',
                text: 'Turn community issues and discussions into structured insight and actionable work.',
              },
              {
                icon: Rocket,
                title: 'Teams preparing specs and delivery plans',
                text: 'Move from raw input to PRD and task breakdown in a consistent, reviewable format.',
              },
            ].map((item) => (
              <motion.article
                key={item.title}
                className="glass-card use-case-card"
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
              >
                <div className="workflow-card-icon use-case-icon">
                  <item.icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="marketing-cta-wrap">
          <div className="marketing-cta-glow" aria-hidden />
          <motion.section
            className="marketing-cta glass-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="eyebrow glass-eyebrow">Ready when you are</span>
            <h2>Build product clarity from every signal.</h2>
            <p className="muted-copy">
              Create a project, run the full workflow, and return to hydrated outputs
              whenever you reopen your workspace.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-dark btn-lg" onClick={primaryCta}>
                {primaryLabel}
              </button>
              {!isSignedIn ? (
                <button type="button" className="btn btn-glass btn-lg" onClick={onSignIn}>
                  Sign in
                </button>
              ) : null}
            </div>
          </motion.section>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="container-wide marketing-footer-inner">
          <div className="marketing-footer-brand">
            <span className="brand-mark brand-mark-sm">
              <Sparkles size={14} />
            </span>
            <div>
              <strong>SignalForge</strong>
              <p>Open-source product operations platform</p>
            </div>
          </div>

          <div className="marketing-footer-columns">
            <div className="marketing-footer-col">
              <span className="footer-col-title">Product</span>
              <a href="#workflow">Workflow</a>
              <a href="#use-cases">Use cases</a>
              <a href="https://signalforge-frontend.vercel.app" target="_blank" rel="noreferrer">
                Live app
              </a>
            </div>
            <div className="marketing-footer-col">
              <span className="footer-col-title">Developers</span>
              <a
                href="https://github.com/yasinjir/signalforge-frontend"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={14} /> GitHub Frontend
              </a>
              <a
                href="https://github.com/yasinjir/signalforge-api"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={14} /> GitHub API
              </a>
              <a
                href="https://signalforge-api.vercel.app/api/health"
                target="_blank"
                rel="noreferrer"
              >
                API health
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
