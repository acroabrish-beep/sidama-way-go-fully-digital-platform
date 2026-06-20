import React from 'react';
import { 
  MapPin, Users, TrendingUp, LogOut, Menu, X, 
  Activity, DollarSign, Truck, AlertCircle, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Sample data
  const dailyRidesData = [
    { time: '6AM', rides: 340 },
    { time: '9AM', rides: 890 },
    { time: '12PM', rides: 1240 },
    { time: '3PM', rides: 950 },
    { time: '6PM', rides: 1420 },
    { time: '9PM', rides: 640 },
  ];

  const revenueData = [
    { date: 'Mon', revenue: 340000 },
    { date: 'Tue', revenue: 420000 },
    { date: 'Wed', revenue: 380000 },
    { date: 'Thu', revenue: 510000 },
    { date: 'Fri', revenue: 620000 },
    { date: 'Sat', revenue: 450000 },
    { date: 'Sun', revenue: 280000 },
  ];

  const driverStatusData = [
    { name: 'Active', value: 156, color: '#10b981' },
    { name: 'On Break', value: 32, color: '#f59e0b' },
    { name: 'Offline', value: 12, color: '#ef4444' },
  ];

  const routePerformance = [
    { route: 'Route 1', passengers: 2340, efficiency: 94 },
    { route: 'Route 2', passengers: 1890, efficiency: 87 },
    { route: 'Route 3', passengers: 2100, efficiency: 91 },
    { route: 'Route 4', passengers: 1560, efficiency: 85 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-surface border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg">Sidama Way</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {[
            { icon: Activity, label: 'Dashboard', id: 'dashboard' },
            { icon: TrendingUp, label: 'Analytics', id: 'analytics' },
            { icon: Users, label: 'Drivers', id: 'drivers' },
            { icon: MapPin, label: 'Routes', id: 'routes' },
            { icon: DollarSign, label: 'Revenue', id: 'revenue' },
            { icon: AlertCircle, label: 'Alerts', id: 'alerts' },
          ].map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-light transition-colors text-left group"
            >
              <Icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors flex-shrink-0" />
              {sidebarOpen && <span className="group-hover:text-accent transition-colors">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-light transition-colors text-error hover:text-error group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:text-primary transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-foreground-muted">Super Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full" />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-foreground-muted">Welcome back! Here&apos;s your transit system overview.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Rides */}
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground-muted">Active Rides</h3>
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">1,234</div>
                <div className="flex items-center gap-2 text-sm text-success">
                  <ArrowUpRight size={16} />
                  <span>+12% from yesterday</span>
                </div>
              </div>

              {/* Revenue */}
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground-muted">Total Revenue</h3>
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">ETB 2.4M</div>
                <div className="flex items-center gap-2 text-sm text-success">
                  <ArrowUpRight size={16} />
                  <span>+8% from last week</span>
                </div>
              </div>

              {/* Active Drivers */}
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground-muted">Active Drivers</h3>
                  <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">156</div>
                <div className="flex items-center gap-2 text-sm text-success">
                  <ArrowUpRight size={16} />
                  <span>+5 since morning</span>
                </div>
              </div>

              {/* System Health */}
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground-muted">System Health</h3>
                  <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">99.8%</div>
                <div className="flex items-center gap-2 text-sm text-success">
                  <span>All systems operational</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Daily Rides Chart */}
              <div className="lg:col-span-2 p-6 bg-surface border border-border rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Daily Rides</h3>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyRidesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="time" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="rides" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Driver Status */}
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Driver Status</h3>
                  <PieChartIcon className="w-5 h-5 text-accent" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={driverStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {driverStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {driverStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="p-6 bg-surface border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Weekly Revenue Trend</h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value) => `ETB ${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" dot={{ fill: '#ff6b35' }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Route Performance Table */}
            <div className="p-6 bg-surface border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Route Performance</h3>
                <Truck className="w-5 h-5 text-accent" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground-muted">Route</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground-muted">Passengers</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground-muted">Efficiency</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routePerformance.map((route) => (
                      <tr key={route.route} className="border-b border-border/50 hover:bg-surface-light transition-colors">
                        <td className="py-4 px-4 font-semibold">{route.route}</td>
                        <td className="py-4 px-4">{route.passengers.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-accent"
                                style={{ width: `${route.efficiency}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{route.efficiency}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded-full">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
