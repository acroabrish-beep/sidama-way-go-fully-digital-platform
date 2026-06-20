import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { DailyAnalytics, User, AuditLog } from '../types/database'

export function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<DailyAnalytics | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'settings'>('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    systemHealth: 98,
    incidentCount: 0,
    vehicleCount: 0,
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*').limit(100)
      setUsers(usersData || [])

      // Fetch today's analytics
      const today = new Date().toISOString().split('T')[0]
      const { data: analyticsData } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('date', today)
        .single()
      setAnalytics(analyticsData)

      // Fetch audit logs
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setAuditLogs(logsData || [])

      // Calculate stats
      const activeCount = usersData?.filter(u => u.status === 'active').length || 0
      const [
        { count: vehicleCount },
        { count: incidentCount },
      ] = await Promise.all([
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_incidents').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        totalUsers: usersData?.length || 0,
        activeUsers: activeCount,
        totalRevenue: analyticsData?.total_revenue || 0,
        systemHealth: 98,
        incidentCount: incidentCount || 0,
        vehicleCount: vehicleCount || 0,
      })
    } catch (err) {
      console.error('[v0] Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'suspended' })
        .eq('id', userId)

      if (!error) {
        fetchAdminData()
      }
    } catch (err) {
      console.error('[v0] Error suspending user:', err)
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId)

      if (!error) {
        fetchAdminData()
      }
    } catch (err) {
      console.error('[v0] Error activating user:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Super Admin Dashboard</h1>
          <p className="text-foreground-muted">Platform management and system oversight</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatBox label="Total Users" value={stats.totalUsers} color="primary" />
          <StatBox label="Active Users" value={stats.activeUsers} color="success" />
          <StatBox label="Total Revenue" value={`ETB ${stats.totalRevenue.toLocaleString()}`} color="accent" />
          <StatBox label="Vehicles" value={stats.vehicleCount} color="primary" />
          <StatBox label="Incidents" value={stats.incidentCount} color={stats.incidentCount > 10 ? 'error' : 'warning'} />
          <StatBox label="System Health" value={`${stats.systemHealth}%`} color="success" />
        </div>

        {/* Tabs */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-surface-light">
            {(['overview', 'users', 'audit', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-foreground border-b-2 border-primary'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-foreground-muted">Loading dashboard...</div>
            ) : activeTab === 'overview' && (
              <OverviewTab analytics={analytics} stats={stats} />
            )}
            {activeTab === 'users' && (
              <UsersTab users={users} onSuspend={handleSuspendUser} onActivate={handleActivateUser} />
            )}
            {activeTab === 'audit' && <AuditTab logs={auditLogs} />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorClass = {
    primary: 'bg-primary/10 border-primary',
    success: 'bg-success/10 border-success',
    accent: 'bg-accent/10 border-accent',
    error: 'bg-error/10 border-error',
    warning: 'bg-warning/10 border-warning',
  }[color] || 'bg-primary/10 border-primary'

  const textColorClass = {
    primary: 'text-primary',
    success: 'text-success',
    accent: 'text-accent',
    error: 'text-error',
    warning: 'text-warning',
  }[color] || 'text-primary'

  return (
    <div className={`${colorClass} border rounded-lg p-4 text-center`}>
      <p className="text-foreground-muted text-sm mb-2">{label}</p>
      <p className={`text-2xl font-bold ${textColorClass}`}>{value}</p>
    </div>
  )
}

function OverviewTab({ analytics, stats }: { analytics: DailyAnalytics | null; stats: Record<string, any> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-surface-light rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-4">System Status</h3>
          <div className="space-y-3">
            <StatusItem label="API Server" status="online" />
            <StatusItem label="Database" status="online" />
            <StatusItem label="Authentication" status="online" />
            <StatusItem label="GPS Tracking" status="online" />
            <StatusItem label="Emergency Services" status="online" />
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-foreground-muted">
                <span className="font-medium text-foreground">Uptime:</span> 99.98%
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-surface-light rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Performance</h3>
          <div className="space-y-3">
            <PerformanceMetric label="Avg Response Time" value="145ms" status="good" />
            <PerformanceMetric label="Error Rate" value="0.02%" status="good" />
            <PerformanceMetric label="CPU Usage" value="35%" status="good" />
            <PerformanceMetric label="Memory Usage" value="62%" status="good" />
            <PerformanceMetric label="Database Load" value="28%" status="good" />
          </div>
        </div>
      </div>

      {/* Daily Analytics */}
      {analytics && (
        <div className="bg-surface-light rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Today&apos;s Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnalyticsItem label="Total Trips" value={analytics.total_trips} />
            <AnalyticsItem label="Revenue" value={`ETB ${analytics.total_revenue.toLocaleString()}`} />
            <AnalyticsItem label="Active Drivers" value={analytics.active_drivers} />
            <AnalyticsItem label="Vehicles" value={analytics.active_vehicles} />
            <AnalyticsItem label="Deliveries" value={analytics.completed_deliveries} />
            <AnalyticsItem label="Incidents" value={analytics.emergency_incidents} />
            <AnalyticsItem label="Avg Rating" value={analytics.avg_trip_rating ? analytics.avg_trip_rating.toFixed(1) : 'N/A'} />
          </div>
        </div>
      )}
    </div>
  )
}

function UsersTab({ users, onSuspend, onActivate }: { users: User[]; onSuspend: (id: string) => void; onActivate: (id: string) => void }) {
  const usersByType = {
    citizen: users.filter(u => u.user_type === 'citizen').length,
    driver: users.filter(u => u.user_type === 'driver').length,
    business: users.filter(u => u.user_type === 'business').length,
    admin: users.filter(u => u.user_type === 'admin').length,
  }

  return (
    <div className="space-y-6">
      {/* User Type Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 border border-primary rounded-lg p-4">
          <p className="text-foreground-muted text-sm">Citizens</p>
          <p className="text-2xl font-bold text-primary">{usersByType.citizen}</p>
        </div>
        <div className="bg-accent/10 border border-accent rounded-lg p-4">
          <p className="text-foreground-muted text-sm">Drivers</p>
          <p className="text-2xl font-bold text-accent">{usersByType.driver}</p>
        </div>
        <div className="bg-success/10 border border-success rounded-lg p-4">
          <p className="text-foreground-muted text-sm">Businesses</p>
          <p className="text-2xl font-bold text-success">{usersByType.business}</p>
        </div>
        <div className="bg-warning/10 border border-warning rounded-lg p-4">
          <p className="text-foreground-muted text-sm">Admins</p>
          <p className="text-2xl font-bold text-warning">{usersByType.admin}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-foreground font-semibold">Email</th>
              <th className="text-left px-4 py-3 text-foreground font-semibold">Name</th>
              <th className="text-left px-4 py-3 text-foreground font-semibold">Type</th>
              <th className="text-left px-4 py-3 text-foreground font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-foreground font-semibold">Joined</th>
              <th className="text-left px-4 py-3 text-foreground font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.slice(0, 20).map(user => (
              <tr key={user.id} className="hover:bg-surface-light transition-colors">
                <td className="px-4 py-3 text-foreground-muted">{user.email}</td>
                <td className="px-4 py-3 text-foreground">{user.first_name || 'N/A'}</td>
                <td className="px-4 py-3 text-foreground capitalize">{user.user_type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'active' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground-muted text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  {user.status === 'active' ? (
                    <button
                      onClick={() => onSuspend(user.id)}
                      className="px-2 py-1 bg-error/20 text-error rounded text-xs hover:bg-error/30 transition-colors"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(user.id)}
                      className="px-2 py-1 bg-success/20 text-success rounded text-xs hover:bg-success/30 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AuditTab({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <span className="text-sm text-foreground-muted">{logs.length} events</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-foreground-muted">No audit logs available</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-surface-light rounded border border-border text-sm">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-foreground capitalize">{log.action}</p>
                <p className="text-xs text-foreground-muted">{new Date(log.created_at).toLocaleTimeString()}</p>
              </div>
              <p className="text-foreground-muted text-xs">
                {log.entity_type && `Type: ${log.entity_type}`}
                {log.user_id && ` | User: ${log.user_id.slice(0, 8)}...`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-light rounded-lg p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-4">System Configuration</h3>
        <div className="space-y-4">
          <SettingItem label="Emergency Response Timeout" value="5 minutes" />
          <SettingItem label="Trip Completion Timeout" value="2 hours" />
          <SettingItem label="Driver Verification Enabled" value="Yes" />
          <SettingItem label="Emergency Auto-Dispatch" value="Enabled" />
          <SettingItem label="Rate Limiting" value="100 requests/minute" />
          <SettingItem label="Data Retention" value="1 year" />
        </div>
      </div>

      <div className="bg-surface-light rounded-lg p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Database Maintenance</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-primary text-foreground rounded hover:bg-primary-light transition-colors">
            Backup Database
          </button>
          <button className="w-full px-4 py-2 bg-surface border border-border text-foreground rounded hover:border-primary transition-colors">
            Optimize Tables
          </button>
          <button className="w-full px-4 py-2 bg-surface border border-border text-foreground rounded hover:border-primary transition-colors">
            Clear Cache
          </button>
        </div>
      </div>

      <div className="bg-error/10 border border-error rounded-lg p-4">
        <h3 className="font-semibold text-error mb-2">Danger Zone</h3>
        <p className="text-foreground-muted text-sm mb-3">These actions cannot be undone</p>
        <button className="px-4 py-2 bg-error text-foreground rounded hover:bg-error/80 transition-colors">
          Emergency Restart System
        </button>
      </div>
    </div>
  )
}

function StatusItem({ label, status }: { label: string; status: 'online' | 'offline' | 'warning' }) {
  const statusColor = {
    online: 'text-success',
    offline: 'text-error',
    warning: 'text-warning',
  }[status]

  return (
    <div className="flex justify-between items-center">
      <p className="text-foreground-muted">{label}</p>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-success' : status === 'offline' ? 'bg-error' : 'bg-warning'}`} />
        <span className={`text-xs font-medium capitalize ${statusColor}`}>{status}</span>
      </div>
    </div>
  )
}

function PerformanceMetric({ label, value, status }: { label: string; value: string; status: 'good' | 'warning' | 'critical' }) {
  const statusColor = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-error',
  }[status]

  return (
    <div className="flex justify-between items-center">
      <p className="text-foreground-muted">{label}</p>
      <p className={`font-semibold ${statusColor}`}>{value}</p>
    </div>
  )
}

function AnalyticsItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-foreground-muted text-xs mb-1">{label}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  )
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <p className="text-foreground">{label}</p>
      <p className="text-foreground-muted text-sm">{value}</p>
    </div>
  )
}
