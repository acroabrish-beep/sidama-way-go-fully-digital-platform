# Sidama Way Go - Flutter Implementation Guide

Complete step-by-step guide to integrate Sidama Way Go into your Flutter + Supabase app.

---

## STEP 1: DATABASE SETUP (5 minutes)

### 1.1 Copy the SQL Script
1. Open `SUPABASE_DDL_EXPORT.sql` in this repository
2. Go to your Supabase Dashboard → SQL Editor
3. Create a new query and paste the entire SQL script
4. Click "Run" to execute all table creation and RLS policies

**What this does:**
- Creates 20+ production-ready tables
- Adds Row Level Security policies for multi-role access control
- Indexes all foreign keys and status columns for performance
- Enables PostGIS for geographic data

---

## STEP 2: FLUTTER PROJECT SETUP (10 minutes)

### 2.1 Create Flutter Project
```bash
flutter create sidama_way_go
cd sidama_way_go
```

### 2.2 Update pubspec.yaml
Copy the dependencies from section **6. PUBSPEC.YAML DEPENDENCIES** in `FLUTTER_SUPABASE_UTILITIES.md`

Run:
```bash
flutter pub get
```

### 2.3 Create Project Structure
```
lib/
  ├── main.dart
  ├── models/
  │   ├── driver.dart
  │   ├── route.dart
  │   └── ticket.dart
  ├── services/
  │   ├── supabase_service.dart
  │   ├── trip_service.dart
  │   ├── driver_service.dart
  │   ├── route_service.dart
  │   ├── auth_service.dart
  │   └── gps_location_service.dart
  ├── screens/
  │   ├── admin_dashboard_screen.dart
  │   ├── live_map_screen.dart
  │   ├── driver_queue_screen.dart
  │   └── home_screen.dart
  ├── providers/
  │   └── riverpod_providers.dart
  └── utils/
      └── error_handler.dart
```

---

## STEP 3: COPY DART FILES

### 3.1 Models
Copy the following from `FLUTTER_DART_COMPONENTS.md`:
- **Driver Model** → `lib/models/driver.dart`
- **Route Model** → `lib/models/route.dart`
- **Ticket Model** → `lib/models/ticket.dart`

### 3.2 Services
Copy the following from `FLUTTER_DART_COMPONENTS.md`:
- **DriverService** → `lib/services/driver_service.dart`
- **RouteService** → `lib/services/route_service.dart`
- **TicketService** → `lib/services/ticket_service.dart`

Copy from `FLUTTER_SUPABASE_UTILITIES.md`:
- **SupabaseService** → `lib/services/supabase_service.dart`
- **TripService** → `lib/services/trip_service.dart`
- **GPSLocationService** → `lib/services/gps_location_service.dart`
- **AuthService** → `lib/services/auth_service.dart`

### 3.3 Screens
Copy the following from `FLUTTER_DART_COMPONENTS.md`:
- **AdminDashboardScreen** → `lib/screens/admin_dashboard_screen.dart`
- **LiveMapScreen** → `lib/screens/live_map_screen.dart`
- **DriverQueueScreen** → `lib/screens/driver_queue_screen.dart`

### 3.4 Providers (State Management)
Copy from `FLUTTER_SUPABASE_UTILITIES.md`:
- **All Providers** → `lib/providers/riverpod_providers.dart`

### 3.5 Utils
Copy from `FLUTTER_SUPABASE_UTILITIES.md`:
- **Error Handler** → `lib/utils/error_handler.dart`

---

## STEP 4: UPDATE main.dart

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/admin_dashboard_screen.dart';
import 'services/supabase_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://YOUR_PROJECT.supabase.co', // Replace with your URL
    anonKey: 'YOUR_ANON_KEY', // Replace with your anon key
  );

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sidama Way Go',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
        fontFamily: 'Poppins', // Use Google Fonts
      ),
      home: const AdminDashboardScreen(),
    );
  }
}
```

---

## STEP 5: CONFIGURE SUPABASE CREDENTIALS

1. Go to your Supabase project settings
2. Copy your **Project URL** and **Anon Key**
3. Replace in `main.dart`:
   ```dart
   url: 'https://YOUR_PROJECT.supabase.co',
   anonKey: 'YOUR_ANON_KEY',
   ```

4. Optional: Create a `.env` file:
   ```
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

   Then load in main.dart:
   ```dart
   import 'package:flutter_dotenv/flutter_dotenv.dart';
   
   await dotenv.load(fileName: ".env");
   
   await Supabase.initialize(
     url: dotenv.env['SUPABASE_URL']!,
     anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
   );
   ```

---

## STEP 6: TEST YOUR SETUP

### 6.1 Run the App
```bash
flutter run
```

### 6.2 Verify Supabase Connection
Add this debug code to `main.dart`:
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(url: 'YOUR_URL', anonKey: 'YOUR_KEY');
  
  // Test connection
  try {
    final response = await Supabase.instance.client.from('routes').select();
    print('[v0] Supabase connected! Routes: ${response.length}');
  } catch (e) {
    print('[v0] Connection error: $e');
  }

  runApp(const ProviderScope(child: MyApp()));
}
```

---

## STEP 7: IMPLEMENT FEATURES

### 7.1 Fetch Drivers
```dart
import 'services/driver_service.dart';

