import { Sidebar } from './sidebar'
import { useAuth } from '../../hooks/auth'
import { Navigate } from 'react-router'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/signin" />
  }
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white p-8">
        {children}
      </main>
    </div>
  )
}
