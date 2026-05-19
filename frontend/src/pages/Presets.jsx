import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Presets() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [presets, setPresets] = useState([])
  const [form, setForm] = useState({ name: '', length: '', width: '', height: '', max_weight: '' })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const fetchPresets = () => {
    api.get(`/presets/company/${user.company_id}`).then(res => setPresets(res.data))
  }

  useEffect(() => { if (user) fetchPresets() }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/presets/', {
        ...form,
        length: parseFloat(form.length),
        width: parseFloat(form.width),
        height: parseFloat(form.height),
        max_weight: parseFloat(form.max_weight),
        company_id: user.company_id
      })
      setForm({ name: '', length: '', width: '', height: '', max_weight: '' })
      setShowForm(false)
      fetchPresets()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add preset')
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/presets/${id}`)
    fetchPresets()
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-2xl font-semibold">Pallet Presets</h2>
            <p className="text-gray-400 text-sm mt-1">Save common pallet configurations</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + Add preset
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 grid grid-cols-3 gap-4">
            {['name', 'length', 'width', 'height', 'max_weight'].map(field => (
              <div key={field}>
                <label className="text-gray-400 text-xs mb-1 block capitalize">{field.replace('_', ' ')}</label>
                <input
                  type={field === 'name' ? 'text' : 'number'}
                  step="0.1"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  required
                />
              </div>
            ))}
            {error && <p className="text-red-400 text-xs col-span-3">{error}</p>}
            <div className="col-span-3 flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">Save preset</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition">Cancel</button>
            </div>
          </form>
        )}

        {presets.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-500">No presets saved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {presets.map(preset => (
              <div key={preset.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-medium">{preset.name}</h3>
                  <button onClick={() => handleDelete(preset.id)} className="text-red-400 text-xs hover:underline">Delete</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ['Length', `${preset.length} in`],
                    ['Width', `${preset.width} in`],
                    ['Height', `${preset.height} in`],
                    ['Max weight', `${preset.max_weight} lb`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="text-white text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/optimizer', { state: { preset } })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition"
                >
                  Use in optimizer →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}