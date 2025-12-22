import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { 
  GiftIcon,
  HomeIcon,
  ActivityIcon,
  PhoneCallIcon,
  TagsIcon,
  PaletteIcon,
  AwardIcon,
  StickerIcon,
  CoinsIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  GamepadIcon,
  FlagIcon,
  CheckCircleIcon,
  UserCheckIcon,
  UserIcon,
} from 'lucide-react'
import { useAuth } from '../../hooks/auth'
import { useResources } from '../../hooks/use-resources'

type NavigationItem = {
  name: string
  href?: string
  icon: typeof HomeIcon
  resourcePath?: string
  children?: Array<{ name: string; href: string; icon?: typeof HomeIcon; resourcePath?: string }>
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Categories', href: '/categories', icon: TagsIcon, resourcePath: 'categories' },
  { name: 'Activities', href: '/activities', icon: ActivityIcon, resourcePath: 'activities' },
  { name: 'Group Calls', href: '/group-calls', icon: PhoneCallIcon, resourcePath: 'group_calls' },
  {
    name: 'Gamification',
    icon: GamepadIcon,
    resourcePath: 'gamifications',
    children: [
      { name: 'Gift Types', href: '/gift-types', icon: GiftIcon },
      { name: 'Avatar Borders', href: '/avatar-borders', icon: PaletteIcon },
      { name: 'Badges', href: '/badges', icon: AwardIcon },
      { name: 'Sticker Packs', href: '/sticker-packs', icon: StickerIcon },
    ],
  },
  {
    name: 'Payments',
    icon: CoinsIcon,
    resourcePath: 'payments',
    children: [
      { name: 'Coin Transactions', href: '/coin-transactions', icon: CoinsIcon },
    ],
  },
  {
    name: 'Users & Talents',
    icon: UserIcon,
    children: [
      { name: 'Users', href: '/users', icon: UserIcon },
      { name: 'User Reports', href: '/user-reports', icon: FlagIcon, resourcePath: 'users.user_reports' },
      { name: 'Talent Applications', href: '/talent-applications', icon: UserCheckIcon, resourcePath: 'users.talent_applications' },
    ],
  },
]

export function Sidebar() {
  const { signout } = useAuth()
  const { canAccess, isLoading } = useResources()
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

  const handleToggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleSignOut = () => {
    signout()
    window.location.href = '/signin'
  }

  const filterNavigation = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter((item) => {
        // Dashboard is always visible
        if (item.href === '/') return true
        
        // If item has no resourcePath, it's always visible
        if (!item.resourcePath) {
          // But if it has children, check if any child is accessible
          if (item.children) {
            const filteredChildren = item.children.filter((child) => {
              if (!child.resourcePath) return true
              return canAccess(child.resourcePath)
            })
            return filteredChildren.length > 0
          }
          return true
        }
        
        // Check if user has access to this resource
        return canAccess(item.resourcePath)
      })
      .map((item) => {
        // Filter children if they exist
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => {
              if (!child.resourcePath) return true
              return canAccess(child.resourcePath)
            }),
          }
        }
        return item
      })
  }

  const filteredNavigation = isLoading ? [] : filterNavigation(navigation)
  
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold text-gray-900">Joynix Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : (
          filteredNavigation.map((item) => {
          const isActive = item.href && location.pathname === item.href
          const hasActiveChild = item.children?.some((child) => location.pathname === child.href)
          const isDropdownOpen = item.children ? (openDropdowns[item.name] ?? !!hasActiveChild) : false

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => handleToggleDropdown(item.name)}
                  className={`cursor-pointer group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isDropdownOpen ? (
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="mt-1 space-y-1 pl-9">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.href

                      return (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                            isChildActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {child.icon && (
                            <child.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          )}
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              to={item.href || '#'}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className="mr-3 h-6 w-6 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })
        )}
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
