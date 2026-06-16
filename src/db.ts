import {
  User, Role, Route, Vehicle, Driver, Schedule, Terminal, Ticket, TicketScan,
  Payment, Announcement, Notification, TaxiStation, TaxiDriver, TourismSite,
  TourismCategory, Hotel, HotelBooking, Restaurant, FoodOrder, Hospital,
  Pharmacy, EmergencyRequest, EcoShineLocation, ServiceRequest, AiLog,
  Analytics, Feedback, Report, CityEvent
} from "./types";
import { 
  collection as fsCollection, 
  onSnapshot as fsOnSnapshot, 
  setDoc as fsSetDoc, 
  doc as fsDoc,
  deleteDoc as fsDeleteDoc,
  updateDoc as fsUpdateDoc,
  getDocFromServer
} from "firebase/firestore";
import { firestore } from "./firebase";

type Listener = (data: any[]) => void;

class SmartCityDB {
  private listeners: { [collectionName: string]: Listener[] } = {};
  private firestoreListeners: { [collectionName: string]: () => void } = {};

  // Core fallback mock databases when direct localStorage does not exist
  constructor() {
    this.initDatabase();
    this.testConnection();
  }

  private async testConnection() {
    try {
      await getDocFromServer(fsDoc(firestore, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. Firestore client is offline.");
      }
    }
  }

  private initDatabase() {
    // 1. Roles
    this.ensureCollection("roles", [
      { id: "admin", name: "Super Admin", permissions: ["all"] },
      { id: "driver", name: "Transport Driver", permissions: ["drive", "view_schedules"] },
      { id: "validator", name: "Ticket Validator", permissions: ["validate_qr"] },
      { id: "tourist", name: "Visitor / Tourist", permissions: ["view_sites", "book_hotel"] },
      { id: "citizen", name: "Registered Citizen", permissions: ["emergencies", "view_services"] }
    ]);

    // 2. Users
    this.ensureCollection("users", [
      { id: "usr_1", name: "Admin Haile", email: "admin@hawassa.gov.et", phone: "+251911223344", roleId: "admin", status: "Active", createdAt: "2026-01-10T10:00:00Z" },
      { id: "usr_2", name: "Abebe Kebede", email: "abebe@cbedriver.com", phone: "+251912445566", roleId: "driver", status: "Active", createdAt: "2026-02-14T08:30:00Z" },
      { id: "usr_3", name: "Kassa Sida", email: "kassa@sidama.org", phone: "+251915998877", roleId: "validator", status: "Active", createdAt: "2026-03-01T12:00:00Z" },
      { id: "usr_5", name: "Mark Peterson", email: "mark@travels.com", phone: "+14159876543", roleId: "tourist", status: "Active", createdAt: "2026-06-15T09:12:00Z" }
    ]);

    // 3. Routes (Terminal Dashboard - Phase 3)
    this.ensureCollection("routes", [
      { id: "rt_1", origin: "Hawassa", destination: "Aleta Wondo", distance: "65 km", estimatedTime: "1 hr 15 min", price: 120, active: true, code: "HW-AW" },
      { id: "rt_2", origin: "Hawassa", destination: "Bensa", distance: "154 km", estimatedTime: "3 hr 10 min", price: 310, active: true, code: "HW-BS" },
      { id: "rt_3", origin: "Hawassa", destination: "Bona", distance: "112 km", estimatedTime: "2 hr 20 min", price: 230, active: true, code: "HW-BN" },
      { id: "rt_4", origin: "Hawassa", destination: "Hager Selam", distance: "92 km", estimatedTime: "1 hr 55 min", price: 180, active: true, code: "HW-HS" },
      { id: "rt_5", origin: "Hawassa", destination: "Yirgalem", distance: "40 km", estimatedTime: "45 min", price: 80, active: true, code: "HW-YG" },
      { id: "rt_6", origin: "Hawassa", destination: "Bursa", distance: "82 km", estimatedTime: "1 hr 40 min", price: 150, active: true, code: "HW-BR" }
    ]);

    // 4. Vehicles
    this.ensureCollection("vehicles", [
      { id: "vh_1", plateNumber: "AA-3-B45091", model: "Toyota Coaster", type: "Coaster Bus", capacity: 30, status: "Available", driverId: "usr_2" },
      { id: "vh_2", plateNumber: "ET-3-A98421", model: "Toyota Hiace", type: "Minibus", capacity: 15, status: "Scheduled", driverId: "usr_2" },
      { id: "vh_3", plateNumber: "HA-3-D09112", model: "Lada Sedan", type: "Lada Taxi", capacity: 4, status: "Available", driverId: "usr_2" },
      { id: "vh_4", plateNumber: "HA-2-T88102", model: "TVS King", type: "Bajaj", capacity: 3, status: "Available", driverId: "usr_2" }
    ]);

    // 5. Drivers
    this.ensureCollection("drivers", [
      { id: "drv_1", name: "Abebe Kebede", phone: "+251912445566", licenseNumber: "L-ET-50491", status: "Active", rating: 4.8 },
      { id: "drv_2", name: "Tariku Sida", phone: "+251911403020", licenseNumber: "L-ET-11042", status: "Active", rating: 4.9 },
      { id: "drv_3", name: "Tamirat Demisse", phone: "+251922558811", licenseNumber: "L-ET-98214", status: "Active", rating: 4.6 }
    ]);

    // 6. Schedules
    this.ensureCollection("schedules", [
      { id: "sch_1", routeId: "rt_1", routeCode: "HW-AW", routeLabel: "Hawassa → Aleta Wondo", vehicleId: "vh_1", vehiclePlate: "AA-3-B45091", departureTime: "08:30 AM", arrivalTime: "09:45 AM", price: 120, availableSeats: 21, status: "Boarding", driverName: "Abebe Kebede" },
      { id: "sch_2", routeId: "rt_2", routeCode: "HW-BS", routeLabel: "Hawassa → Bensa", vehicleId: "vh_2", vehiclePlate: "ET-3-A98421", departureTime: "11:00 AM", arrivalTime: "02:10 PM", price: 310, availableSeats: 8, status: "Pending", driverName: "Tariku Sida" },
      { id: "sch_3", routeId: "rt_5", routeCode: "HW-YG", routeLabel: "Hawassa → Yirgalem", vehicleId: "vh_1", vehiclePlate: "AA-3-B45091", departureTime: "02:00 PM", arrivalTime: "02:45 PM", price: 80, availableSeats: 30, status: "Pending", driverName: "Tamirat Demisse" }
    ]);

    // 7. Terminals
    this.ensureCollection("terminals", [
      { id: "term_1", name: "Main Hawassa Transit Hub", location: "City Center, Hawassa", activeRoutesCount: 6 },
      { id: "term_2", name: "North Bus Station", location: "Sidaama Cultural Area Road", activeRoutesCount: 3 }
    ]);

    // 8. Tickets
    this.ensureCollection("tickets", [
      { id: "tkt_1", scheduleId: "sch_1", passengerName: "Dereje Solomon", passengerPhone: "+251910443322", seatNumber: 12, price: 120, status: "Paid", paymentMethod: "Telebirr", qrCode: "QR_SCH1_SEAT12_TKT01", ticketNumber: "TKT-2026-001", bookingTime: "2026-06-16T10:00:00Z", routeLabel: "Hawassa → Aleta Wondo", departureTime: "08:30 AM" },
      { id: "tkt_2", scheduleId: "sch_1", passengerName: "Helen Taye", passengerPhone: "+251911990088", seatNumber: 13, price: 120, status: "Validated", paymentMethod: "CBE Birr", qrCode: "QR_SCH1_SEAT13_TKT02", ticketNumber: "TKT-2026-002", bookingTime: "2026-06-16T10:05:00Z", routeLabel: "Hawassa → Aleta Wondo", departureTime: "08:30 AM" }
    ]);

    // 9. Ticket Scans
    this.ensureCollection("ticket_scans", [
      { id: "scan_1", ticketId: "tkt_2", scanTime: "2026-06-16T08:15:00Z", scannedBy: "usr_3", result: "Success" }
    ]);

    // 10. Payments
    this.ensureCollection("payments", [
      { id: "pay_1", amount: 120, currency: "ETB", method: "Telebirr", reference: "TLB-7741029", status: "Completed", timestamp: "2026-06-16T10:00:00Z", type: "Transportation", payerName: "Dereje Solomon" },
      { id: "pay_2", amount: 120, currency: "ETB", method: "CBE Birr", reference: "CBE-9941102", status: "Completed", timestamp: "2026-06-16T10:05:00Z", type: "Transportation", payerName: "Helen Taye" },
      { id: "pay_3", amount: 450, currency: "ETB", method: "Telebirr", reference: "TLB-0041221", status: "Completed", timestamp: "2026-06-16T12:00:00Z", type: "Taxi", payerName: "Mark Peterson" },
      { id: "pay_4", amount: 2400, currency: "ETB", method: "Bank Transfer", reference: "CBO-4155102", status: "Completed", timestamp: "2026-06-15T18:00:00Z", type: "Hotel", payerName: "Mark Peterson" }
    ]);

    // 11. Announcements
    this.ensureCollection("announcements", [
      { id: "ann_1", title: "Heavy Rain Warning - Hawassa Lake Area", content: "Sidaama Region meteorology department warns of dense rains. Drivers on Hager Selam and Bensa roads please utilize maximum fog illumination.", author: "Admin Haile", date: "2026-06-16", category: "Emergency" },
      { id: "ann_2", title: "Smart Shoe-Shining Terminal Rollout", content: "We have fully validated six solar-powered Eco Shine shoe-shine stations near Hawassa Lake Promenade. Mobile credit booking active.", author: "Municipal Office", date: "2026-06-15", category: "General" }
    ]);

    // 12. Notifications
    this.ensureCollection("notifications", [
      { id: "notif_1", title: "SOS Alert Dispatched", message: "Ambulance #3 and Police patrol #12 deployed to Lake Hawassa beach road.", category: "Emergency", isRead: false, timestamp: "2026-06-16T14:30:00Z" },
      { id: "notif_2", title: "Verba Tour Guide Booking Status", message: "Tourist Mark Peterson reserved Guide Tariku.", category: "Tourism", isRead: true, timestamp: "2026-06-16T12:10:00Z" }
    ]);

    // 13. Taxi Stations
    this.ensureCollection("taxi_stations", [
      { id: "station_1", name: "Piazza Central Taxi Platform", location: "Central Piazza, Hawassa", description: "Main taxi point in downtown area", capacity: 20, currentTaxis: 8 },
      { id: "station_2", name: "Lake Basin Promenade Dock", location: "Lake Hawassa shore road", description: "Lada Taxis & Bajajs for leisure parks", capacity: 15, currentTaxis: 5 }
    ]);

    // 14. Taxi Drivers
    this.ensureCollection("taxi_drivers", [
      { id: "tdrv_1", name: "Mohammed Jemal", phone: "+251910901234", taxiId: "vh_3", plateNumber: "HA-3-D09112", liveLatitude: 7.0505, liveLongitude: 38.4812, active: true, fareRate: 60, rating: 4.7 },
      { id: "tdrv_2", name: "Estifanos Sida", phone: "+251920885544", taxiId: "vh_4", plateNumber: "HA-2-T88102", liveLatitude: 7.0612, liveLongitude: 38.4754, active: true, fareRate: 35, rating: 4.9 },
      { id: "tdrv_3", name: "Tesfaye Gizaw", phone: "+251930776611", taxiId: "vh_5", plateNumber: "HA-3-C40921", liveLatitude: 7.0422, liveLongitude: 38.4950, active: false, fareRate: 55, rating: 4.4 }
    ]);

    // 15. Tourism Sites (Phase 5)
    this.ensureCollection("tourism_sites", [
      { id: "site_1", name: "Amora Gedel Bird Sanctum", category: "Nature", description: "Lush regional park located on the shore of Lake Hawassa, famous for pelican/stork assemblies, majestic colobus monkeys, and high tourist footfall.", photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", history: "Emerged historically during regional municipality creation as an environmental protective zone.", coords: { x: 30, y: 40 }, views: 1840, rating: 4.8 },
      { id: "site_2", name: "Tabor Hill Sunset Point", category: "Monuments", description: "Stunning topographic overlook. Offers breathtaking 360-degree panoramic skyline views of entire Hawassa city and Lake sunset curves.", photoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400", videoUrl: "https://www.w3schools.com/html/movie.mp4", history: "Sidaamu Elders hold historical spiritual gatherings around Tabor mountain peaks.", coords: { x: 74, y: 35 }, views: 2450, rating: 4.9 },
      { id: "site_3", name: "Lake Hawassa Promenade", category: "Nature", description: "Beautiful pedestrian coastal walkway ideal for fish dining, fresh tilapias, evening strolls, and boat tours.", photoUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", history: "Developed recently to upgrade city shoreline recreation.", coords: { x: 22, y: 65 }, views: 3200, rating: 4.7 }
    ]);

    // 16. Tourism Categories
    this.ensureCollection("tourism_categories", [
      { id: "cat_1", name: "Nature & Wildlife", iconName: "Trees" },
      { id: "cat_2", name: "Mountain Hiking", iconName: "Mountain" },
      { id: "cat_3", name: "Cultural Halls", iconName: "Building2" }
    ]);

    // 17. Hotels (Phase 6)
    this.ensureCollection("hotels", [
      { id: "hotel_1", name: "Haile Resort Hawassa", rooms: [{ type: "Deluxe Lake View", price: 3200, count: 12, available: 5 }, { type: "Standard Suite", price: 2100, count: 20, available: 14 }], amenities: ["Lakefront Pool", "Sidaama Cultural Bar", "Gym", "High-speed Wi-Fi"], contact: "+251462210000", verified: true, coords: { x: 18, y: 78 }, rating: 5.0, photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400" },
      { id: "hotel_2", name: "Ker Awud Premium Hotel", rooms: [{ type: "Executive Suite", price: 2800, count: 8, available: 4 }, { type: "Double Room", price: 1600, count: 15, available: 11 }], amenities: ["Modern Spa", "Traditional Coffee Lounge", "Conference Center"], contact: "+251462208040", verified: true, coords: { x: 45, y: 60 }, rating: 4.7, photoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400" }
    ]);

    // 18. Hotel Bookings
    this.ensureCollection("hotel_bookings", [
      { id: "bk_1", hotelId: "hotel_1", hotelName: "Haile Resort Hawassa", guestName: "Mark Peterson", guestPhone: "+14159876543", roomType: "Deluxe Lake View", checkIn: "2026-06-16", checkOut: "2026-06-19", totalPaid: 9600, status: "Scheduled", paymentReference: "TLB-9988224" }
    ]);

    // 19. Restaurants (Phase 9)
    this.ensureCollection("restaurants", [
      { id: "rest_1", name: "Fish Market Harbor Kitchen", cuisines: ["Traditional Tilapia", "Sidaama Kitfo", "Fresh Nile Perch"], rating: 4.8, logo: "Fish", location: "Lake Shore Area, Hawassa", coords: { x: 27, y: 55 } },
      { id: "rest_2", name: "Sidaama Pride Dine", cuisines: ["Qocho & Kitfo Special", "Ethiopian Coffee", "Injera Tibs"], rating: 4.9, logo: "Utensils", location: "Near Cultural Center, Hawassa", coords: { x: 50, y: 45 } }
    ]);

    // 20. Food Orders
    this.ensureCollection("food_orders", [
      { id: "order_1", restaurantId: "rest_1", restaurantName: "Fish Market Harbor Kitchen", customerName: "Elias Kassa", customerPhone: "+251912883399", items: [{ name: "Whole Fried Tilapia", price: 350, quantity: 2 }], total: 700, status: "Preparing", riderName: "Yonas Bensa", deliveryAddress: "Yirgalem Road Villa #12", timestamp: "2026-06-16T14:15:00Z" }
    ]);

    // 21. Hospitals (Phase 8)
    this.ensureCollection("hospitals", [
      { id: "hosp_1", name: "Hawassa University Referral Hospital", contact: "+251462205511", emergencyNumber: "912", doctorsCount: 140, coords: { x: 55, y: 25 } },
      { id: "hosp_2", name: "Adare General Hospital", contact: "+251462110420", emergencyNumber: "931", doctorsCount: 65, coords: { x: 38, y: 35 } }
    ]);

    // 22. Pharmacies (Phase 7)
    this.ensureCollection("pharmacies", [
      { id: "pharm_1", name: "Sidaama Red Cross Pharmacy", medicineCount: 1240, coords: { x: 42, y: 48 }, contact: "+251462201112", open24h: true },
      { id: "pharm_2", name: "Abyssinia 24-7 Pharmacy", medicineCount: 850, coords: { x: 62, y: 52 }, contact: "+251462208811", open24h: false }
    ]);

    // 23. Emergency Requests (Phase 11)
    this.ensureCollection("emergency_requests", [
      { id: "em_1", type: "Ambulance", reporterName: "Taye Bekele", reporterPhone: "+251911400299", gpsLocation: "7.0489 N, 38.4815 E", coords: { x: 28, y: 43 }, description: "Pedestrian slippery injury near Promenade dock on lakefront.", status: "Dispatched", time: "2026-06-16T14:28:00Z" },
      { id: "em_2", type: "Fire", reporterName: "Mesfin Girma", reporterPhone: "+251920811900", gpsLocation: "7.0542 N, 38.4901 E", coords: { x: 60, y: 58 }, description: "Minor kitchen smoke alert at residential complex.", status: "Resolved", time: "2026-06-16T11:00:00Z" }
    ]);

    // 24. Eco Shine Locations (Phase 10)
    this.ensureCollection("eco_shine_locations", [
      { id: "shine_1", name: "Station Alpha - Main Terminal Hub", workerName: "Kasahun Bensa", batteryStatus: 94, solarGeneration: 165, status: "Online", currentBookingsCount: 3, revenueToday: 350 },
      { id: "shine_2", name: "Station Beta - Promenade Coastal Road", workerName: "Dinkesa Sida", batteryStatus: 82, solarGeneration: 120, status: "Online", currentBookingsCount: 1, revenueToday: 180 },
      { id: "shine_3", name: "Station Gamma - Piazza Square Side", workerName: "Girma Awassa", batteryStatus: 45, solarGeneration: 0, status: "Offline", currentBookingsCount: 0, revenueToday: 0 }
    ]);

    // 25. Service Requests
    this.ensureCollection("service_requests", [
      { id: "req_1", type: "Power", title: "Voltage Fluctuation Plaza Area", description: "City electricity meters registering periodic sags on South terminal feeders.", status: "In-Progress", createdAt: "2026-06-16T08:00:00Z" }
    ]);

    // 26. AI Logs
    this.ensureCollection("ai_logs", [
      { id: "ai_1", timestamp: "2026-06-16T14:40:00Z", request: "What is current average bus schedule waiting time?", response: "Average passenger schedule waiting time is currently reduced by 14.5% due to dynamic vehicle re-allocations.", language: "English", modelUsed: "gemini-3.5-flash" }
    ]);

    // 27. Analytics
    this.ensureCollection("analytics", [
      { id: "an_1", metricName: "Total City Revenue", value: 14850, unit: "ETB", group: "Daily", timestamp: "2026-06-16T00:00:00Z" },
      { id: "an_2", metricName: "Active Transit Passengers", value: 450, unit: "Pax", group: "Daily", timestamp: "2026-06-16T00:00:00Z" },
      { id: "an_3", metricName: "Emergency Response Sprints", value: 12, unit: "incidents", group: "Weekly", timestamp: "2026-06-16T00:00:00Z" }
    ]);

    // 28. Feedback
    this.ensureCollection("feedback", [
      { id: "fb_1", userName: "Thomas Richardson", email: "thomas@gmail.com", message: "Love the CBE Birr payment verification system, extremely quick", rating: 5, serviceBranch: "Payments", timestamp: "2026-06-16T13:00:00Z" }
    ]);

    // 29. Reports
    this.ensureCollection("reports", [
      { id: "rep_1", title: "Daily Transport Logistics Matrix", type: "Transit", fileUrl: "#", generatedAt: "2026-06-16T12:00:00Z", size: "45 KB" },
      { id: "rep_2", title: "Sidaama Municipal Financial Statement", type: "Finance", fileUrl: "#", generatedAt: "2026-06-15T23:59:00Z", size: "128 KB" }
    ]);

    // 30. City Events
    this.ensureCollection("city_events", [
      { id: "evt_1", name: "Sidaama Fichee-Chambalaalla Flower Fest", date: "2026-06-25", description: "Annual world heritage celebration of the Sidaama new year in Hawassa.", host: "Sidaama Region Bureau of Culture", attendance: 25000 }
    ]);
  }

  // Ensures collection exists in localStorage; otherwise, writes initial layout
  private ensureCollection(name: string, defaultData: any[]) {
    try {
      if (!localStorage.getItem(`sc_col_${name}`)) {
        localStorage.setItem(`sc_col_${name}`, JSON.stringify(defaultData));
      }
    } catch (e) {
      console.warn(`LocalStorage sandbox error while saving collection [${name}]:`, e);
    }
  }

  // PubSub - Publish changes to all active listeners in UI for real-time responsiveness
  private publish(collection: string, data: any[]) {
    if (this.listeners[collection]) {
      this.listeners[collection].forEach(callback => callback(data));
    }
  }

  // SUBSCRIBE to collection - core mechanism for real-time streams
  public subscribe(collection: string, callback: Listener): () => void {
    if (!this.listeners[collection]) {
      this.listeners[collection] = [];
    }
    this.listeners[collection].push(callback);

    // Prompts initial execution
    callback(this.getCollection(collection));

    // Firestore Integration: Connect directly to Firestore for real-time synchronization
    const syncCollections = [
      "routes", "vehicles", "drivers", "schedules", "tickets", "payments", 
      "tourism_sites", "hospitals", "pharmacies", "emergency_requests", 
      "eco_shine_locations", "taxi_drivers", "taxi_queue", "notifications", "reports"
    ];

    if (syncCollections.includes(collection)) {
      if (!this.firestoreListeners[collection]) {
        try {
          const colRef = fsCollection(firestore, collection);
          const unsubFs = fsOnSnapshot(colRef, (snapshot) => {
            const fsData: any[] = [];
            snapshot.forEach((snap) => {
              fsData.push({ id: snap.id, ...snap.data() });
            });
            
            // If documents exist, override local simulation cache and publish change
            if (fsData.length > 0) {
              localStorage.setItem(`sc_col_${collection}`, JSON.stringify(fsData));
              this.publish(collection, fsData);
            }
          }, (err) => {
            console.error(`Firestore snapshot error on ${collection}, continuing with local caching:`, err);
          });
          this.firestoreListeners[collection] = unsubFs;
        } catch (error) {
          console.error(`Failed to bind Firestore listener for ${collection}:`, error);
        }
      }
    }

    // Return unsubscribe function
    return () => {
      this.listeners[collection] = this.listeners[collection].filter(cb => cb !== callback);
      // Clean up Firestore listener if no UI listeners remain
      if (this.listeners[collection].length === 0 && this.firestoreListeners[collection]) {
        this.firestoreListeners[collection]();
        delete this.firestoreListeners[collection];
      }
    };
  }

  // READ (All docs)
  public getCollection(collection: string): any[] {
    try {
      const dataStr = localStorage.getItem(`sc_col_${collection}`);
      return dataStr ? JSON.parse(dataStr) : [];
    } catch (e) {
      console.error(`Read failure on Firestore-simulated collection ${collection}:`, e);
      return [];
    }
  }

  // CREATE (or AddDoc)
  public addDoc(collection: string, doc: any): any {
    const data = this.getCollection(collection);
    const docId = doc.id || `${collection.slice(0, 3)}_${Math.random().toString(36).substr(2, 9)}`;
    const newDoc = {
      id: docId,
      createdAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    
    try {
      localStorage.setItem(`sc_col_${collection}`, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }

    this.publish(collection, data);

    // Push live to Firestore in real-time
    const syncCollections = [
      "routes", "vehicles", "drivers", "schedules", "tickets", "payments", 
      "tourism_sites", "hospitals", "pharmacies", "emergency_requests", 
      "eco_shine_locations", "taxi_drivers", "taxi_queue", "notifications", "reports"
    ];
    if (syncCollections.includes(collection)) {
      try {
        const docRef = fsDoc(firestore, collection, docId);
        fsSetDoc(docRef, newDoc).catch(err => {
          console.error(`Firestore async write error on ${collection}:`, err);
        });
      } catch (err) {
        console.error(`Firestore write failure on ${collection}:`, err);
      }
    }

    return newDoc;
  }

  // UPDATE (or updateDoc)
  public updateDoc(collection: string, id: string, updates: any): boolean {
    const data = this.getCollection(collection);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return false;

    data[index] = { ...data[index], ...updates };
    
    try {
      localStorage.setItem(`sc_col_${collection}`, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }

    this.publish(collection, data);

    // Live update to Firestore
    const syncCollections = [
      "routes", "vehicles", "drivers", "schedules", "tickets", "payments", 
      "tourism_sites", "hospitals", "pharmacies", "emergency_requests", 
      "eco_shine_locations", "taxi_drivers", "taxi_queue", "notifications", "reports"
    ];
    if (syncCollections.includes(collection)) {
      try {
        const docRef = fsDoc(firestore, collection, id);
        fsUpdateDoc(docRef, updates).catch(err => {
          console.error(`Firestore async update error on ${collection}:`, err);
        });
      } catch (err) {
        console.error(`Firestore update failure on ${collection}:`, err);
      }
    }

    return true;
  }

  // DELETE (or deleteDoc)
  public deleteDoc(collection: string, id: string): boolean {
    const data = this.getCollection(collection);
    const filtered = data.filter(item => item.id !== id);
    if (data.length === filtered.length) return false;

    try {
      localStorage.setItem(`sc_col_${collection}`, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }

    this.publish(collection, filtered);

    // Live delete from Firestore
    const syncCollections = [
      "routes", "vehicles", "drivers", "schedules", "tickets", "payments", 
      "tourism_sites", "hospitals", "pharmacies", "emergency_requests", 
      "eco_shine_locations", "taxi_drivers", "taxi_queue", "notifications", "reports"
    ];
    if (syncCollections.includes(collection)) {
      try {
        const docRef = fsDoc(firestore, collection, id);
        fsDeleteDoc(docRef).catch(err => {
          console.error(`Firestore async delete error on ${collection}:`, err);
        });
      } catch (err) {
        console.error(`Firestore delete failure on ${collection}:`, err);
      }
    }

    return true;
  }
}

export const db = new SmartCityDB();
