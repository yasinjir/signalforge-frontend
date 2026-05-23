import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export type EditProjectForm = {
  name: string
  initiative: string
  context: string
  goal: string
}

export function EditProjectModal({
  open,
  form,
  isSaving,
  onClose,
  onChange,
  onSave,
}: {
  open: boolean
  form: EditProjectForm
  isSaving: boolean
  onClose: () => void
  onChange: (form: EditProjectForm) => void
  onSave: () => void
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal-panel edit-project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-project-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="auth-modal-glow" aria-hidden />

            <button
              type="button"
              className="auth-modal-close"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <div className="auth-head">
              <h2 id="edit-project-title">Edit project</h2>
              <p className="muted-copy">
                Update project metadata. Workspace outputs are unchanged until you
                regenerate them.
              </p>
            </div>

            <div className="auth-form">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="edit-project-name">Project name</label>
                  <input
                    id="edit-project-name"
                    className="input-premium"
                    value={form.name}
                    onChange={(event) =>
                      onChange({ ...form, name: event.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="edit-project-initiative">Feature or initiative</label>
                  <input
                    id="edit-project-initiative"
                    className="input-premium"
                    value={form.initiative}
                    onChange={(event) =>
                      onChange({ ...form, initiative: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="field stack-top">
                <label htmlFor="edit-project-context">Background context</label>
                <textarea
                  id="edit-project-context"
                  className="input-premium"
                  value={form.context}
                  onChange={(event) =>
                    onChange({ ...form, context: event.target.value })
                  }
                />
              </div>

              <div className="field stack-top">
                <label htmlFor="edit-project-goal">Analysis goal</label>
                <textarea
                  id="edit-project-goal"
                  className="input-premium"
                  value={form.goal}
                  onChange={(event) =>
                    onChange({ ...form, goal: event.target.value })
                  }
                />
              </div>

              <div className="button-row stack-top-lg">
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={onSave}
                  disabled={isSaving || !form.name.trim()}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-glass"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
