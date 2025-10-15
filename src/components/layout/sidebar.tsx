import { Link, useNavigate } from '@tanstack/react-router'
import { GiftIcon, CheckCircleIcon, HomeIcon, ActivityIcon, FlagIcon, PhoneCallIcon, TagsIcon } from 'lucide-react'
import { useAuth } from '../../hooks/auth'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Gift Types', href: '/gift-types', icon: GiftIcon },
  { name: 'Categories', href: '/categories', icon: TagsIcon },
  { name: 'Activities', href: '/activities', icon: ActivityIcon },
  { name: 'Group Calls', href: '/group-calls', icon: PhoneCallIcon },
  { name: 'User Reports', href: '/user-reports', icon: FlagIcon },
  { name: 'Promote User to Talent', href: '/verify-talent', icon: CheckCircleIcon },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { signout } = useAuth()

  const handleSignOut = () => {
    signout()
    navigate({ to: '/signin' })
  }
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold text-gray-900">Joynix Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
            }
            activeProps={{ className: 'bg-gray-100 text-gray-900' }}
            inactiveProps={{ className: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' }}
          >
            <item.icon
              className="mr-3 h-6 w-6 flex-shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="px-2 py-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 cursor-pointer bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
