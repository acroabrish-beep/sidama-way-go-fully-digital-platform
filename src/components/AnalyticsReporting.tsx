import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { DailyAnalytics } from '../types/database'

export function AnalyticsReporting() {
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedMetrics, setSelectedMetrics] = useState(['trips', 'revenue', 'drivers', 'incidents'])

  useEffect(() => {
    fetchAnalytics()
  }, [reportType])

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(90)

      if (error) throw error
      setAnalytics(data || [])
    } catch (err) {
      console.error('[v0] Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (reportType === 'custom' && (!dateRange.start || !dateRange.end)) {
      alert('Please select a date range')
      return
    }

    try {
      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: true })

      if (error) throw error
      setAnalytics(data || [])
    } catch (err) {
      console.error('[v0] Error generating report:', err)
    }
  }

  const exportReport = () => {
    const reportData = analytics.map(a => ({
      Date: a.date,
      Trips: a.total_trips,
      Revenue: a.total_revenue,
      'Active Drivers': a.active_drivers,
      'Active Vehicles': a.active_vehicles,
      Deliveries: a.completed_deliveries,
      Incidents: a.emergency_incidents,
      Rating: a.avg_trip_rating,
    }))

    const csv = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const calculateStats = (data: DailyAnalytics[]) => {
    if (data.length === 0) return null

    const totalTrips = data.reduce((sum, d) => sum + d.total_trips, 0)
    const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0)
    const avgRating = data.reduce((sum, d) => sum + (d.avg_trip_rating || 0), 0) / data.length
    const totalIncidents = data.reduce((sum, d) => sum + d.emergency_incidents, 0)
    const avgDrivers = Math.round(data.reduce((sum, d) => sum + d.active_drivers, 0) / data.length)

    return { totalTrips, totalRevenue, avgRating, totalIncidents, avgDrivers }
  }

  const stats = calculateStats(analytics)
  const displayData = reportType === 'weekly' ? analytics.slice(0, 7) : reportType === 'monthly' ? analytics.slice(0, 30) : analytics.slice(0, 1)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics & Reporting</h1>
          <p className="text-foreground-muted">Comprehensive platform performance and business intelligence</p>
        </div>

        {/* Report Controls */}
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Report Generator</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {(['daily', 'weekly', 'monthly', 'custom'] as const).map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded font-medium transition-colors capitalize ${
                  reportType === type
                    ? 'bg-primary text-foreground'
                    : 'bg-surface-light border border-border text-foreground-muted hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {reportType === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 bg-surface-light border border-border rounded text-foreground"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 bg-surface-light border border-border rounded text-foreground"
              />
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-primary text-foreground rounded hover:bg-primary-light transition-colors font-medium"
              >
                Generate
              </button>
            </div>
          )}

          {/* Metric Selection */}
          <div className="mb-4">
            <p className="text-foreground mb-2 text-sm font-medium">Metrics to Include:</p>
            <div className="flex flex-wrap gap-2">
              {['trips', 'revenue', 'drivers', 'vehicles', 'deliveries', 'incidents', 'rating'].map(metric => (
                <button
                  key={metric}
                  onClick={() =>
                    setSelectedMetrics(prev =>
                      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
                    )
                  }
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                    selectedMetrics.includes(metric)
                      ? 'bg-primary text-foreground'
                      : 'bg-surface-light border border-border text-foreground-muted'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportReport}
            className="px-6 py-2 bg-success text-foreground rounded hover:bg-success/80 transition-colors font-medium"
          >
            Export as CSV
          </button>
        </div>

        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Trips" value={stats.totalTrips} color="primary" />
            <StatCard label="Total Revenue" value={`ETB ${stats.totalRevenue.toLocaleString()}`} color="accent" />
            <StatCard label="Avg Rating" value={stats.avgRating.toFixed(1)} color="success" />
            <StatCard label="Total Incidents" value={stats.totalIncidents} color="warning" />
            <StatCard label="Avg Drivers" value={stats.avgDrivers} color="primary" />
          </div>
        )}

        {/* Data Table */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-light">
            <h3 className="font-semibold text-foreground">
              {reportType === 'daily'
                ? 'Daily Report'
                : reportType === 'weekly'
                ? 'Weekly Report (Last 7 Days)'
                : reportType === 'monthly'
                ? 'Monthly Report (Last 30 Days)'
                : 'Custom Report'}
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center text-foreground-muted">Loading analytics...</div>
          ) : displayData.length === 0 ? (
            <div className="p-6 text-center text-foreground-muted">No data available for selected period</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-light">
                  <tr>
                    <th className="text-left px-4 py-3 text-foreground font-semibold">Date</th>
                    {selectedMetrics.includes('trips') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Trips</th>
                    )}
                    {selectedMetrics.includes('revenue') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Revenue</th>
                    )}
                    {selectedMetrics.includes('drivers') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Active Drivers</th>
                    )}
                    {selectedMetrics.includes('vehicles') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Active Vehicles</th>
                    )}
                    {selectedMetrics.includes('deliveries') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Deliveries</th>
                    )}
                    {selectedMetrics.includes('incidents') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Incidents</th>
                    )}
                    {selectedMetrics.includes('rating') && (
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Avg Rating</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayData.map(analytics => (
                    <tr key={analytics.id} className="hover:bg-surface-light transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{analytics.date}</td>
                      {selectedMetrics.includes('trips') && (
                        <td className="px-4 py-3 text-foreground-muted">{analytics.total_trips}</td>
                      )}
                      {selectedMetrics.includes('revenue') && (
                        <td className="px-4 py-3 text-foreground-muted">ETB {analytics.total_revenue.toLocaleString()}</td>
                      )}
                      {selectedMetrics.includes('drivers') && (
                        <td className="px-4 py-3 text-foreground-muted">{analytics.active_drivers}</td>
                      )}
                      {selectedMetrics.includes('vehicles') && (
                        <td className="px-4 py-3 text-foreground-muted">{analytics.active_vehicles}</td>
                      )}
                      {selectedMetrics.includes('deliveries') && (
                        <td className="px-4 py-3 text-foreground-muted">{analytics.completed_deliveries}</td>
                      )}
                      {selectedMetrics.includes('incidents') && (
                        <td className="px-4 py-3 text-foreground-muted">{analytics.emergency_incidents}</td>
                      )}
                      {selectedMetrics.includes('rating') && (
                        <td className="px-4 py-3 text-foreground-muted">
                          {analytics.avg_trip_rating ? analytics.avg_trip_rating.toFixed(2) : 'N/A'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Performance Insights</h3>
            <div className="space-y-3">
              {analytics.length > 1 && (
                <>
                  <InsightItem
                    label="Trend"
                    value={
                      analytics[0].total_trips > analytics[1].total_trips
                        ? '📈 Increasing'
                        : analytics[0].total_trips < analytics[1].total_trips
                        ? '📉 Decreasing'
                        : '➡️ Stable'
                    }
                  />
                  <InsightItem
                    label="Growth Rate"
                    value={`${(((analytics[0].total_trips - analytics[1].total_trips) / analytics[1].total_trips) * 100).toFixed(1)}%`}
                  />
                </>
              )}
              <InsightItem label="Avg Daily Revenue" value={`ETB ${Math.round(stats?.totalRevenue || 0 / analytics.length).toLocaleString()}`} />
              <InsightItem label="Peak Activity" value={analytics[0]?.date || 'N/A'} />
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Quality Metrics</h3>
            <div className="space-y-3">
              <InsightItem
                label="Service Rating"
                value={`${stats?.avgRating.toFixed(1) || 'N/A'}/5.0 ⭐`}
              />
              <InsightItem
                label="Safety Score"
                value={`${Math.max(0, 100 - (stats?.totalIncidents || 0) * 5)}%`}
              />
              <InsightItem
                label="Driver Availability"
                value={`${Math.round((stats?.avgDrivers || 0 / 100) * 100)}%`}
              />
              <InsightItem
                label="System Uptime"
                value="99.98%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorClass = {
    primary: 'bg-primary/10 border-primary',
    accent: 'bg-accent/10 border-accent',
    success: 'bg-success/10 border-success',
    warning: 'bg-warning/10 border-warning',
  }[color]

  const textColorClass = {
    primary: 'text-primary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
  }[color]

  return (
    <div className={`${colorClass} border rounded-lg p-4 text-center`}>
      <p className="text-foreground-muted text-sm mb-2">{label}</p>
      <p className={`text-2xl font-bold ${textColorClass}`}>{value}</p>
    </div>
  )
}

function InsightItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-foreground-muted">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  )
}
