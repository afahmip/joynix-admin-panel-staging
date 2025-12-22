import { Navigate } from 'react-router'
import { useResources } from '../hooks/use-resources'

interface RouteGuardProps {
  resourcePath?: string
  children: React.ReactNode
}

export function RouteGuard({ resourcePath, children }: RouteGuardProps) {
  const { canAccess, isLoading } = useResources()

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // If no resourcePath specified, allow access (e.g., dashboard)
  if (!resourcePath) {
    return <>{children}</>
  }

  // Check if user has access to this resource
  if (!canAccess(resourcePath)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
