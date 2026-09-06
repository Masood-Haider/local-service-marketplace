// scripts/seed.js - Standalone Node ESM script to populate Firestore with sample data
import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBHaXG_0I36k_j7nhfoD-CEh2-Lmk4-i0E",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "local-services-1f8fb.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "local-services-1f8fb",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "local-services-1f8fb.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109107015678",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:109107015678:web:8877b75ab3e1bc4a2b5aaf",
}

console.log("🚀 Initializing Firebase connection for project:", firebaseConfig.projectId)
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const SAMPLE_PROVIDERS = [
  {
    uid: "prov_marcus_vance",
    name: "Marcus Vance",
    category: "Plumbing",
    bio: "Master licensed plumber with 14+ years of residential and commercial experience. Specializing in leak detection, tankless water heaters, pipe repiping, and emergency burst repairs. 24/7 on-call availability.",
    priceRange: "$75 - $130 / hr",
    serviceArea: "Greater Metropolitan Area & Suburbs",
    avgRating: 4.9,
    totalReviews: 48,
    photoURL: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 234-5678",
    email: "marcus.plumbing@example.com",
  },
  {
    uid: "prov_elena_rostova",
    name: "Elena Rostova",
    category: "Electrical",
    bio: "Certified master electrician specializing in home automation, smart electrical panels, EV charging station installations, and architectural lighting design. Safety guaranteed with full liability coverage.",
    priceRange: "$85 - $140 / hr",
    serviceArea: "Central City, North Hills & Westside",
    avgRating: 5.0,
    totalReviews: 62,
    photoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 345-6789",
    email: "elena.electrical@example.com",
  },
  {
    uid: "prov_sarah_jenkins",
    name: "Sarah Jenkins",
    category: "Cleaning",
    bio: "Founder of SparkleClean Eco. We provide non-toxic, hypoallergenic deep cleans, move-in/move-out sanitation, and regular bi-weekly upkeep. Equipped with HEPA air filters and sustainable botanical supplies.",
    priceRange: "$45 - $80 / hr",
    serviceArea: "Downtown, Eastside & South County",
    avgRating: 4.8,
    totalReviews: 89,
    photoURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 456-7890",
    email: "sarah.sparkleclean@example.com",
  },
  {
    uid: "prov_david_chen",
    name: "David Chen, M.Sc.",
    category: "Tutoring",
    bio: "Former university mathematics instructor with 9 years of tutoring high school AP Calculus, Physics, SAT Math prep, and college-level linear algebra. 98% of students achieve grade improvement within 6 weeks.",
    priceRange: "$60 - $95 / hr",
    serviceArea: "Metro Area (In-person & Virtual)",
    avgRating: 5.0,
    totalReviews: 37,
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 567-8901",
    email: "david.chen.tutor@example.com",
  },
  {
    uid: "prov_derrick_miller",
    name: "Derrick Miller",
    category: "HVAC",
    bio: "EPA Universal certified HVAC technician with 12 years keeping homes comfortable in scorching summers and freezing winters. Heat pumps, ductless mini-splits, furnace repair, and annual tune-ups.",
    priceRange: "$80 - $135 / hr",
    serviceArea: "All Metro Districts & Tri-County",
    avgRating: 4.9,
    totalReviews: 54,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 678-9012",
    email: "derrick.hvac@example.com",
  },
  {
    uid: "prov_julian_thorne",
    name: "Julian Thorne",
    category: "Carpentry",
    bio: "Artisan woodworker and finish carpenter. Custom floating shelves, coffered ceilings, walk-in closets, kitchen cabinetry refacing, and bespoke outdoor pergolas built to heirloom standards.",
    priceRange: "$70 - $120 / hr",
    serviceArea: "North County & Surrounding Cities",
    avgRating: 4.9,
    totalReviews: 29,
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 789-0123",
    email: "julian.woodworks@example.com",
  },
  {
    uid: "prov_sofia_ramirez",
    name: "Sofia Ramirez",
    category: "Painting",
    bio: "Precision residential interior & exterior painter. Clean lines, meticulous drywall prep, zero-VOC premium paints. We treat every home with utmost respect.",
    priceRange: "$50 - $90 / hr",
    serviceArea: "Metropolitan Area & Suburbs",
    avgRating: 4.8,
    totalReviews: 41,
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 890-1234",
    email: "sofia.palette@example.com",
  },
  {
    uid: "prov_jackson_moving",
    name: "Jackson & Sons Moving",
    category: "Moving",
    bio: "Reliable, bonded, and insured moving crews with 26ft lift-gate trucks. Full-service packing, fragile item wrapping, disassembling/reassembling furniture.",
    priceRange: "$95 - $160 / hr",
    serviceArea: "Statewide & Intercity Relocation",
    avgRating: 4.7,
    totalReviews: 73,
    photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 901-2345",
    email: "info.jacksonmoving@example.com",
  },
  {
    uid: "prov_greg_sullivan",
    name: "Greg Sullivan",
    category: "Handyman",
    bio: "Jack-of-all-trades with over 20 years handling household to-do lists. Drywall patches, TV mounting, door alignment, faucet replacement, light fixtures, and smart locks.",
    priceRange: "$55 - $85 / hr",
    serviceArea: "East Bay, Southside & Central",
    avgRating: 4.9,
    totalReviews: 83,
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 012-3456",
    email: "greg.handyman@example.com",
  },
  {
    uid: "prov_chloe_green",
    name: "Chloe Green",
    category: "Landscaping",
    bio: "Sustainable landscape design and lawn care specialist. Drip irrigation retrofits, drought-tolerant xeriscaping, seasonal aeration, pruning, and sod installation.",
    priceRange: "$60 - $105 / hr",
    serviceArea: "Suburban Valley & Hillside",
    avgRating: 4.9,
    totalReviews: 35,
    photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 123-4567",
    email: "chloe.verdant@example.com",
  },
  {
    uid: "prov_robert_sterling",
    name: "Robert Sterling",
    category: "Roofing",
    bio: "Certified residential roofing contractor. Asphalt shingle repairs, storm damage inspections, gutter replacement, flashing repairs, and complete re-roofing.",
    priceRange: "$90 - $150 / hr",
    serviceArea: "Greater Metro & Foothills",
    avgRating: 4.8,
    totalReviews: 31,
    photoURL: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 234-9876",
    email: "robert.summitroof@example.com",
  },
  {
    uid: "prov_liam_gallagher",
    name: "Liam Gallagher",
    category: "Pest Control",
    bio: "State-licensed pest control operator. Child and pet-safe treatments for termites, rodents, wasps, ants, and bed bugs. Thorough property barrier seals.",
    priceRange: "$70 - $115 / hr",
    serviceArea: "Central County & Suburbs",
    avgRating: 5.0,
    totalReviews: 26,
    photoURL: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 345-0987",
    email: "liam.guardian@example.com",
  },
]

