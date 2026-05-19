import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'
import * as THREE from 'three'

const COLORS = [
  '#4A90D9', '#E8A838', '#4CAF7D', '#E05C5C',
  '#9B6DD6', '#E07B39', '#4ABFBF', '#D65C8A'
]

export default function Optimizer() {
  const { user } = useAuth()
  const location = useLocation()
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const animRef = useRef(null)

  const [catalogBoxes, setCatalogBoxes] = useState([])
  const [presets, setPresets] = useState([])
  const [selectedBoxes, setSelectedBoxes] = useState([])
  const [pallet, setPallet] = useState({ length: '', width: '', height: '', max_weight: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('catalog')

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get(`/boxes/company/${user.company_id}`),
      api.get(`/presets/company/${user.company_id}`)
    ]).then(([boxRes, presetRes]) => {
      setCatalogBoxes(boxRes.data)
      setPresets(presetRes.data)
    })
  }, [user])

  useEffect(() => {
    if (location.state?.preset) {
      const p = location.state.preset
      setPallet({ length: p.length, width: p.width, height: p.height, max_weight: p.max_weight })
    }
  }, [location.state])

  const addBox = (box) => {
    const existing = selectedBoxes.find(b => b.id === box.id)
    if (existing) {
      setSelectedBoxes(selectedBoxes.map(b => b.id === box.id ? { ...b, quantity: b.quantity + 1 } : b))
    } else {
      setSelectedBoxes([...selectedBoxes, { ...box, quantity: 1, color: COLORS[selectedBoxes.length % COLORS.length] }])
    }
  }

  const updateQty = (id, delta) => {
    setSelectedBoxes(prev =>
      prev.map(b => b.id === id ? { ...b, quantity: Math.max(0, b.quantity + delta) } : b)
        .filter(b => b.quantity > 0)
    )
  }

  const applyPreset = (preset) => {
    setPallet({ length: preset.length, width: preset.width, height: preset.height, max_weight: preset.max_weight })
  }

  const optimize = async () => {
    if (!pallet.length || !pallet.width || !pallet.height || !pallet.max_weight) {
      setError('Fill in all pallet dimensions first.'); return
    }
    if (selectedBoxes.length === 0) {
      setError('Add at least one box.'); return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/optimizer/', {
        pallet: {
          length: parseFloat(pallet.length),
          width: parseFloat(pallet.width),
          height: parseFloat(pallet.height),
          max_weight: parseFloat(pallet.max_weight)
        },
        boxes: selectedBoxes.map(b => ({
          box_id: b.id,
          name: b.name,
          length: b.length,
          width: b.width,
          height: b.height,
          weight: b.weight,
          quantity: b.quantity
        }))
      })
      setResult({ ...res.data, colorMap: Object.fromEntries(selectedBoxes.map(b => [b.name, b.color])) })
    } catch (err) {
      setError(err.response?.data?.detail || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!result || !canvasRef.current) return
    build3D(result, parseFloat(pallet.length), parseFloat(pallet.width), parseFloat(pallet.height))
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (rendererRef.current) rendererRef.current.dispose()
    }
  }, [result])

  function makeTexture(hex) {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 128
    const ctx = c.getContext('2d')
    ctx.fillStyle = hex
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 4
    ctx.strokeRect(5, 5, 118, 118)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, 108, 108)
    return new THREE.CanvasTexture(c)
  }

  function build3D(data, pl, pw, ph) {
    const container = canvasRef.current
    if (rendererRef.current) {
      rendererRef.current.dispose()
      container.innerHTML = ''
    }

    const W = container.clientWidth
    const H = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 5000)
    const dist = Math.max(pl, pw, ph) * 2.4
    const cx = pl / 2, cz = pw / 2, cy = ph / 2
    camera.position.set(cx + dist * 0.9, cy + dist * 0.7, cz + dist * 1.1)
    camera.lookAt(cx, cy / 2, cz)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dl = new THREE.DirectionalLight(0xffffff, 0.9)
    dl.position.set(pl, ph * 2, pw)
    scene.add(dl)
    const fl = new THREE.DirectionalLight(0x6688bb, 0.3)
    fl.position.set(-pl, ph, -pw)
    scene.add(fl)

    // Pallet base
    const palMesh = new THREE.Mesh(
      new THREE.BoxGeometry(pl, 3, pw),
      new THREE.MeshLambertMaterial({ color: 0x7a5c14 })
    )
    palMesh.position.set(cx, -1.5, cz)
    scene.add(palMesh)

    // Pallet slats
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(pl, 1.5, 3.5),
        new THREE.MeshLambertMaterial({ color: 0x5a3f0a })
      )
      slat.position.set(cx, -3.5, pw * 0.15 + i * (pw * 0.35))
      scene.add(slat)
    }

    // Pallet boundary frame
    const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(pl, ph, pw))
    const frame = new THREE.LineSegments(frameGeo, new THREE.LineBasicMaterial({ color: 0x1e3a5a, linewidth: 1 }))
    frame.position.set(cx, ph / 2, cz)
    scene.add(frame)

    // Boxes
    const texCache = {}
    data.placed_boxes.forEach(box => {
      const baseName = box.name.replace(/_\d+$/, '')
      const color = data.colorMap[baseName] || '#4A90D9'
      if (!texCache[color]) texCache[color] = makeTexture(color)
      const tex = texCache[color]

      const mats = Array(6).fill(null).map((_, i) =>
        new THREE.MeshLambertMaterial({
          map: tex,
          color: i === 2
            ? new THREE.Color(color).multiplyScalar(1.3)
            : i === 3
              ? new THREE.Color(color).multiplyScalar(0.65)
              : new THREE.Color(color)
        })
      )

      const geo = new THREE.BoxGeometry(box.length - 0.3, box.height - 0.3, box.width - 0.3)
      const mesh = new THREE.Mesh(geo, mats)
      mesh.position.set(
        box.position_x + box.length / 2,
        box.position_y + box.height / 2,
        box.position_z + box.width / 2
      )
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
      )
      mesh.add(edges)
      scene.add(mesh)
    })

    // Orbit controls (manual)
    let drag = false, px = 0, py2 = 0, theta = -0.5, phi = 0.45
    const R = dist * 1.7
    const target = new THREE.Vector3(cx, ph / 4, cz)

    function updateCam() {
      camera.position.set(
        target.x + R * Math.sin(phi) * Math.sin(theta),
        target.y + R * Math.cos(phi),
        target.z + R * Math.sin(phi) * Math.cos(theta)
      )
      camera.lookAt(target)
    }
    updateCam()

    renderer.domElement.addEventListener('mousedown', e => { drag = true; px = e.clientX; py2 = e.clientY })
    window.addEventListener('mouseup', () => drag = false)
    window.addEventListener('mousemove', e => {
      if (!drag) return
      theta -= (e.clientX - px) * 0.012
      phi = Math.max(0.08, Math.min(1.5, phi - (e.clientY - py2) * 0.012))
      px = e.clientX; py2 = e.clientY
      updateCam()
    })
    renderer.domElement.addEventListener('wheel', e => {
      camera.fov = Math.max(15, Math.min(90, camera.fov + e.deltaY * 0.04))
      camera.updateProjectionMatrix()
    }, { passive: true })

    if (animRef.current) cancelAnimationFrame(animRef.current)
    const animate = () => { animRef.current = requestAnimationFrame(animate); renderer.render(scene, camera) }
    animate()
  }

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto flex-shrink-0">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg">Optimizer</h2>
            <p className="text-gray-400 text-xs mt-1">Configure pallet and select boxes</p>
          </div>

          {/* Pallet dimensions */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 text-xs font-medium uppercase tracking-wide">1 — Pallet</p>
              {presets.length > 0 && (
                <select
                  onChange={e => {
                    const p = presets.find(x => x.id === parseInt(e.target.value))
                    if (p) applyPreset(p)
                  }}
                  className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Load preset</option>
                  {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[['length', 'Length (in)'], ['width', 'Width (in)'], ['height', 'Max height (in)'], ['max_weight', 'Max weight (lb)']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-gray-500 text-xs mb-1 block">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                    value={pallet[key]}
                    onChange={e => setPallet({ ...pallet, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Box selection */}
          <div className="p-4 border-b border-gray-800 flex-1">
            <p className="text-gray-300 text-xs font-medium uppercase tracking-wide mb-3">2 — Select boxes</p>
            <div className="flex gap-2 mb-3">
              {['catalog', 'selected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                  {tab === 'catalog' ? `Catalog (${catalogBoxes.length})` : `Selected (${selectedBoxes.length})`}
                </button>
              ))}
            </div>

            {activeTab === 'catalog' && (
              <div className="flex flex-col gap-2">
                {catalogBoxes.length === 0 && <p className="text-gray-500 text-xs">No boxes in catalog. Add some in Box Catalog first.</p>}
                {catalogBoxes.map(box => (
                  <div key={box.id} className="bg-gray-800 rounded-lg px-3 py-2.5 flex justify-between items-center">
                    <div>
                      <p className="text-white text-xs font-medium">{box.name}</p>
                      <p className="text-gray-500 text-xs">{box.length}×{box.width}×{box.height} · {box.weight}lb</p>
                    </div>
                    <button
                      onClick={() => addBox(box)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded transition"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'selected' && (
              <div className="flex flex-col gap-2">
                {selectedBoxes.length === 0 && <p className="text-gray-500 text-xs">No boxes selected yet.</p>}
                {selectedBoxes.map(box => (
                  <div key={box.id} className="bg-gray-800 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: box.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{box.name}</p>
                      <p className="text-gray-500 text-xs">{box.length}×{box.width}×{box.height}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(box.id, -1)} className="w-5 h-5 bg-gray-700 rounded text-white text-xs flex items-center justify-center hover:bg-gray-600">−</button>
                      <span className="text-white text-xs w-5 text-center">{box.quantity}</span>
                      <button onClick={() => updateQty(box.id, 1)} className="w-5 h-5 bg-gray-700 rounded text-white text-xs flex items-center justify-center hover:bg-gray-600">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Run button */}
          <div className="p-4">
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button
              onClick={optimize}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Optimizing...' : 'Optimize pallet →'}
            </button>
          </div>
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 flex flex-col bg-gray-950">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 flex-shrink-0">
            <span className="text-gray-500 text-xs">Drag to rotate · scroll to zoom</span>
            {result && (
              <div className="flex gap-6">
                {[
                  ['Boxes placed', result.total_boxes],
                  ['Utilization', `${result.volume_utilization}%`],
                  ['Weight', `${result.total_weight} lb`],
                  ['Unfitted', result.unfitted_boxes.length],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-white text-sm font-medium">{value}</p>
                    <p className="text-gray-500 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={canvasRef} className="flex-1 relative">
            {!result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-600">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <p className="text-sm">Configure your pallet and click Optimize</p>
              </div>
            )}
          </div>

          {result && (
            <div className="px-5 py-3 border-t border-gray-800 flex gap-4 flex-wrap flex-shrink-0">
              {[...new Set(result.placed_boxes.map(b => b.name.replace(/_\d+$/, '')))].map(name => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: result.colorMap[name] }} />
                  <span className="text-gray-400 text-xs">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}