import React from 'react';
import { MapPin, Users, TrendingUp, Zap, ArrowRight, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sidama Way Go</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground-muted hover:text-foreground transition-colors">Features</a>
            <a href="#analytics" className="text-foreground-muted hover:text-foreground transition-colors">Analytics</a>
            <a href="#contact" className="text-foreground-muted hover:text-foreground transition-colors">Contact</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/smart-city')}
              className="px-6 py-2 text-foreground hover:text-primary transition-colors"
            >
              Live Platform
            </button>
            <button 
              onClick={() => navigate('/user-login')}
              className="px-6 py-2 text-foreground hover:text-primary transition-colors"
            >
              User Login
            </button>
            <button 
              onClick={() => navigate('/admin-login')}
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              Admin Dashboard
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-4">
            <a href="#features" className="block text-foreground-muted hover:text-foreground">Features</a>
            <a href="#analytics" className="block text-foreground-muted hover:text-foreground">Analytics</a>
            <a href="#contact" className="block text-foreground-muted hover:text-foreground">Contact</a>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => navigate('/user-login')}
                className="flex-1 px-4 py-2 text-foreground border border-primary rounded-lg"
              >
                User Login
              </button>
              <button 
                onClick={() => navigate('/admin-login')}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                  <span className="text-primary text-sm font-semibold">Smart Transit Platform</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Transform <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">City Transit</span>
                </h1>
                <p className="text-xl text-foreground-muted leading-relaxed max-w-xl">
                  Experience the future of public transportation in Hawassa with real-time tracking, smart routing, and seamless digital payments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/user-login')}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight size={20} />
                </button>
                <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary">2.5M+</div>
                  <p className="text-sm text-foreground-muted">Daily Users</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">450+</div>
                  <p className="text-sm text-foreground-muted">Active Routes</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success">99%</div>
                  <p className="text-sm text-foreground-muted">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 rounded-3xl backdrop-blur-sm border border-primary/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Live Tracking Map</h3>
                  <p className="text-foreground-muted">Real-time bus location and arrival times</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Smart Transit Features</h2>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Comprehensive solutions for modern urban mobility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group p-6 bg-surface border border-border rounded-2xl hover:border-primary/50 hover:bg-surface-light transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Live Tracking</h3>
              <p className="text-foreground-muted text-sm">Real-time GPS tracking of all buses with accurate arrival predictions</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 bg-surface border border-border rounded-2xl hover:border-accent/50 hover:bg-surface-light transition-all hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Smart Payments</h3>
              <p className="text-foreground-muted text-sm">Digital wallet integration with multiple payment methods</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 bg-surface border border-border rounded-2xl hover:border-success/50 hover:bg-surface-light transition-all hover:shadow-lg hover:shadow-success/10">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success/30 transition-colors">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold mb-2">Driver Management</h3>
              <p className="text-foreground-muted text-sm">Complete driver profile and compliance tracking system</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 bg-surface border border-border rounded-2xl hover:border-warning/50 hover:bg-surface-light transition-all hover:shadow-lg hover:shadow-warning/10">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-warning/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-bold mb-2">Analytics</h3>
              <p className="text-foreground-muted text-sm">Comprehensive reporting and performance metrics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Advanced Analytics</h2>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Data-driven insights for better decision making
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-surface border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Active Rides</h3>
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">1,234</div>
              <p className="text-sm text-foreground-muted">+12% from last week</p>
              <div className="w-full h-2 bg-surface-light rounded-full mt-4 overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary-light" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-surface border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Revenue</h3>
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">ETB 2.4M</div>
              <p className="text-sm text-foreground-muted">+8% from last week</p>
              <div className="w-full h-2 bg-surface-light rounded-full mt-4 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-accent to-accent-light" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-surface border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Driver Status</h3>
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">89%</div>
              <p className="text-sm text-foreground-muted">Available drivers</p>
              <div className="w-full h-2 bg-surface-light rounded-full mt-4 overflow-hidden">
                <div className="h-full w-5/6 bg-gradient-to-r from-success to-success" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Transform Transit?</h2>
          <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
            Join thousands of commuters enjoying seamless, smart transportation in Hawassa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/user-login')}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              Get Started Now
            </button>
            <button className="px-8 py-3 border-2 border-foreground-muted text-foreground rounded-lg font-semibold hover:border-foreground transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Sidama Way Go</span>
              </div>
              <p className="text-sm text-foreground-muted">Smart public transit for Hawassa</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#analytics" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-foreground-muted">
            <p>&copy; 2024 Sidama Way Go. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
