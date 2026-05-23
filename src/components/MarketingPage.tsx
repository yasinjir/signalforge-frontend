import { motion } from 'framer-motion'
import {
  ArrowRight,
  FileText,
  FolderKanban,
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
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

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
  return (
    <div className="marketing-page">
      <header className="marketing-nav glass-nav">
        <button type="button" className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="brand-kicker">Product operations platform</span>
            <span className="brand-name">SignalForge</span>
          </span>
        </button>

        <nav className="marketing-nav-links">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <a href="#use-cases">Use cases</a>
          {isSignedIn ? (
            <>
              <span className="auth-user-email">{userEmail}</span>
              <button type="button" className="btn btn-light btn-sm" onClick={onOpenWorkspace}>
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
            <span className="eyebrow glass-eyebrow">Open-source product operations</span>
            <h1 className="hero-title marketing-hero-title">
              From scattered feedback to execution-ready product work
            </h1>
            <p className="hero-subtitle">
              SignalForge helps teams turn raw product signals into structured insights,
              reports, PRDs, and delivery-ready tasks.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-dark" onClick={isSignedIn ? onOpenWorkspace : onStartWorkspace}>
                {isSignedIn ? 'Open workspace' : 'Start workspace'} <ArrowRight size={16} />
              </button>
              <button type="button" className="btn btn-glass" onClick={onScrollToWorkflow}>
                See workflow
              </button>
            </div>
          </motion.div>

          <motion.div
            className="hero-flow-card glass-card"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="hero-flow-label">Product pipeline preview</div>
            <div className="hero-flow-steps">
              {[
                { label: 'Feedback', icon: MessageSquare },
                { label: 'Insight', icon: Layers3 },
                { label: 'PRD', icon: FileText },
                { label: 'Tasks', icon: ListChecks },
              ].map((step, index, arr) => (
                <div key={step.label} className="hero-flow-step-wrap">
                  <div className="hero-flow-step">
                    <step.icon size={18} />
                    <span>{step.label}</span>
                  </div>
                  {index < arr.length - 1 ? <div className="hero-flow-connector" /> : null}
                </div>
              ))}
            </div>
            <p className="muted-copy hero-flow-caption">
              One structured workspace from raw signals to delivery planning.
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          className="trust-strip glass-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
        >
          {[
            { icon: Workflow, label: 'Structured workflow' },
            { icon: Zap, label: 'Workspace hydration' },
            { icon: Shield, label: 'Authenticated projects' },
            { icon: Rocket, label: 'Production-ready API' },
          ].map((item) => (
            <div key={item.label} className="trust-strip-item">
              <item.icon size={16} />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.section>

        <section id="workflow" className="marketing-section">
          <div className="section-intro">
            <span className="eyebrow">How it works</span>
            <h2>One workflow from signals to execution</h2>
            <p className="muted-copy section-lead">
              SignalForge standardizes how product teams collect feedback, synthesize
              insight, and prepare specs for delivery.
            </p>
          </div>

          <motion.div
            className="grid-4 workflow-cards"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                icon: FolderKanban,
                title: 'Collect feedback',
                text: 'Paste raw feedback, notes, and product inputs into a structured workspace.',
              },
              {
                icon: Layers3,
                title: 'Generate insights',
                text: 'Cluster themes, pain points, requests, and priority cues automatically.',
              },
              {
                icon: FileText,
                title: 'Draft PRD',
                text: 'Turn validated insight into a standardized product requirements document.',
              },
              {
                icon: ListChecks,
                title: 'Prepare tasks',
                text: 'Generate user stories, work buckets, and acceptance criteria for delivery.',
              },
            ].map((card) => (
              <motion.article key={card.title} className="glass-card workflow-card" variants={fadeUp}>
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
            <h2>Inside the SignalForge workspace</h2>
          </div>

          <motion.div
            className="product-preview-panel glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="preview-top">
              <div>
                <div className="muted-label">Current project</div>
                <h3>Match Experience Improvement</h3>
                <p className="muted-copy">Improve discovery, join flow, and reminder experience</p>
              </div>
              <div className="preview-pills">
                <span className="pill">Insights</span>
                <span className="pill">In progress</span>
              </div>
            </div>

            <div className="preview-tabs">
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
                  Users value the match experience, but friction appears across join flow,
                  reminder timing, and session discoverability.
                </p>
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
            <h2>Built for modern product teams</h2>
          </div>

          <div className="grid-2 use-case-grid">
            {[
              {
                icon: Target,
                title: 'Founders validating product ideas',
                text: 'Turn early feedback into structured themes and a draft PRD without spreadsheet chaos.',
              },
              {
                icon: Users,
                title: 'Product managers organizing feedback',
                text: 'Standardize how scattered signals become reports, requirements, and planning artifacts.',
              },
              {
                icon: MessageSquare,
                title: 'OSS maintainers turning issues into roadmap',
                text: 'Cluster community signals into actionable insight and execution-ready work.',
              },
              {
                icon: Rocket,
                title: 'Teams preparing specs and execution plans',
                text: 'Move from raw input to PRD and task breakdown in one repeatable workflow.',
              },
            ].map((item) => (
              <article key={item.title} className="glass-card use-case-card">
                <div className="workflow-card-icon">
                  <item.icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-cta glass-card">
          <h2>Build product clarity from every signal.</h2>
          <p className="muted-copy">
            Open your workspace to create projects, hydrate saved outputs, and run the
            full SignalForge flow.
          </p>
          <div className="button-row">
            <button type="button" className="btn btn-dark" onClick={isSignedIn ? onOpenWorkspace : onStartWorkspace}>
              {isSignedIn ? 'Open workspace' : 'Start workspace'}
            </button>
            {!isSignedIn ? (
              <button type="button" className="btn btn-glass" onClick={onSignIn}>
                Sign in
              </button>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="container-wide marketing-footer-inner">
          <p>SignalForge — Open-source product operations platform</p>
          <div className="marketing-footer-links">
            <a href="https://signalforge-api.vercel.app/api/health" target="_blank" rel="noreferrer">
              Production API health
            </a>
            <a href="https://signalforge-frontend.vercel.app" target="_blank" rel="noreferrer">
              Live frontend
            </a>
            <a href="https://signalforge-api.vercel.app" target="_blank" rel="noreferrer">
              API
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
