import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Boxes() {
  const { user } = useAuth()
  const [boxes, setBoxes] = useState([])
  const [form, setForm] = useState({ name: '', length: '', width: '', height: '', weight: '' })
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchBoxes = () => {
    api.get(`/boxes/company/${user.company_id}`).then(res => setBoxes(res.data))
  }

  useEffect(() => { if (user) fetchBoxes() }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/boxes/', {
        ...form,
        length: parseFloat(form.length),
        width: parseFloat(form.width),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        company_id: user.company_id
      })
      setForm({ name: '', length: '', width: '', height: '', weight: '' })
      setShowForm(false)
      fetchBoxes()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add box')
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/boxes/${id}`)
    fetchBoxes()
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-2xl font-semibold">Box Catalog</h2>
            <p className="text-gray-400 text-sm mt-1">Manage your company's box types</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + Add box
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 grid grid-cols-3 gap-4">
            {['name', 'length', 'width', 'height', 'weight'].map(field => (
              <div key={field}>
                <label className="text-gray-400 text-xs mb-1 block capitalize">{field}</label>
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
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">Save box</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition">Cancel</button>
            </div>
          </form>
        )}

        {boxes.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-500">No boxes in your catalog yet</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Name', 'Length', 'Width', 'Height', 'Weight', ''].map(h => (
                    <th key={h} className="text-left text-gray-400 text-xs uppercase tracking-wide px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boxes.map(box => (
                  <tr key={box.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white font-medium">{box.name}</td>
                    <td className="px-4 py-3 text-gray-300">{box.length} in</td>
                    <td className="px-4 py-3 text-gray-300">{box.width} in</td>
                    <td className="px-4 py-3 text-gray-300">{box.height} in</td>
                    <td className="px-4 py-3 text-gray-300">{box.weight} lb</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(box.id)} className="text-red-400 text-xs hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}