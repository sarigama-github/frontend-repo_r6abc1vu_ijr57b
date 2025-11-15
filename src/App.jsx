import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Leaf, Share2, Plus, Bus, Bike, Recycle, Salad } from 'lucide-react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const ACTIVITY_OPTIONS = [
  { key: 'public_transport', label: 'Public Transport', icon: Bus },
  { key: 'vegan_meal', label: 'Vegan Meal', icon: Salad },
  { key: 'recycling', label: 'Recycling', icon: Recycle },
  { key: 'bike_ride', label: 'Bike Ride', icon: Bike },
]

function Hero() {
  return (
    <div className="relative h-[60vh] w-full overflow-hidden">
      <Spline scene="https://prod.spline.design/atN3lqky4IzF-KEP/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none" />
      <div className="absolute inset-0 flex items-end justify-center pb-10">
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 py-1 text-sm font-medium text-emerald-700 mb-4">
            <Leaf className="w-4 h-4" />
            Make eco moves. Earn green points.
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Carbon Action, Leveled Up
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Log your eco-friendly actions, climb the leaderboard, collect badges, and share your impact with friends.
          </p>
        </div>
      </div>
    </div>
  )
}

function ActivityForm({ onCreate }) {
  const [username, setUsername] = useState('neo')
  const [type, setType] = useState('public_transport')
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, activity_type: type, quantity: qty, notes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error logging')
      onCreate?.(data, { username, type, qty })
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const Seed = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/seed`, { method: 'POST' })
      await res.json()
      onCreate?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username" className="flex-1 px-3 py-2 border rounded-lg"/>
        <button type="button" onClick={Seed} className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50">Seed demo</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ACTIVITY_OPTIONS.map(opt => {
          const Icon = opt.icon
          const active = type === opt.key
          return (
            <button key={opt.key} type="button" onClick={()=>setType(opt.key)} className={`flex items-center gap-2 border rounded-xl px-3 py-2 transition ${active ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4"/> {opt.label}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 items-center">
        <label className="text-sm text-gray-600">Quantity</label>
        <input type="number" min={1} value={qty} onChange={(e)=>setQty(parseInt(e.target.value||'1'))} className="w-24 px-3 py-2 border rounded-lg"/>
        <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="optional note or link" className="flex-1 px-3 py-2 border rounded-lg"/>
        <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4"/> Log Activity
        </button>
      </div>
    </form>
  )
}

function Leaderboard() {
  const [rows, setRows] = useState([])
  useEffect(() => { (async()=>{
    const r = await fetch(`${BACKEND}/api/leaderboard`)
    setRows(await r.json())
  })() }, [])
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-amber-500"/>
        <h3 className="text-lg font-semibold">Leaderboard</h3>
      </div>
      <div className="divide-y">
        {rows.map((r,i)=> (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="w-6 text-gray-400">#{i+1}</span>
              <span className="font-medium">{r.username}</span>
            </div>
            <span className="font-bold text-emerald-700">{r.points} pts</span>
          </div>
        ))}
        {rows.length===0 && <div className="text-gray-500 text-sm">No data yet. Try seeding demo.</div>}
      </div>
    </div>
  )
}

function ActivityFeed() {
  const [items, setItems] = useState([])
  const refresh = async () => {
    const r = await fetch(`${BACKEND}/api/activities?limit=25`)
    setItems(await r.json())
  }
  useEffect(()=>{ refresh() }, [])
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-5 h-5 text-emerald-600"/>
        <h3 className="text-lg font-semibold">Recent Eco Actions</h3>
      </div>
      <div className="space-y-3">
        {items.map((it)=> (
          <div key={it._id} className="flex items-center justify-between p-3 border rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">@{it.username}</span>
              <span className="text-gray-900 font-medium">{it.activity_type.replace('_',' ')}</span>
              <span className="text-gray-500">x{it.quantity}</span>
            </div>
            <span className="font-bold text-emerald-700">+{it.points}</span>
          </div>
        ))}
        {items.length===0 && <div className="text-gray-500 text-sm">No actions yet.</div>}
      </div>
    </div>
  )
}

function ShareCard() {
  const [username, setUsername] = useState('neo')
  const [summary, setSummary] = useState(null)

  const load = async () => {
    const r = await fetch(`${BACKEND}/api/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    const data = await r.json()
    setSummary(data)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-indigo-600"/>
        <h3 className="text-lg font-semibold">Shareable Summary</h3>
      </div>
      <div className="flex gap-2 items-center mb-3">
        <input value={username} onChange={(e)=>setUsername(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg"/>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Generate</button>
      </div>
      {summary && (
        <div className="p-4 rounded-xl border bg-gradient-to-br from-indigo-50 to-emerald-50">
          <div className="font-bold text-gray-900">@{summary.username}</div>
          <div className="text-3xl font-extrabold text-emerald-700">{summary.total_points} pts</div>
          <div className="text-gray-600 mb-2">{summary.activities_logged} actions • {summary.badges?.length || 0} badges</div>
          <div className="flex gap-2 flex-wrap">
            {(summary.badges||[]).map(b => (
              <span key={b._id} className="px-3 py-1 rounded-full bg-white border text-sm">{b.name}</span>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-700">{summary.share_text}</div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50">
      <Hero />
      <main className="max-w-6xl mx-auto px-4 -mt-20 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <ActivityForm onCreate={()=>setRefreshKey(k=>k+1)} />
            <ActivityFeed key={refreshKey} />
          </div>
          <div className="flex flex-col gap-6">
            <Leaderboard />
            <ShareCard />
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-gray-500 text-sm">Built for urban youth—turn your carbon action into a game.</footer>
    </div>
  )
}
