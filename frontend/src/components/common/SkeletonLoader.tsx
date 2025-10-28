interface SkeletonLoaderProps {
  variant?: 'text' | 'title' | 'circle' | 'rectangle' | 'card'
  width?: string
  height?: string
  className?: string
  count?: number
}

const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}: SkeletonLoaderProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full'
      case 'title':
        return 'h-8 w-3/4'
      case 'circle':
        return 'rounded-full'
      case 'rectangle':
        return 'w-full h-32'
      case 'card':
        return 'w-full h-48 rounded-lg'
      default:
        return ''
    }
  }

  const baseClasses = 'skeleton bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer'
  const variantClasses = getVariantClasses()
  const sizeClasses = `${width ? `w-[${width}]` : ''} ${height ? `h-[${height}]` : ''}`

  const items = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className} ${
        count > 1 && index < count - 1 ? 'mb-3' : ''
      }`}
    />
  ))

  return <>{items}</>
}

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-fadeIn">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <SkeletonLoader variant="text" width="60%" className="mb-2" />
        <SkeletonLoader variant="title" className="mb-2" />
        <SkeletonLoader variant="text" width="40%" />
      </div>
      <SkeletonLoader variant="circle" width="48px" height="48px" />
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden animate-fadeIn">
    <div className="p-6">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
          <SkeletonLoader variant="circle" width="40px" height="40px" />
          <div className="flex-1">
            <SkeletonLoader variant="text" width="80%" className="mb-2" />
            <SkeletonLoader variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonList = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-3 animate-fadeIn">
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="bg-white rounded-lg shadow p-4">
        <SkeletonLoader variant="text" width="70%" className="mb-2" />
        <SkeletonLoader variant="text" width="50%" />
      </div>
    ))}
  </div>
)

export default SkeletonLoader
