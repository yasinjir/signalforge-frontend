import { AlertCircle } from 'lucide-react'

export function GlassAlert({
  message,
  onRetry,
  onDismiss,
}: {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}) {
  return (
    <div className="glass-alert" role="alert">
      <div className="glass-alert-icon">
        <AlertCircle size={18} />
      </div>
      <div className="glass-alert-body">
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>
      <div className="glass-alert-actions">
        {onRetry ? (
          <button type="button" className="btn btn-light btn-sm" onClick={onRetry}>
            Retry
          </button>
        ) : null}
        {onDismiss ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  )
}
