import { Link } from '@tanstack/react-router'
import { GiftIcon, CheckCircleIcon, HomeIcon, ActivityIcon } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Gift Types', href: '/gift-types', icon: GiftIcon },
  { name: 'Activities', href: '/activities', icon: ActivityIcon },
  { name: 'Verify Talent Request', href: '/verify-talent', icon: CheckCircleIcon },
]

export function Sidebar() {
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
    </div>
  )
}
