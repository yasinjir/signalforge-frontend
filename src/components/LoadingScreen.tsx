import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="app-bg auth-loading-screen">
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-orb orb-three" />
      <motion.div
        className="auth-loading-card glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <span className="brand-mark auth-loading-mark shimmer-mark">
          <Sparkles size={18} />
        </span>
        <p className="loading-title">Preparing your workspace...</p>
        <p className="muted-copy">SignalForge</p>
      </motion.div>
    </div>
  )
}
