// AI Command Processing System
export type CommandType = 'transportation' | 'emergency' | 'analytics' | 'tourism' | 'healthcare' | 'delivery' | 'system'

export interface Command {
  type: CommandType
  action: string
  parameters: Record<string, unknown>
  confidence: number
}

export interface PredictionResult {
  metric: string
  predicted: number
  current: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
}

// Natural language command parser
export function parseCommand(input: string): Command | null {
  const lowerInput = input.toLowerCase().trim()

  // Transportation commands
  if (lowerInput.includes('route') || lowerInput.includes('bus') || lowerInput.includes('transit')) {
    return {
      type: 'transportation',
      action: 'check_routes',
      parameters: { query: lowerInput },
      confidence: 0.85,
    }
  }

  // Emergency commands
  if (
    lowerInput.includes('emergency') ||
    lowerInput.includes('accident') ||
    lowerInput.includes('fire') ||
    lowerInput.includes('ambulance') ||
    lowerInput.includes('help') ||
    lowerInput.includes('sos')
  ) {
    return {
      type: 'emergency',
      action: 'report_incident',
      parameters: { description: input, urgency: 'high' },
      confidence: 0.95,
    }
  }

  // Analytics commands
  if (
    lowerInput.includes('analytics') ||
    lowerInput.includes('report') ||
    lowerInput.includes('statistics') ||
    lowerInput.includes('performance')
  ) {
    return {
      type: 'analytics',
      action: 'generate_report',
      parameters: { type: 'summary' },
      confidence: 0.8,
    }
  }

  // Tourism commands
  if (
    lowerInput.includes('tourist') ||
    lowerInput.includes('attraction') ||
    lowerInput.includes('visit') ||
    lowerInput.includes('hotel')
  ) {
    return {
      type: 'tourism',
      action: 'search_attractions',
      parameters: { query: lowerInput },
      confidence: 0.85,
    }
  }

  // Healthcare commands
  if (
    lowerInput.includes('hospital') ||
    lowerInput.includes('clinic') ||
    lowerInput.includes('pharmacy') ||
    lowerInput.includes('medical') ||
    lowerInput.includes('doctor')
  ) {
    return {
      type: 'healthcare',
      action: 'find_facility',
      parameters: { query: lowerInput },
      confidence: 0.9,
    }
  }

  // Delivery commands
  if (
    lowerInput.includes('deliver') ||
    lowerInput.includes('delivery') ||
    lowerInput.includes('package') ||
    lowerInput.includes('shipment')
  ) {
    return {
      type: 'delivery',
      action: 'track_delivery',
      parameters: { query: lowerInput },
      confidence: 0.8,
    }
  }

  // System commands
  if (
    lowerInput.includes('status') ||
    lowerInput.includes('system') ||
    lowerInput.includes('platform')
  ) {
    return {
      type: 'system',
      action: 'check_status',
      parameters: {},
      confidence: 0.75,
    }
  }

  return null
}

// Predictive analytics generator
export function generatePredictions(currentMetrics: Record<string, number>): PredictionResult[] {
  const predictions: PredictionResult[] = []

  // Predict ride demand
  const currentRides = currentMetrics.active_rides || 0
  predictions.push({
    metric: 'Expected Ride Demand',
    predicted: Math.round(currentRides * 1.15), // 15% increase trend
    current: currentRides,
    trend: 'up',
    confidence: 0.82,
  })

  // Predict traffic congestion
  const expectedCongestion = Math.round((currentMetrics.average_trip_time || 20) * 1.1)
  predictions.push({
    metric: 'Estimated Traffic Congestion',
    predicted: expectedCongestion,
    current: currentMetrics.average_trip_time || 20,
    trend: 'up',
    confidence: 0.78,
  })

  // Predict revenue
  const currentRevenue = currentMetrics.daily_revenue || 10000
  predictions.push({
    metric: 'Predicted Daily Revenue',
    predicted: Math.round(currentRevenue * 1.08), // 8% growth
    current: currentRevenue,
    trend: 'up',
    confidence: 0.85,
  })

  // Predict driver availability
  const activeDrivers = currentMetrics.active_drivers || 50
  predictions.push({
    metric: 'Available Drivers',
    predicted: Math.max(10, Math.round(activeDrivers * 0.95)), // Slight decrease expected
    current: activeDrivers,
    trend: 'down',
    confidence: 0.72,
  })

  // Predict emergency incidents
  predictions.push({
    metric: 'Expected Incidents (next 2 hours)',
    predicted: Math.ceil((currentMetrics.incidents || 5) * 1.1),
    current: currentMetrics.incidents || 5,
    trend: 'stable',
    confidence: 0.68,
  })

  return predictions
}

