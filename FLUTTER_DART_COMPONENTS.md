# Sidama Way Go - Flutter Dart Components & Models

This document contains complete Flutter Dart code ready to copy-paste into your VS Code editor.

---

## 1. DART DATA MODELS

### 1.1 Driver Model

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class Driver {
  final String id;
  final String userId;
  final String licenseNumber;
  final DateTime licenseExpiry;
  final String? vehicleId;
  final String status; // on_duty, off_duty, on_leave, suspended
  final double rating;
  final int totalRides;
  final double totalEarnings;
  final String? currentLocation;
  final DateTime createdAt;
  final DateTime updatedAt;

  Driver({
    required this.id,
    required this.userId,
    required this.licenseNumber,
    required this.licenseExpiry,
    this.vehicleId,
    required this.status,
    required this.rating,
    required this.totalRides,
    required this.totalEarnings,
    this.currentLocation,
    required this.createdAt,
    required this.updatedAt,
  });

  // Convert from JSON (Supabase response)
  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      licenseNumber: json['license_number'] as String,
      licenseExpiry: DateTime.parse(json['license_expiry'] as String),
      vehicleId: json['vehicle_id'] as String?,
      status: json['status'] as String,
      rating: (json['rating'] as num).toDouble(),
      totalRides: json['total_rides'] as int,
      totalEarnings: (json['total_earnings'] as num).toDouble(),
      currentLocation: json['current_location'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // Convert to JSON (for Supabase insert/update)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'license_number': licenseNumber,
      'license_expiry': licenseExpiry.toIso8601String(),
      'vehicle_id': vehicleId,
      'status': status,
      'rating': rating,
      'total_rides': totalRides,
      'total_earnings': totalEarnings,
      'current_location': currentLocation,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Driver copyWith({
    String? id,
    String? userId,
    String? licenseNumber,
    DateTime? licenseExpiry,
    String? vehicleId,
    String? status,
    double? rating,
    int? totalRides,
    double? totalEarnings,
    String? currentLocation,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Driver(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      licenseExpiry: licenseExpiry ?? this.licenseExpiry,
      vehicleId: vehicleId ?? this.vehicleId,
      status: status ?? this.status,
      rating: rating ?? this.rating,
      totalRides: totalRides ?? this.totalRides,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      currentLocation: currentLocation ?? this.currentLocation,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
```

### 1.2 Route Model

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class Route {
  final String id;
  final String routeNumber;
  final String name;
  final String? description;
  final String? startLocation;
  final String? endLocation;
  final double? distanceKm;
  final int? estimatedTimeMinutes;
  final double farePrice;
  final String status; // active, inactive, maintenance
  final String? operatorId;
  final DateTime createdAt;
  final DateTime updatedAt;

  Route({
    required this.id,
    required this.routeNumber,
    required this.name,
    this.description,
    this.startLocation,
    this.endLocation,
    this.distanceKm,
    this.estimatedTimeMinutes,
    required this.farePrice,
    required this.status,
    this.operatorId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Route.fromJson(Map<String, dynamic> json) {
    return Route(
      id: json['id'] as String,
      routeNumber: json['route_number'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      startLocation: json['start_location'] as String?,
      endLocation: json['end_location'] as String?,
      distanceKm: json['distance_km'] != null 
        ? (json['distance_km'] as num).toDouble() 
        : null,
      estimatedTimeMinutes: json['estimated_time_minutes'] as int?,
      farePrice: (json['fare_price'] as num).toDouble(),
      status: json['status'] as String,
      operatorId: json['operator_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'route_number': routeNumber,
      'name': name,
      'description': description,
      'start_location': startLocation,
      'end_location': endLocation,
      'distance_km': distanceKm,
      'estimated_time_minutes': estimatedTimeMinutes,
      'fare_price': farePrice,
      'status': status,
      'operator_id': operatorId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

### 1.3 Ticket/Booking Model

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class Ticket {
  final String id;
  final String ticketCode;
  final String citizenId;
  final String? tripId;
  final String? routeId;
  final String? qrCode;
  final DateTime issueDate;
  final DateTime validityDate;
  final String status; // active, used, expired, refunded
  final double price;
  final DateTime createdAt;

  Ticket({
    required this.id,
    required this.ticketCode,
    required this.citizenId,
    this.tripId,
    this.routeId,
    this.qrCode,
    required this.issueDate,
    required this.validityDate,
    required this.status,
    required this.price,
    required this.createdAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'] as String,
      ticketCode: json['ticket_code'] as String,
      citizenId: json['citizen_id'] as String,
      tripId: json['trip_id'] as String?,
      routeId: json['route_id'] as String?,
      qrCode: json['qr_code'] as String?,
      issueDate: DateTime.parse(json['issue_date'] as String),
      validityDate: DateTime.parse(json['validity_date'] as String),
      status: json['status'] as String,
      price: (json['price'] as num).toDouble(),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticket_code': ticketCode,
      'citizen_id': citizenId,
      'trip_id': tripId,
      'route_id': routeId,
      'qr_code': qrCode,
      'issue_date': issueDate.toIso8601String(),
      'validity_date': validityDate.toIso8601String(),
      'status': status,
      'price': price,
      'created_at': createdAt.toIso8601String(),
    };
  }

  bool get isExpired => DateTime.now().isAfter(validityDate);
  bool get isUsed => status == 'used';
  bool get isActive => status == 'active' && !isExpired;
}
```

---

## 2. SUPABASE FLUTTER INTEGRATION EXAMPLES

### 2.1 Initialize Supabase in main.dart

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL', // Replace with your URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // Replace with your key
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sidama Way Go',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomeScreen(),
    );
  }
}
```

### 2.2 Fetch Drivers List

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class DriverService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Fetch all active drivers
  Future<List<Driver>> fetchActiveDrivers() async {
    try {
      final response = await _supabase
          .from('drivers')
          .select()
          .eq('status', 'on_duty')
          .order('rating', ascending: false);

      return (response as List<dynamic>)
          .map((json) => Driver.fromJson(json as Map<String, dynamic>))
          .toList();
    } on PostgrestException catch (e) {
      print('[v0] Error fetching drivers: ${e.message}');
      rethrow;
    }
  }

  // Fetch single driver by ID
  Future<Driver?> fetchDriverById(String driverId) async {
    try {
      final response = await _supabase
          .from('drivers')
          .select()
          .eq('id', driverId)
          .single();

      return Driver.fromJson(response as Map<String, dynamic>);
    } on PostgrestException catch (e) {
      print('[v0] Error fetching driver: ${e.message}');
      return null;
    }
  }

  // Update driver status
  Future<void> updateDriverStatus(String driverId, String newStatus) async {
    try {
      await _supabase
          .from('drivers')
          .update({'status': newStatus})
          .eq('id', driverId);
    } on PostgrestException catch (e) {
      print('[v0] Error updating driver status: ${e.message}');
      rethrow;
    }
  }

  // Fetch drivers with real-time updates using streams
  Stream<List<Driver>> driverStream() {
    return _supabase
        .from('drivers')
        .stream(primaryKey: ['id'])
        .order('rating', ascending: false)
        .map((data) => (data as List<dynamic>)
            .map((json) => Driver.fromJson(json as Map<String, dynamic>))
            .toList());
  }
}
```

### 2.3 Fetch Routes with Details

```dart
class RouteService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Fetch all active routes
  Future<List<Route>> fetchActiveRoutes() async {
    try {
      final response = await _supabase
          .from('routes')
          .select()
          .eq('status', 'active')
          .order('route_number', ascending: true);

      return (response as List<dynamic>)
          .map((json) => Route.fromJson(json as Map<String, dynamic>))
          .toList();
    } on PostgrestException catch (e) {
      print('[v0] Error fetching routes: ${e.message}');
      rethrow;
    }
  }

  // Fetch route stops for a specific route
  Future<List<Map<String, dynamic>>> fetchRouteStops(String routeId) async {
    try {
      final response = await _supabase
          .from('route_stops')
          .select()
          .eq('route_id', routeId)
          .order('stop_number', ascending: true);

      return (response as List<dynamic>)
          .map((json) => json as Map<String, dynamic>)
          .toList();
    } on PostgrestException catch (e) {
      print('[v0] Error fetching route stops: ${e.message}');
      rethrow;
    }
  }

  // Real-time stream of routes
  Stream<List<Route>> routeStream() {
    return _supabase
        .from('routes')
        .stream(primaryKey: ['id'])
        .order('route_number', ascending: true)
        .map((data) => (data as List<dynamic>)
            .map((json) => Route.fromJson(json as Map<String, dynamic>))
            .toList());
  }
}
```

### 2.4 Ticket/Booking Operations

```dart
class TicketService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Create new ticket
  Future<Ticket> createTicket({
    required String citizenId,
    required String routeId,
    required double price,
    required DateTime validityDate,
  }) async {
    try {
      final ticket = Ticket(
        id: '',
        ticketCode: 'TKT-${DateTime.now().millisecondsSinceEpoch}',
        citizenId: citizenId,
        tripId: null,
        routeId: routeId,
        qrCode: null,
        issueDate: DateTime.now(),
        validityDate: validityDate,
        status: 'active',
        price: price,
        createdAt: DateTime.now(),
      );

      final response = await _supabase
          .from('tickets')
          .insert(ticket.toJson())
          .select()
          .single();

      return Ticket.fromJson(response as Map<String, dynamic>);
    } on PostgrestException catch (e) {
      print('[v0] Error creating ticket: ${e.message}');
      rethrow;
    }
  }

  // Fetch user's tickets
  Future<List<Ticket>> fetchUserTickets(String citizenId) async {
    try {
      final response = await _supabase
          .from('tickets')
          .select()
          .eq('citizen_id', citizenId)
          .order('created_at', ascending: false);

      return (response as List<dynamic>)
          .map((json) => Ticket.fromJson(json as Map<String, dynamic>))
          .toList();
    } on PostgrestException catch (e) {
      print('[v0] Error fetching tickets: ${e.message}');
      rethrow;
    }
  }

  // Mark ticket as used
  Future<void> markTicketAsUsed(String ticketId) async {
    try {
      await _supabase
          .from('tickets')
          .update({'status': 'used'})
          .eq('id', ticketId);
    } on PostgrestException catch (e) {
      print('[v0] Error marking ticket as used: ${e.message}');
      rethrow;
    }
  }
}
```

---

## 3. FLUTTER WIDGET COMPONENTS

### 3.1 Admin Dashboard Main Screen

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _selectedIndex = 0;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar Navigation
          SizedBox(
            width: 250,
            child: Drawer(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  DrawerHeader(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF3b82f6), Color(0xFF1e40af)],
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          'Sidama Way Go',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Admin Dashboard',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _navItem('Overview', Icons.dashboard, 0),
                  _navItem('Drivers', Icons.people, 1),
                  _navItem('Vehicles', Icons.directions_car, 2),
                  _navItem('Routes', Icons.route, 3),
                  _navItem('Trips', Icons.receipt, 4),
                  _navItem('Analytics', Icons.bar_chart, 5),
                  Divider(),
                  _navItem('Settings', Icons.settings, 6),
                  _navItem('Logout', Icons.logout, 7),
                ],
              ),
            ),
          ),
          // Main Content Area
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(),
                    SizedBox(height: 24),
                    _buildMetricsCards(),
                    SizedBox(height: 24),
                    _buildMainContent(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _navItem(String title, IconData icon, int index) {
    return ListTile(
      leading: Icon(icon, color: _selectedIndex == index ? Color(0xFF3b82f6) : Colors.grey),
      title: Text(title),
      selected: _selectedIndex == index,
      onTap: () => setState(() => _selectedIndex = index),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dashboard',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            Text('Welcome back to Sidama Way Go Admin Panel'),
          ],
        ),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Color(0xFFF3F4F6),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(Icons.account_circle, color: Color(0xFF6B7280)),
              SizedBox(width: 8),
              Text('Admin User'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetricsCards() {
    return GridView.count(
      crossAxisCount: 4,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      children: [
        _metricCard('Active Vehicles', '342', Colors.blue, Icons.directions_car),
        _metricCard('Active Drivers', '156', Colors.orange, Icons.people),
        _metricCard('Total Revenue', 'ETB 2.4M', Colors.green, Icons.money),
        _metricCard('Incidents Today', '12', Colors.red, Icons.warning),
      ],
    );
  }

  Widget _metricCard(String title, String value, Color color, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFFE5E7EB)),
      ),
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 28),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(color: Color(0xFF6B7280), fontSize: 12),
              ),
              SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMainContent() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFFE5E7EB)),
      ),
      padding: EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Recent Activity',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          _buildActivityTable(),
        ],
      ),
    );
  }

  Widget _buildActivityTable() {
    return DataTable(
      columns: [
        DataColumn(label: Text('Timestamp')),
        DataColumn(label: Text('Event Type')),
        DataColumn(label: Text('Details')),
        DataColumn(label: Text('Status')),
      ],
      rows: [
        DataRow(cells: [
          DataCell(Text('2024-01-20 14:32')),
          DataCell(Text('Trip Completed')),
          DataCell(Text('Route #42 - 15km')),
          DataCell(Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Color(0xFFDCFCE7),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text('Success', style: TextStyle(color: Color(0xFF065F46))),
          )),
        ]),
        DataRow(cells: [
          DataCell(Text('2024-01-20 13:15')),
          DataCell(Text('Emergency Alert')),
          DataCell(Text('Road Accident - Main St')),
          DataCell(Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Color(0xFFFEE2E2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text('Critical', style: TextStyle(color: Color(0xFF991B1B))),
          )),
        ]),
      ],
    );
  }
}
```

### 3.2 Live Map/Route Management Widget

```dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({Key? key}) : super(key: key);

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
  late MapController _mapController;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Live Route Management'),
        backgroundColor: Color(0xFF3b82f6),
      ),
      body: Stack(
        children: [
          // Map View (Placeholder - integrate flutter_map or google_maps_flutter)
          Container(
            color: Color(0xFFE5E7EB),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 64, color: Color(0xFF3b82f6)),
                  SizedBox(height: 16),
                  Text(
                    'Map Integration',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Integrate google_maps_flutter or flutter_map here\nShow vehicles, routes, and incidents in real-time',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF6B7280)),
                  ),
                ],
              ),
            ),
          ),
          // Right Panel - Route Details
          Positioned(
            right: 0,
            top: 0,
            bottom: 0,
            width: 300,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(left: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  Text(
                    'Active Routes',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 16),
                  _routeItem('Route #42', 'Main - Hospital', 15, '45 min'),
                  _routeItem('Route #27', 'Station - Market', 8, '25 min'),
                  _routeItem('Route #35', 'Park - Airport', 22, '60 min'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _routeItem(String routeNum, String name, double distance, String time) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                routeNum,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Active',
                  style: TextStyle(fontSize: 10, color: Color(0xFF065F46)),
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Text(name, style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${distance}km', style: TextStyle(fontSize: 11)),
              Text(time, style: TextStyle(fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
```

### 3.3 Driver Queue & Dispatch DataTable

```dart
import 'package:flutter/material.dart';

class DriverQueueScreen extends StatefulWidget {
  const DriverQueueScreen({Key? key}) : super(key: key);

  @override
  State<DriverQueueScreen> createState() => _DriverQueueScreenState();
}

class _DriverQueueScreenState extends State<DriverQueueScreen> {
  final List<Map<String, dynamic>> drivers = [
    {
      'id': 'D001',
      'name': 'Ahmed Hassan',
      'status': 'on_duty',
      'vehicle': 'BUS-2045',
      'route': 'Route #42',
      'passengers': 45,
      'rating': 4.8,
    },
    {
      'id': 'D002',
      'name': 'Fatima Ali',
      'status': 'on_duty',
      'vehicle': 'TAXI-5021',
      'route': 'Route #27',
      'passengers': 4,
      'rating': 4.9,
    },
    {
      'id': 'D003',
      'name': 'Mohamed Ibrahim',
      'status': 'off_duty',
      'vehicle': 'BUS-1834',
      'route': '-',
      'passengers': 0,
      'rating': 4.6,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Driver Queue & Dispatch'),
        backgroundColor: Color(0xFF3b82f6),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () => _addDriver(),
              style: ElevatedButton.styleFrom(backgroundColor: Color(0xFFff6b35)),
              child: Text('+ Dispatch Driver'),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columns: [
              DataColumn(label: Text('Driver Name')),
              DataColumn(label: Text('Vehicle')),
              DataColumn(label: Text('Status')),
              DataColumn(label: Text('Route')),
              DataColumn(label: Text('Passengers')),
              DataColumn(label: Text('Rating')),
              DataColumn(label: Text('Actions')),
            ],
            rows: drivers.map((driver) {
              return DataRow(
                cells: [
                  DataCell(
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(driver['name'], style: TextStyle(fontWeight: FontWeight.bold)),
                        Text(driver['id'], style: TextStyle(fontSize: 11, color: Color(0xFF6B7280))),
                      ],
                    ),
                  ),
                  DataCell(Text(driver['vehicle'])),
                  DataCell(
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: driver['status'] == 'on_duty' 
                          ? Color(0xFFDCFCE7)
                          : Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        driver['status'] == 'on_duty' ? 'On Duty' : 'Off Duty',
                        style: TextStyle(
                          fontSize: 11,
                          color: driver['status'] == 'on_duty'
                            ? Color(0xFF065F46)
                            : Color(0xFF991B1B),
                        ),
                      ),
                    ),
                  ),
                  DataCell(Text(driver['route'])),
                  DataCell(Text('${driver['passengers']}/48')),
                  DataCell(Text('${driver['rating']} ⭐')),
                  DataCell(
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(Icons.call, color: Color(0xFF3b82f6)),
                          onPressed: () => _callDriver(driver['name']),
                        ),
                        IconButton(
                          icon: Icon(Icons.edit, color: Color(0xFFff6b35)),
                          onPressed: () => _editDriver(driver),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  void _addDriver() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Dispatch driver functionality')),
    );
  }

  void _callDriver(String name) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Calling $name...')),
    );
  }

  void _editDriver(Map<String, dynamic> driver) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Editing ${driver['name']}...')),
    );
  }
}
```

---

## 4. QUICK START CHECKLIST

- [ ] Copy the SQL script to your Supabase SQL Editor
- [ ] Copy the Dart models to `lib/models/`
- [ ] Copy the services to `lib/services/`
- [ ] Copy the widgets to `lib/screens/`
- [ ] Update Supabase credentials in `main.dart`
- [ ] Add dependencies to `pubspec.yaml`:
  ```yaml
  supabase_flutter: ^1.x.x
  flutter_map: ^6.0.0
  latlong2: ^0.9.0
  ```
- [ ] Run `flutter pub get`
- [ ] Test on your Flutter app!

---

**Ready to integrate? Copy the code above directly into VS Code!**
