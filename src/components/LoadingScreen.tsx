import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="app-bg auth-loading-screen">
      <div className="ambient-gradient" aria-hidden />
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-orb orb-three" />

      <motion.div
        className="auth-loading-card glass-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <span className="brand-mark auth-loading-mark shimmer-mark">
          <Sparkles size={18} />
        </span>
        <div className="loading-bar" aria-hidden>
          <motion.span
            className="loading-bar-fill"
            initial={{ width: '12%' }}
            animate={{ width: ['12%', '72%', '40%', '88%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="loading-title">Preparing your workspace...</p>
        <p className="muted-copy loading-subtitle">Restoring session</p>
      </motion.div>
    </div>
  )
}
