import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import type { AuthMode } from './AuthModal.types'

export type { AuthMode } from './AuthModal.types'

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
          transition={{ duration: 0.28 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
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
              disabled={isSubmitting}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <div className="auth-modal-brand">
              <span className="brand-mark brand-mark-sm">
                <Sparkles size={16} />
              </span>
              <span className="brand-kicker">SignalForge workspace</span>
            </div>

            <div className="auth-head">
              <h2 id="auth-modal-title">
                {authMode === 'sign-in'
                  ? 'Sign in to your workspace'
                  : 'Create your account'}
              </h2>
              <p className="muted-copy">
                {authMode === 'sign-in'
                  ? 'Continue where you left off — projects, outputs, and workflow stages stay in sync.'
                  : 'Start organizing feedback into insights, PRDs, and tasks your team can ship against.'}
              </p>
            </div>

            {authError ? (
              <div className="auth-message auth-message-error" role="alert">
                <strong>Could not authenticate</strong>
                <p>{authError}</p>
              </div>
            ) : null}

            {authNotice && !authError ? (
              <div className="auth-message auth-message-success" role="status">
                <p>{authNotice}</p>
              </div>
            ) : null}

            <div className="auth-form">
              <div className="field">
                <label htmlFor="auth-email">Work email</label>
                <input
                  id="auth-email"
                  className="input-premium"
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
                  className="input-premium"
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
