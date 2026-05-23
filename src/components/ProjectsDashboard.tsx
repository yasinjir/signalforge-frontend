import { motion } from 'framer-motion'
import {
  Archive,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'

export type ProjectFilters = {
  search: string
  stage: string
  status: string
  includeArchived: boolean
}

export type DashboardProject = {
  id: string
  name: string
  initiative: string
  stage: string
  updated: string
  status: string
}

const STAGE_OPTIONS = ['All', 'Project', 'Inputs', 'Insights', 'Report', 'PRD', 'Tasks']

const STATUS_OPTIONS = [
  'All',
  'draft',
  'input_added',
  'insights_generated',
  'report_generated',
  'prd_generated',
  'tasks_generated',
  'archived',
]

function formatStatusLabel(status: string) {
  if (status === 'archived') return 'Archived'
  return status.replace(/_/g, ' ')
}

export function ProjectsDashboard({
  projects,
  filters,
  hasActiveFilters,
  isLoading,
  openingProjectId,
  editingProjectId,
  archivingProjectId,
  deletingProjectId,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onCreateProject,
  onOpenProject,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onSync,
}: {
  projects: DashboardProject[]
  filters: ProjectFilters
  hasActiveFilters: boolean
  isLoading: boolean
  openingProjectId: string | null
  editingProjectId: string | null
  archivingProjectId: string | null
  deletingProjectId: string | null
  onFiltersChange: (filters: ProjectFilters) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  onCreateProject: () => void
  onOpenProject: (project: DashboardProject) => void
  onEditProject: (project: DashboardProject) => void
  onArchiveProject: (project: DashboardProject) => void
  onDeleteProject: (project: DashboardProject) => void
  onSync: () => void
}) {
  const isProjectBusy = (projectId: string) =>
    openingProjectId === projectId ||
    editingProjectId === projectId ||
    archivingProjectId === projectId ||
    deletingProjectId === projectId

  return (
    <div className="stack-lg projects-dashboard">
      <section className="glass-card header-card dashboard-header">
        <div>
          <div className="muted-label">Your workspace</div>
          <h2>Projects</h2>
          <p className="muted-copy wide-copy">
            Search, filter, and manage product workflows from feedback to
            execution-ready tasks.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="btn btn-dark"
            onClick={onCreateProject}
            disabled={isLoading}
          >
            <Plus size={16} /> Create project
          </button>

          {projects.length > 0 ? (
            <button
              type="button"
              className="btn btn-light"
              onClick={() => void onOpenProject(projects[0])}
              disabled={isLoading}
            >
              {openingProjectId === projects[0].id
                ? 'Opening...'
                : 'Resume latest project'}
            </button>
          ) : null}

          <button
            type="button"
            className="btn btn-light"
            onClick={onSync}
            disabled={isLoading}
          >
            <RefreshCw size={15} />
            {isLoading && !openingProjectId ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </section>

      <section className="glass-card project-filters-panel">
        <div className="project-filters-row">
          <label className="search-pill-wrap">
            <Search size={16} className="search-pill-icon" />
            <input
              type="search"
              className="search-pill-input"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(event) =>
                onFiltersChange({ ...filters, search: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') onApplyFilters()
              }}
            />
          </label>

          <div className="filter-select-wrap">
            <label className="filter-select-label" htmlFor="filter-stage">
              Stage
            </label>
            <select
              id="filter-stage"
              className="filter-select"
              value={filters.stage}
              onChange={(event) =>
                onFiltersChange({ ...filters, stage: event.target.value })
              }
            >
              {STAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <label className="filter-select-label" htmlFor="filter-status">
              Status
            </label>
            <select
              id="filter-status"
              className="filter-select"
              value={filters.status}
              onChange={(event) =>
                onFiltersChange({ ...filters, status: event.target.value })
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All' : formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.includeArchived}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  includeArchived: event.target.checked,
                })
              }
            />
            <span>Show archived</span>
          </label>
        </div>

        <div className="project-filters-actions">
          <button
            type="button"
            className="btn btn-dark btn-sm"
            onClick={onApplyFilters}
            disabled={isLoading}
          >
            Apply filters
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={onClearFilters}
              disabled={isLoading}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {isLoading && projects.length === 0 ? (
        <section className="glass-card section-card loading-state-card">
          <div className="loading-bar loading-bar-inline" aria-hidden>
            <span className="loading-bar-fill loading-bar-fill-static" />
          </div>
          <p className="muted-copy">Loading your projects...</p>
        </section>
      ) : null}

      {projects.length === 0 && !isLoading ? (
        <section className="glass-card section-card empty-state-card empty-state-premium">
          <div className="empty-state-icon">
            <Sparkles size={22} />
          </div>
          <div className="section-head">
            <h3>
              {hasActiveFilters ? 'No projects match your filters' : 'No projects yet'}
            </h3>
            <p>
              {hasActiveFilters
                ? 'Try adjusting search, stage, status, or include archived projects.'
                : 'Create your first workspace to turn feedback into structured insights, a report, PRD, and delivery-ready tasks.'}
            </p>
          </div>

          <div className="button-row stack-top-lg">
            {hasActiveFilters ? (
              <button type="button" className="btn btn-dark" onClick={onClearFilters}>
                Clear filters
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-dark" onClick={onCreateProject}>
                  <Plus size={16} /> Create project
                </button>
                <button type="button" className="btn btn-light" onClick={onSync}>
                  Sync projects
                </button>
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="grid-3 project-grid">
          {projects.map((project) => {
            const busy = isProjectBusy(project.id)
            const isArchived = project.status === 'archived'

            return (
              <motion.article
                key={project.id}
                className={`glass-card project-card project-card-premium${isArchived ? ' project-card-archived' : ''}`}
                whileHover={busy ? undefined : { y: -6, transition: { duration: 0.28, ease: 'easeOut' } }}
              >
                <div className="tag-row">
                  <span className="badge badge-indigo">{project.stage}</span>
                  <span
                    className={
                      isArchived ? 'badge badge-amber' : 'badge badge-green'
                    }
                  >
                    {formatStatusLabel(project.status)}
                  </span>
                </div>

                <h3>{project.name}</h3>
                <p>{project.initiative}</p>
                <div className="small-copy">Last updated {project.updated}</div>

                <div className="button-row project-card-primary-actions">
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => void onOpenProject(project)}
                    disabled={isLoading || busy}
                  >
                    {openingProjectId === project.id ? 'Opening...' : 'Open project'}
                  </button>
                </div>

                <div className="project-card-actions">
                  <button
                    type="button"
                    className="btn btn-light btn-sm project-action-btn"
                    onClick={() => onEditProject(project)}
                    disabled={isLoading || busy}
                  >
                    <Pencil size={14} />
                    {editingProjectId === project.id ? 'Saving...' : 'Edit'}
                  </button>
                  {!isArchived ? (
                    <button
                      type="button"
                      className="btn btn-light btn-sm project-action-btn"
                      onClick={() => void onArchiveProject(project)}
                      disabled={isLoading || busy}
                    >
                      <Archive size={14} />
                      {archivingProjectId === project.id ? 'Archiving...' : 'Archive'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-light btn-sm project-action-btn project-action-danger"
                    onClick={() => void onDeleteProject(project)}
                    disabled={isLoading || busy}
                  >
                    <Trash2 size={14} />
                    {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.article>
            )
          })}
        </section>
      )}
    </div>
  )
}
