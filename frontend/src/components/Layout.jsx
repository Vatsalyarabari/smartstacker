import { useAuth } from '../context/AuthContext'
import { useNavigate, NavLink } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-white font-semibold text-lg">SmartStacker</h1>
          <p className="text-gray-500 text-xs mt-1">Company #{user?.company_id}</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/optimizer', label: 'Optimizer' },
            { to: '/boxes', label: 'Box Catalog' },
            { to: '/presets', label: 'Pallet Presets' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <p className="text-gray-400 text-xs px-3 mb-2">{user?.username}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}