async function runSeed() {
  console.log(`📦 Seeding ${SAMPLE_PROVIDERS.length} providers and matching users...`)
  for (const prov of SAMPLE_PROVIDERS) {
    await setDoc(doc(db, "providers", prov.uid), {
      ...prov,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true })

    await setDoc(doc(db, "users", prov.uid), {
      uid: prov.uid,
      name: prov.name,
      email: prov.email,
      role: "provider",
      photoURL: prov.photoURL,
      createdAt: serverTimestamp(),
    }, { merge: true })
  }

  console.log("👤 Seeding sample customers...")
  const customers = [
    { uid: "cust_sarah_connor", name: "Sarah Connor", email: "sarah.connor@example.com", role: "customer" },
    { uid: "cust_michael_chang", name: "Michael Chang", email: "michael.chang@example.com", role: "customer" },
    { uid: "cust_emily_watson", name: "Emily Watson", email: "emily.watson@example.com", role: "customer" },
  ]
  for (const cust of customers) {
    await setDoc(doc(db, "users", cust.uid), { ...cust, createdAt: serverTimestamp() }, { merge: true })
  }

  console.log("📋 Seeding sample jobs & quotes...")
  const jobs = [
    {
      id: "job_ev_charger_install",
      customerId: "cust_sarah_connor",
      customerName: "Sarah Connor",
      customerEmail: "sarah.connor@example.com",
      title: "Level 2 EV Wallbox Charger Installation in Garage",
      category: "Electrical",
      description: "Dedicated 50A circuit with 240V NEMA 14-50 outlet for Tesla wall charger. Panel is 20 feet away.",
      budget: "$450 - $700",
      preferredDate: "2026-09-15",
      location: "1428 Elm Ridge, Westside District",
      status: "open",
    },
    {
      id: "job_pipe_burst_kitchen",
      customerId: "cust_michael_chang",
      customerName: "Michael Chang",
      customerEmail: "michael.chang@example.com",
      title: "Kitchen Sink Under-Cabinet Pipe Leak & Valve Repair",
      category: "Plumbing",
      description: "Corroded shutoff valve dripping into baseboard. Needs copper cut and quarter-turn ball valve replacement.",
      budget: "$200 - $350",
      preferredDate: "2026-09-12",
      location: "88 Orchid Blvd, Downtown Highrise",
      status: "booked",
      acceptedQuoteId: "quote_marcus_vance_pipe",
      acceptedProviderId: "prov_marcus_vance",
      bookedPrice: "$260",
      scheduledDate: "2026-09-12",
      scheduledTime: "10:00 AM - 12:00 PM",
    },
    {
      id: "job_deep_clean_moveout",
      customerId: "cust_emily_watson",
      customerName: "Emily Watson",
      customerEmail: "emily.watson@example.com",
      title: "3-Bedroom 2-Bath Move-Out Deep Clean",
      category: "Cleaning",
      description: "Full move-out deep clean: oven, fridge scrub, baseboards, window tracks, and bathroom tile grout.",
      budget: "$300 - $480",
      preferredDate: "2026-09-10",
      location: "340 Pinecrest Terrace, North Hills",
      status: "completed",
    },
  ]

  for (const j of jobs) {
    await setDoc(doc(db, "jobs", j.id), { ...j, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true })
  }

  // Quote subcollection
  await setDoc(doc(db, "jobs", "job_ev_charger_install", "quotes", "quote_elena_ev"), {
    id: "quote_elena_ev",
    jobId: "job_ev_charger_install",
    providerId: "prov_elena_rostova",
    providerName: "Elena Rostova",
    price: "$520",
    message: "Includes copper conduit, 50A breaker, load calculations, and inspection permit.",
    status: "pending",
    createdAt: serverTimestamp(),
  }, { merge: true })

  console.log("📅 Seeding sample bookings & reviews...")
  const bookings = [
    {
      id: "book_plumbing_michael",
      jobId: "job_pipe_burst_kitchen",
      jobTitle: "Kitchen Sink Under-Cabinet Pipe Leak & Valve Repair",
      category: "Plumbing",
      customerId: "cust_michael_chang",
      customerName: "Michael Chang",
      customerEmail: "michael.chang@example.com",
      providerId: "prov_marcus_vance",
      providerName: "Marcus Vance",
      price: "$260",
      scheduledDate: "2026-09-12",
      scheduledTime: "10:00 AM - 12:00 PM",
      location: "88 Orchid Blvd, Downtown Highrise",
      status: "confirmed",
    },
    {
      id: "book_cleaning_emily",
      jobId: "job_deep_clean_moveout",
      jobTitle: "3-Bedroom 2-Bath Move-Out Deep Clean",
      category: "Cleaning",
      customerId: "cust_emily_watson",
      customerName: "Emily Watson",
      customerEmail: "emily.watson@example.com",
      providerId: "prov_sarah_jenkins",
      providerName: "Sarah Jenkins",
      price: "$380",
      scheduledDate: "2026-09-02",
      scheduledTime: "09:00 AM - 01:00 PM",
      location: "340 Pinecrest Terrace, North Hills",
      status: "completed",
      hasReviewed: true,
      rating: 5,
      reviewComment: "Sarah and her crew did an extraordinary job! The landlord returned our full deposit with zero deductions.",
    },
  ]

  for (const b of bookings) {
    await setDoc(doc(db, "bookings", b.id), { ...b, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true })
  }

  // Reviews
  await setDoc(doc(db, "reviews", "rev_cleaning_emily"), {
    id: "rev_cleaning_emily",
    bookingId: "book_cleaning_emily",
    jobId: "job_deep_clean_moveout",
    providerId: "prov_sarah_jenkins",
    providerName: "Sarah Jenkins",
    customerId: "cust_emily_watson",
    customerName: "Emily Watson",
    rating: 5,
    comment: "Sarah and her crew did an extraordinary job! The landlord returned our full deposit with zero deductions. Highly recommended!",
    serviceCategory: "Cleaning",
    createdAt: serverTimestamp(),
  }, { merge: true })

  console.log("✅ Seed completed successfully! All demo records created in Firestore.")
}

runSeed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