final driverService = DriverService();

// Fetch all active drivers
final drivers = await driverService.fetchActiveDrivers();

// Listen to real-time updates
driverService.driverStream().listen((drivers) {
  setState(() {
    this.drivers = drivers;
  });
});
```

### 7.2 Create a Trip
```dart
import 'services/trip_service.dart';

final tripService = TripService();

final trip = await tripService.createTrip(
  citizenId: 'user-id',
  pickupLocation: 'Main Street',
  dropoffLocation: 'Hospital',
  routeId: 'route-id',
);

print('Trip created: ${trip['trip_code']}');
```

### 7.3 Update Driver Location
```dart
import 'services/gps_location_service.dart';

final gpsService = GPSLocationService();

// Update driver location every 10 seconds
Timer.periodic(Duration(seconds: 10), (timer) async {
  await gpsService.updateDriverLocation(
    driverId: driverId,
    latitude: latitude,
    longitude: longitude,
    speed: speed,
  );
});
```

### 7.4 Authenticate User
```dart
import 'services/auth_service.dart';

final authService = AuthService();

// Sign up
final authResponse = await authService.signUp(
  email: 'user@example.com',
  password: 'password123',
  firstName: 'Ahmed',
  lastName: 'Hassan',
);

// Sign in
await authService.signIn(
  email: 'user@example.com',
  password: 'password123',
);
```

---

## STEP 8: ADD GOOGLE MAPS INTEGRATION (Optional)

### 8.1 Install flutter_map
```bash
flutter pub add flutter_map latlong2
```

### 8.2 Update LiveMapScreen
```dart
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

// In your map widget:
FlutterMap(
  mapController: _mapController,
  options: MapOptions(
    center: LatLng(5.01, 38.74), // Hawassa coordinates
    zoom: 13.0,
  ),
  layers: [
    TileLayerOptions(
      urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
    ),
    MarkerLayerOptions(
      markers: [
        // Add vehicle markers here
      ],
    ),
  ],
)
```

---

## STEP 9: HANDLE REAL-TIME UPDATES

### 9.1 Listen to Trips
```dart
// In your trip screen
final tripService = TripService();

tripService.watchTripStatus(tripId).listen((trips) {
  if (trips.isNotEmpty) {
    final trip = trips.first;
    setState(() {
      status = trip['status'];
      fare = trip['fare'];
    });
  }
});
```

### 9.2 Real-time Incidents
```dart
import 'services/supabase_utilities.dart';

final realtimeSubs = RealtimeSubscriptions();

realtimeSubs.subscribeToIncidents();
// Automatically prints updates when incidents change
```

---

## STEP 10: DEPLOY TO PRODUCTION

### 10.1 Android Deployment
```bash
flutter build apk --release
# Or for Google Play
flutter build appbundle --release
```

### 10.2 iOS Deployment
```bash
flutter build ios --release
# Use Xcode to upload to App Store
open ios/Runner.xcworkspace
```

### 10.3 Environment Variables
Create `.env.production`:
```
SUPABASE_URL=https://YOUR_PRODUCTION_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PRODUCTION_KEY
```

---

## TROUBLESHOOTING

### Issue: "Supabase not initialized"
**Solution:** Ensure `await Supabase.initialize()` is called in `main()` before `runApp()`

### Issue: "RLS policy denies access"
**Solution:** Check that:
1. User is authenticated
2. User has correct role set in JWT claims
3. RLS policies match user_id or role

### Issue: "Real-time updates not working"
**Solution:**
1. Enable Realtime in Supabase dashboard
2. Add row-level security to tables
3. Use `.stream()` instead of `.select()` for subscriptions

### Issue: "GPS location not updating"
**Solution:**
1. Check location permissions in Android/iOS manifests
2. Ensure app has foreground location permission
3. Use `geolocator` package for location services

---

## KEY FILES TO COPY-PASTE

| File | Location | Purpose |
|------|----------|---------|
| `SUPABASE_DDL_EXPORT.sql` | Supabase SQL Editor | Create database |
| `FLUTTER_DART_COMPONENTS.md` | VS Code | Models, Services, Screens |
| `FLUTTER_SUPABASE_UTILITIES.md` | VS Code | Utilities, Providers, Auth |
| `main.dart` content | `lib/main.dart` | App entry point |

---

## NEXT STEPS

1. ✅ Copy SQL script to Supabase
2. ✅ Create Flutter project structure
3. ✅ Copy all Dart files
4. ✅ Add Supabase credentials
5. ✅ Run `flutter pub get`
6. ✅ Run `flutter run`
7. ✅ Test features
8. ✅ Add Google Maps (optional)
9. ✅ Set up location tracking
10. ✅ Deploy to app stores

---

**You now have a complete, production-ready Flutter + Supabase app for Sidama Way Go!**

For questions or issues, refer to:
- Supabase Docs: https://supabase.com/docs
- Flutter Docs: https://flutter.dev/docs
- Riverpod Docs: https://riverpod.dev
