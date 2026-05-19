import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState([])
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get(`/boxes/company/${user.company_id}`),
      api.get(`/presets/company/${user.company_id}`)
    ]).then(([boxRes, presetRes]) => {
      setBoxes(boxRes.data)
      setPresets(presetRes.data)
    }).finally(() => setLoading(false))
  }, [user])

  return (
    <Layout>
      <div className="p-8">
        <h2 className="text-white text-2xl font-semibold mb-1">Dashboard</h2>
        <p className="text-gray-400 text-sm mb-8">Overview of your company catalog</p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Box Types', value: boxes.length },
            { label: 'Pallet Presets', value: presets.length },
            { label: 'Company ID', value: user?.company_id },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
              <p className="text-white text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Box Catalog</h3>
              <button
                onClick={() => navigate('/boxes')}
                className="text-blue-400 text-xs hover:underline"
              >
                Manage →
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : boxes.length === 0 ? (
              <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-500 text-sm">No boxes yet</p>
                <button
                  onClick={() => navigate('/boxes')}
                  className="text-blue-400 text-xs mt-2 hover:underline"
                >
                  Add your first box
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {boxes.slice(0, 5).map(box => (
                  <div key={box.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm font-medium">{box.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{box.length}×{box.width}×{box.height} in · {box.weight} lb</p>
                    </div>
                  </div>
                ))}
                {boxes.length > 5 && (
                  <p className="text-gray-500 text-xs text-center mt-1">+{boxes.length - 5} more</p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Pallet Presets</h3>
              <button
                onClick={() => navigate('/presets')}
                className="text-blue-400 text-xs hover:underline"
              >
                Manage →
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : presets.length === 0 ? (
              <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-500 text-sm">No presets yet</p>
                <button
                  onClick={() => navigate('/presets')}
                  className="text-blue-400 text-xs mt-2 hover:underline"
                >
                  Add your first preset
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {presets.map(preset => (
                  <div key={preset.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm font-medium">{preset.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{preset.length}×{preset.width}×{preset.height} in · max {preset.max_weight} lb</p>
                    </div>
                    <button
                      onClick={() => navigate('/optimizer', { state: { preset } })}
                      className="text-blue-400 text-xs hover:underline"
                    >
                      Use →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}