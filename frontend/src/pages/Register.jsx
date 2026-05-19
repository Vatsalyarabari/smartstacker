import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', company_id: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register', {
        ...form,
        company_id: parseInt(form.company_id)
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-white text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-gray-400 text-sm mb-6">Join your company on SmartStacker</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {['username', 'email', 'password', 'company_id'].map(field => (
            <div key={field}>
              <label className="text-gray-400 text-xs mb-1 block capitalize">
                {field === 'company_id' ? 'Company ID' : field}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition"
          >
            Register
          </button>
        </form>
        <p className="text-gray-500 text-xs mt-4 text-center">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}