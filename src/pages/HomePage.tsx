import { useAppSelector, useAppDispatch } from '../store/hook'
import { logout } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-black text-primary mb-4">🍔 QuickBite</h1>
        
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-400 mb-1">
            <span className="text-gray-500">Email:</span> {user?.email}
          </p>
          {user?.phone && (
            <p className="text-gray-400 mb-1">
              <span className="text-gray-500">Phone:</span> {user.phone}
            </p>
          )}
          <p className="text-gray-400">
            <span className="text-gray-500">Role:</span>{' '}
            <span className="text-primary font-medium capitalize">
              {user?.role.replace('_', ' ')}
            </span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-[#222] hover:bg-[#333] text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Logout
        </button>

        <p className="text-gray-500 text-sm mt-8">
          ✅ Phase 2 Complete — Auth system working!
        </p>
      </div>
    </div>
  )
}
