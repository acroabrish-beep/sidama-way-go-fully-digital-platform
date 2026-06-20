import React, { useState } from 'react';
import { MapPin, Truck, Car, Users, AlertCircle, Heart, Zap, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export default function SmartCityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample real-time data
  const stats = [
    { label: 'Active Vehicles', value: '342', icon: Truck, color: 'bg-blue-500' },
    { label: 'Taxi Orders', value: '1,248', icon: Car, color: 'bg-orange-500' },
    { label: 'Daily Passengers', value: '42.5K', icon: Users, color: 'bg-green-500' },
    { label: 'Alerts', value: '12', icon: AlertCircle, color: 'bg-red-500' },
  ];

  const modules = [
    {
      name: 'Transportation',
      desc: 'Routes, vehicles, drivers',
      icon: Truck,
      color: 'from-blue-600 to-blue-400',
    },
    {
      name: 'Taxi Management',
      desc: 'Ride booking & tracking',
      icon: Car,
      color: 'from-orange-600 to-orange-400',
    },
    {
      name: 'Tourism',
      desc: 'Site discovery & reviews',
      icon: MapPin,
      color: 'from-purple-600 to-purple-400',
    },
    {
      name: 'Healthcare',
      desc: 'Facility finder, emergencies',
      icon: Heart,
      color: 'from-red-600 to-red-400',
    },
    {
      name: 'Emergency',
      desc: 'Incident response system',
      icon: AlertCircle,
      color: 'from-yellow-600 to-yellow-400',
    },
    {
      name: 'Analytics',
      desc: 'Reports & insights',
      icon: BarChart3,
      color: 'from-indigo-600 to-indigo-400',
    },
  ];

  const recentTrips = [
    { id: 'TRIP-001', route: 'Route 5', passengers: 32, fare: '1,250 ETB', status: 'completed' },
    { id: 'TRIP-002', route: 'Route 12', passengers: 28, fare: '980 ETB', status: 'in_progress' },
    { id: 'TRIP-003', route: 'Route 8', passengers: 35, fare: '1,400 ETB', status: 'completed' },
  ];

  const alerts = [
    { type: 'emergency', message: 'Traffic accident on Route 5', time: '2 min ago' },
    { type: 'warning', message: 'Vehicle maintenance due for Bus-042', time: '5 min ago' },
    { type: 'info', message: 'Peak hour demand: +23% on Route 12', time: '8 min ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Sidama Way Go Platform</h1>
            </div>
            <div className="text-sm text-slate-400">Live Dashboard • Hawassa City</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600/50 hover:border-slate-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-600/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-600/50">
            {['overview', 'modules', 'trips', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-center transition ${
                  activeTab === tab
                    ? 'bg-slate-700/50 text-blue-400 border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Real-time Status */}
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      System Status
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'API Server', status: 'operational' },
                        { name: 'Database', status: 'operational' },
                        { name: 'GPS Tracking', status: 'operational' },
                        { name: 'Emergency Services', status: 'operational' },
                      ].map((service) => (
                        <div key={service.name} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                          <span className="text-slate-300">{service.name}</span>
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-400 text-sm">{service.status}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-3">
                      {[
                        { metric: 'Avg Trip Duration', value: '28 mins' },
                        { metric: 'Fleet Utilization', value: '87%' },
                        { metric: 'Customer Satisfaction', value: '4.8/5.0' },
                        { metric: 'Response Time', value: '1.2s' },
                      ].map((item) => (
                        <div key={item.metric} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                          <span className="text-slate-300">{item.metric}</span>
                          <span className="text-blue-400 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <div
                      key={module.name}
                      className={`bg-gradient-to-br ${module.color} rounded-lg p-6 cursor-pointer hover:shadow-lg transition transform hover:scale-105`}
                    >
                      <Icon className="w-8 h-8 text-white mb-3" />
                      <h3 className="text-xl font-bold text-white">{module.name}</h3>
                      <p className="text-white/80 text-sm mt-2">{module.desc}</p>
                      <div className="mt-4 inline-block px-3 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                        Live
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'trips' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Trips</h3>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between bg-slate-700/30 p-4 rounded-lg border border-slate-600/30 hover:border-slate-500 transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{trip.id}</p>
                        <p className="text-sm text-slate-400">{trip.route}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{trip.passengers} passengers</p>
                        <p className="text-sm text-blue-400">{trip.fare}</p>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            trip.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {trip.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      alert.type === 'emergency'
                        ? 'bg-red-500/10 border-red-500/30'
                        : alert.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'emergency'
                          ? 'bg-red-500'
                          : alert.type === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Sidama Way Go • Fully Digital Smart City Platform • Real-time Operations Dashboard</p>
        </div>
      </div>
    </div>
  );
}
