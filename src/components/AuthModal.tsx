import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export type AuthMode = 'sign-in' | 'sign-up'

export function AuthModal({
  open,
  authMode,
  authEmail,
  authPassword,
  authError,
  authNotice,
  isSubmitting,
  onClose,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onToggleMode,
}: {
  open: boolean
  authMode: AuthMode
  authEmail: string
  authPassword: string
  authError: string | null
  authNotice: string | null
  isSubmitting: boolean
  onClose: () => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSignIn: () => void
  onSignUp: () => void
  onToggleMode: () => void
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
            className="auth-modal-panel glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="auth-modal-close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="auth-head">
              <h2 id="auth-modal-title">
                {authMode === 'sign-in'
                  ? 'Sign in to your workspace'
                  : 'Create your SignalForge account'}
              </h2>
              <p className="muted-copy">
                {authMode === 'sign-in'
                  ? 'Access your projects and continue structured product workflows.'
                  : 'Start turning feedback into insights, PRDs, and delivery-ready tasks.'}
              </p>
            </div>

            {authError ? (
              <div className="auth-error-box glass-alert-inline">
                <strong>Authentication error</strong>
                <p>{authError}</p>
              </div>
            ) : null}

            {authNotice && !authError ? (
              <div className="auth-notice-box">
                <p>{authNotice}</p>
              </div>
            ) : null}

            <div className="auth-form">
              <div className="field">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={authEmail}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="you@company.com"
                />
              </div>

              <div className="field stack-top">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    authMode === 'sign-in' ? 'current-password' : 'new-password'
                  }
                  value={authPassword}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div className="button-row stack-top-lg">
                {authMode === 'sign-in' ? (
                  <button
                    type="button"
                    className="btn btn-dark btn-full"
                    onClick={onSignIn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-dark btn-full"
                    onClick={onSignUp}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </button>
                )}
              </div>

              <div className="auth-toggle">
                {authMode === 'sign-in' ? (
                  <p>
                    New to SignalForge?{' '}
                    <button type="button" onClick={onToggleMode}>
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button type="button" onClick={onToggleMode}>
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
