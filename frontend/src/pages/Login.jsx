import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-white text-2xl font-semibold mb-1">SmartStacker</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Username</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Password</label>
            <input
              type="password"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition"
          >
            Sign in
          </button>
        </form>
        <p className="text-gray-500 text-xs mt-4 text-center">
          No account? <a href="/register" className="text-blue-400 hover:underline">Register</a>
        </p>
      </div>
    </div>
  )
}