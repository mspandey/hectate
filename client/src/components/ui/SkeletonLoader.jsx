/**
 * Skeleton shimmer loader for async content.
 * Uses animated gradient background.
 */
export function SkeletonCard({ height = 200 }) {
  return (
    <div className="skeleton-card" style={{ height }}>
      <div className="skeleton-shimmer" />
    </div>
  )
}

export function SkeletonLine({ width = '100%', height = 14 }) {
  return (
    <div className="skeleton-line" style={{ width, height }}>
      <div className="skeleton-shimmer" />
    </div>
  )
}

export function SkeletonAvatar({ size = 48 }) {
  return (
    <div className="skeleton-avatar" style={{ width: size, height: size }}>
      <div className="skeleton-shimmer" />
    </div>
  )
}
