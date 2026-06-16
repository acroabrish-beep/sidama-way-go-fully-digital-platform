/**
 * Hawassa Smart City Platform - Strongly Typed Schemas (30 Firestore Collections)
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  status: "Active" | "Suspended" | "Pending";
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: string; // e.g. "120 km"
  estimatedTime: string; // e.g. "1 hr 45 min"
  price: number;
  active: boolean;
  code: string; // e.g. "HW-AW"
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: "Minibus" | "Lada Taxi" | "Coaster Bus" | "Bajaj";
  capacity: number;
  status: "Available" | "Scheduled" | "Maintenance";
  driverId: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: "Active" | "Off-Duty" | "Suspended";
  rating: number;
}

export interface Schedule {
  id: string;
  routeId: string;
  routeCode: string; // e.g. "HW-AW"
  routeLabel: string; // e.g. "Hawassa → Aleta Wondo"
  vehicleId: string;
  vehiclePlate: string;
  departureTime: string; // e.g. "08:30 AM"
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: "Pending" | "Boarding" | "En-Route" | "Completed" | "Cancelled";
  driverName: string;
}

export interface Terminal {
  id: string;
  name: string;
  location: string;
  activeRoutesCount: number;
}

export interface Ticket {
  id: string;
  scheduleId: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: number;
  price: number;
  status: "Paid" | "Validated" | "Cancelled";
  paymentMethod: "Telebirr" | "CBE Birr" | "Bank Transfer";
  qrCode: string; // Base64 or ID for QR
  ticketNumber: string; // e.g. "TKT-2026-003"
  bookingTime: string;
  routeLabel: string;
  departureTime: string;
}

export interface TicketScan {
  id: string;
  ticketId: string;
  scanTime: string;
  scannedBy: string;
  result: "Success" | "Invalid" | "Already Scanned";
}

export interface Payment {
  id: string;
  amount: number;
  currency: string; // "ETB"
  method: "Telebirr" | "CBE Birr" | "Bank Transfer";
  reference: string; // e.g. "TXN-984210"
  status: "Completed" | "Failed" | "Pending";
  timestamp: string;
  type: "Transportation" | "Taxi" | "Hotel" | "Food" | "Pharmacy" | "EcoShine" | "General";
  payerName: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: "Transport" | "Tourism" | "Emergency" | "General" | "Health";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: "Push" | "Emergency" | "Tourism" | "Hotel" | "Food" | "System";
  isRead: boolean;
  timestamp: string;
}

export interface TaxiStation {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  currentTaxis: number;
}

export interface TaxiDriver {
  id: string;
  name: string;
  phone: string;
  taxiId: string;
  plateNumber: string;
  licenseNumber?: string;
  liveLatitude: number;
  liveLongitude: number;
  active: boolean;
  fareRate: number; // e.g. 50 ETB/km
  rating: number;
}

export interface TourismSite {
  id: string;
  name: string;
  category: string; // e.g. "Nature", "Culture", "Monuments"
  description: string;
  photoUrl: string;
  videoUrl: string;
  history: string;
  coords: { x: number; y: number }; // Relative coordinates for vector map
  views: number;
  rating: number;
}

export interface TourismCategory {
  id: string;
  name: string;
  iconName: string;
}

export interface Hotel {
  id: string;
  name: string;
  rooms: { type: string; price: number; count: number; available: number }[];
  amenities: string[];
  contact: string;
  verified: boolean;
  coords: { x: number; y: number };
  rating: number;
  photoUrl: string;
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestPhone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalPaid: number;
  status: "Scheduled" | "Checked-In" | "Completed" | "Cancelled";
  paymentReference: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  logo: string;
  location: string;
  coords: { x: number; y: number };
}

export interface FoodOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  status: "Received" | "Preparing" | "Dispatched" | "Delivered" | "Cancelled";
  riderName: string;
  deliveryAddress: string;
  timestamp: string;
}

export interface Hospital {
  id: string;
  name: string;
  contact: string;
  emergencyNumber: string;
  doctorsCount: number;
  coords: { x: number; y: number };
}

export interface Pharmacy {
  id: string;
  name: string;
  medicineCount: number;
  coords: { x: number; y: number };
  contact: string;
  open24h: boolean;
}

export interface EmergencyRequest {
  id: string;
  type: "Police" | "Ambulance" | "Fire";
  reporterName: string;
  reporterPhone: string;
  gpsLocation: string; // coordinate string
  coords: { x: number; y: number };
  description: string;
  status: "Pending" | "Dispatched" | "Resolved";
  time: string;
}

export interface EcoShineLocation {
  id: string;
  name: string;
  workerName: string;
  batteryStatus: number; // e.g. 94%
  solarGeneration: number; // e.g. 150W
  waterFiltration?: number; // Liters filtered/used today
  status: "Online" | "Offline" | "Maintenance";
  currentBookingsCount: number;
  revenueToday: number;
}

export interface ServiceRequest {
  id: string;
  type: "Water" | "Power" | "Roads" | "Waste" | "General";
  title: string;
  description: string;
  status: "Open" | "In-Progress" | "Resolved";
  createdAt: string;
}

export interface AiLog {
  id: string;
  timestamp: string;
  request: string;
  response: string;
  language: string;
  modelUsed: string;
}

export interface Analytics {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  group: "Daily" | "Weekly" | "Monthly";
  timestamp: string;
}

export interface Feedback {
  id: string;
  userName: string;
  email: string;
  message: string;
  rating: number;
  serviceBranch: string;
  timestamp: string;
}

export interface Report {
  id: string;
  title: string;
  type: "Finance" | "Emergency" | "Transit" | "Citizen";
  fileUrl: string;
  generatedAt: string;
  size: string;
}

export interface CityEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  host: string;
  attendance: number;
}