// Generate contextual insights
export function generateInsights(metrics: Record<string, number>): string[] {
  const insights: string[] = []

  const occupancy = metrics.occupancy_rate || 0
  if (occupancy > 85) {
    insights.push('High occupancy detected. Consider deploying additional vehicles to high-demand routes.')
  } else if (occupancy < 30) {
    insights.push('Low occupancy. This is a good opportunity for maintenance or reducing fleet size.')
  }

  const revenue = metrics.daily_revenue || 0
  const avgPerRide = revenue / Math.max(1, metrics.active_rides || 1)
  if (avgPerRide > 150) {
    insights.push('Above-average revenue per ride. Premium service is performing well.')
  }

  const driverRating = metrics.average_driver_rating || 0
  if (driverRating < 4.0) {
    insights.push('Driver ratings are below target. Consider implementing training programs.')
  } else if (driverRating > 4.7) {
    insights.push('Excellent driver performance. Consider recognition rewards program.')
  }

  const emergencies = metrics.incidents || 0
  if (emergencies > 10) {
    insights.push('Increased incident reports. Deploy additional emergency resources.')
  }

  if (insights.length === 0) {
    insights.push('System operating normally within expected parameters.')
  }

  return insights
}

// Generate trend analysis
export function analyzeTrends(
  currentMetrics: Record<string, number>,
  previousMetrics: Record<string, number>
): string[] {
  const trends: string[] = []

  const tripChange = ((currentMetrics.total_trips || 0) - (previousMetrics.total_trips || 0)) / Math.max(1, previousMetrics.total_trips || 1)
  if (tripChange > 0.1) {
    trends.push(`Trip volume up ${(tripChange * 100).toFixed(1)}% compared to previous period.`)
  } else if (tripChange < -0.1) {
    trends.push(`Trip volume down ${(-tripChange * 100).toFixed(1)}% compared to previous period.`)
  }

  const revenueChange = ((currentMetrics.total_revenue || 0) - (previousMetrics.total_revenue || 0)) / Math.max(1, previousMetrics.total_revenue || 1)
  if (revenueChange > 0.1) {
    trends.push(`Revenue increased by ${(revenueChange * 100).toFixed(1)}%.`)
  } else if (revenueChange < -0.1) {
    trends.push(`Revenue declined by ${(-revenueChange * 100).toFixed(1)}%.`)
  }

  const driverChange = currentMetrics.active_drivers - previousMetrics.active_drivers
  if (driverChange > 5) {
    trends.push(`${driverChange} additional drivers came online.`)
  } else if (driverChange < -5) {
    trends.push(`${-driverChange} drivers went offline.`)
  }

  return trends
}

// Format recommendations
export function generateRecommendations(metrics: Record<string, number>): string[] {
  const recommendations: string[] = []

  if ((metrics.active_drivers || 0) < 20) {
    recommendations.push('Deploy more drivers to meet current demand.')
  }

  if ((metrics.pending_orders || 0) > (metrics.active_drivers || 1) * 3) {
    recommendations.push('Consider surge pricing to balance supply and demand.')
  }

  if ((metrics.vehicle_maintenance || 0) > 5) {
    recommendations.push('Several vehicles require maintenance. Schedule service appointments.')
  }

  if ((metrics.average_wait_time || 0) > 10) {
    recommendations.push('Wait times are high. Consider route optimization.')
  }

  if ((metrics.incident_rate || 0) > 0.05) {
    recommendations.push('Incident rate is above normal. Review safety protocols.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current operations - no immediate action needed.')
  }

  return recommendations
}
