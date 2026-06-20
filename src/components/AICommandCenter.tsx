import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import {
  parseCommand,
  generatePredictions,
  generateInsights,
  analyzeTrends,
  generateRecommendations,
  type Command,
  type PredictionResult,
} from '../lib/ai/commands'

export function AICommandCenter() {
  const [commandInput, setCommandInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<Array<{ input: string; timestamp: Date }>>([])
  const [parsedCommand, setParsedCommand] = useState<Command | null>(null)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [trends, setTrends] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'trends' | 'recommendations'>('insights')

  useEffect(() => {
    fetchCurrentMetrics()
  }, [])

  const fetchCurrentMetrics = async () => {
    try {
      // Fetch today's analytics
      const today = new Date().toISOString().split('T')[0]
      const { data: analyticsData } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('date', today)
        .single()

      // Fetch counts
      const [
        { count: vehicleCount },
        { count: driverCount },
        { count: incidentCount },
        { count: tripCount },
      ] = await Promise.all([
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'on_duty'),
        supabase
          .from('emergency_incidents')
          .select('*', { count: 'exact', head: true })
          .in('status', ['reported', 'acknowledged', 'in_progress']),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      ])

      const currentMetrics: Record<string, number> = {
        total_trips: analyticsData?.total_trips || 0,
        total_revenue: analyticsData?.total_revenue || 0,
        active_drivers: driverCount || 0,
        active_vehicles: vehicleCount || 0,
        active_rides: tripCount || 0,
        incidents: incidentCount || 0,
        average_driver_rating: analyticsData?.avg_trip_rating || 4.5,
        occupancy_rate: 65,
        average_trip_time: 18,
        daily_revenue: analyticsData?.total_revenue || 10000,
        pending_orders: 12,
        vehicle_maintenance: 2,
        average_wait_time: 5,
        incident_rate: 0.03,
      }

      setMetrics(currentMetrics)

      // Generate AI insights
      const newInsights = generateInsights(currentMetrics)
      const newPredictions = generatePredictions(currentMetrics)
      const newTrends = analyzeTrends(currentMetrics, { ...currentMetrics, total_trips: currentMetrics.total_trips * 0.95 })
      const newRecommendations = generateRecommendations(currentMetrics)

      setInsights(newInsights)
      setPredictions(newPredictions)
      setTrends(newTrends)
      setRecommendations(newRecommendations)

      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching metrics:', err)
      setLoading(false)
    }
  }

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commandInput.trim()) return

    const parsed = parseCommand(commandInput)
    setParsedCommand(parsed)

    // Add to history
    setCommandHistory([...commandHistory, { input: commandInput, timestamp: new Date() }])

    // Reset input
    setCommandInput('')

    // Simulate command processing
    if (parsed) {
      console.log('[v0] Processing command:', parsed)
      // In a real implementation, this would call the backend
      // to execute the command and get results
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Command Center</h1>
          <p className="text-foreground-muted">Voice and text commands for intelligent city management</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Command Input */}
          <div className="lg:col-span-2 bg-surface rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Command Input</h2>

            <form onSubmit={handleCommandSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Try: 'Check route 5', 'Emergency at market', 'Show analytics', 'Find hospital'..."
                  className="flex-1 px-4 py-3 bg-surface-light border border-border rounded text-foreground placeholder-foreground-muted"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-foreground rounded hover:bg-primary-light transition-colors font-medium"
                >
                  Execute
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCommandInput('Check vehicle status')}
                  className="px-3 py-2 text-xs bg-surface-light border border-border text-foreground rounded hover:border-primary transition-colors"
                >
                  Vehicle Status
                </button>
                <button
                  type="button"
                  onClick={() => setCommandInput('Report emergency')}
                  className="px-3 py-2 text-xs bg-surface-light border border-border text-foreground rounded hover:border-primary transition-colors"
                >
                  Emergency
                </button>
                <button
                  type="button"
                  onClick={() => setCommandInput('Show performance report')}
                  className="px-3 py-2 text-xs bg-surface-light border border-border text-foreground rounded hover:border-primary transition-colors"
                >
                  Report
                </button>
                <button
                  type="button"
                  onClick={() => setCommandInput('Find nearby services')}
                  className="px-3 py-2 text-xs bg-surface-light border border-border text-foreground rounded hover:border-primary transition-colors"
                >
                  Services
                </button>
              </div>
            </form>

            {/* Last Command Status */}
            {parsedCommand && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary rounded">
                <p className="text-foreground-muted text-sm mb-2">
                  <span className="font-medium text-foreground">Last Command:</span>
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">Type:</span> {parsedCommand.type}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Action:</span> {parsedCommand.action}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Confidence:</span> {(parsedCommand.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Command History */}
            {commandHistory.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-foreground mb-2">Recent Commands</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {[...commandHistory].reverse().map((cmd, idx) => (
                    <div key={idx} className="p-2 bg-surface-light rounded text-sm">
                      <p className="text-foreground">{cmd.input}</p>
                      <p className="text-foreground-muted text-xs">{cmd.timestamp.toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground mb-4">Current Metrics</h3>

            <MetricCard label="Active Vehicles" value={metrics.active_vehicles || 0} color="primary" />
            <MetricCard label="Active Drivers" value={metrics.active_drivers || 0} color="accent" />
            <MetricCard label="Ongoing Trips" value={metrics.active_rides || 0} color="success" />
            <MetricCard label="Active Incidents" value={metrics.incidents || 0} color={metrics.incidents > 5 ? 'error' : 'warning'} />
            <MetricCard label="Daily Revenue" value={`ETB ${metrics.daily_revenue || 0}`} color="primary" />
            <MetricCard label="Avg Rating" value={`${(metrics.average_driver_rating || 4.5).toFixed(1)}/5`} color="primary" />
          </div>
        </div>

        {/* Analysis Tabs */}
        <div className="bg-surface rounded-lg border border-border p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-border">
            {(['insights', 'predictions', 'trends', 'recommendations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="text-center py-8 text-foreground-muted">Loading analysis...</div>
          ) : (
            <div>
              {activeTab === 'insights' && (
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <InsightCard key={idx} insight={insight} />
                  ))}
                </div>
              )}

              {activeTab === 'predictions' && (
                <div className="space-y-3">
                  {predictions.map((pred, idx) => (
                    <PredictionCard key={idx} prediction={pred} />
                  ))}
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-3">
                  {trends.map((trend, idx) => (
                    <TrendCard key={idx} trend={trend} />
                  ))}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorClass = {
    primary: 'text-primary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  }[color] || 'text-primary'

  return (
    <div className="flex justify-between items-center p-3 bg-surface-light rounded">
      <p className="text-foreground-muted">{label}</p>
      <p className={`font-bold text-lg ${colorClass}`}>{value}</p>
    </div>
  )
}

function InsightCard({ insight }: { insight: string }) {
  return (
    <div className="p-4 bg-accent/10 border border-accent rounded flex gap-3">
      <span className="text-xl">💡</span>
      <p className="text-foreground">{insight}</p>
    </div>
  )
}

function PredictionCard({ prediction }: { prediction: PredictionResult }) {
  const trendIcon = {
    up: '📈',
    down: '📉',
    stable: '➡️',
  }[prediction.trend]

  return (
    <div className="p-4 bg-primary/10 border border-primary rounded">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-foreground">{prediction.metric}</h4>
        <span className="text-xl">{trendIcon}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div>
          <p className="text-foreground-muted">Current</p>
          <p className="font-bold text-foreground">{prediction.current}</p>
        </div>
        <div>
          <p className="text-foreground-muted">Predicted</p>
          <p className="font-bold text-primary">{prediction.predicted}</p>
        </div>
      </div>
      <p className="text-xs text-foreground-muted">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
    </div>
  )
}

function TrendCard({ trend }: { trend: string }) {
  return (
    <div className="p-4 bg-success/10 border border-success rounded flex gap-3">
      <span className="text-xl">📊</span>
      <p className="text-foreground">{trend}</p>
    </div>
  )
}

function RecommendationCard({ recommendation }: { recommendation: string }) {
  return (
    <div className="p-4 bg-warning/10 border border-warning rounded flex gap-3">
      <span className="text-xl">⚡</span>
      <p className="text-foreground">{recommendation}</p>
    </div>
  )
}
