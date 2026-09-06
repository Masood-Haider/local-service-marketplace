import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/firebase/config"

export interface SeedProgressCallback {
  (step: string, percent: number): void
}

export const SAMPLE_PROVIDERS = [
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
      "https://images.unsplash.com/photo-1540518614846-7ede433c4b49?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 789-0123",
    email: "julian.woodworks@example.com",
  },
  {
    uid: "prov_sofia_ramirez",
    name: "Sofia Ramirez",
    category: "Painting",
    bio: "Precision residential interior & exterior painter. Clean lines, meticulous drywall prep, zero-VOC Benjamin Moore & Sherwin Williams coatings. We leave every home cleaner than we found it.",
    priceRange: "$50 - $90 / hr",
    serviceArea: "Metropolitan Area & Suburbs",
    avgRating: 4.8,
    totalReviews: 41,
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    portfolioImages: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600",
    ],
    verificationStatus: "approved",
    phone: "+1 (555) 890-1234",
    email: "sofia.palette@example.com",
  },
  {
    uid: "prov_jackson_moving",
    name: "Jackson & Sons Moving",
    category: "Moving",
    bio: "Reliable, bonded, and insured moving crews with 26ft lift-gate trucks. Full-service packing, fragile item wrapping, disassembling/reassembling furniture, and secure storage transfers.",
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
    bio: "Jack-of-all-trades with over 20 years handling household to-do lists. Drywall patches, TV mounting, door alignment, faucet replacement, light fixtures, and smart lock installations.",
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
    bio: "Certified residential roofing contractor. Asphalt shingle repairs, storm damage inspections, gutter replacement, flashing repairs, and complete re-roofing with manufacturer warranties.",
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
    bio: "State-licensed pest control operator. Child and pet-safe treatments for termites, rodents, wasps, ants, and bed bugs. Thorough property barrier seals with guaranteed seasonal protection.",
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

export const SAMPLE_CUSTOMERS = [
  {
    uid: "cust_sarah_connor",
    name: "Sarah Connor",
    email: "sarah.connor@example.com",
    role: "customer",
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
  },
  {
    uid: "cust_michael_chang",
    name: "Michael Chang",
    email: "michael.chang@example.com",
    role: "customer",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
  },
  {
    uid: "cust_emily_watson",
    name: "Emily Watson",
    email: "emily.watson@example.com",
    role: "customer",
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300",
  },
]

/**
 * Seeds Firestore with rich, realistic sample marketplace data.
 */
export async function seedMarketplaceData(onProgress?: SeedProgressCallback): Promise<{
  providersCount: number
  jobsCount: number
  bookingsCount: number
  reviewsCount: number
}> {
  onProgress?.("Seeding provider profiles & user accounts...", 15)

  // 1. Seed Providers and matching User docs
  for (let i = 0; i < SAMPLE_PROVIDERS.length; i++) {
    const prov = SAMPLE_PROVIDERS[i]

    // Create provider document
    const provRef = doc(db, "providers", prov.uid)
    await setDoc(
      provRef,
      {
        ...prov,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    // Create corresponding user document
    const userRef = doc(db, "users", prov.uid)
    await setDoc(
      userRef,
      {
        uid: prov.uid,
        name: prov.name,
        email: prov.email,
        role: "provider",
        photoURL: prov.photoURL,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  onProgress?.("Seeding customer accounts...", 35)

  // 2. Seed Customer User docs
  for (const cust of SAMPLE_CUSTOMERS) {
    const custRef = doc(db, "users", cust.uid)
    await setDoc(
      custRef,
      {
        ...cust,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  onProgress?.("Seeding active & booked jobs...", 55)

  // 3. Seed Sample Jobs (with quotes)
  const sampleJobs = [
    {
      id: "job_ev_charger_install",
      customerId: "cust_sarah_connor",
      customerName: "Sarah Connor",
      customerEmail: "sarah.connor@example.com",
      title: "Level 2 EV Wallbox Charger Installation in Garage",
      category: "Electrical",
      description: "Need a certified electrician to install a 50A dedicated circuit with a 240V NEMA 14-50 outlet for my Tesla Level 2 wall connector. Panel is 20 feet away on the same garage wall.",
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
      description: "Under-sink shutoff valve is corroded and slowly dripping into the basin baseboard. Needs immediate copper line cutoff and quarter-turn ball valve replacement.",
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
      description: "Comprehensive end-of-lease sanitization including oven interior, refrigerator defrost & scrub, baseboards, window sills, and tile grout cleaning.",
      budget: "$300 - $480",
      preferredDate: "2026-09-10",
      location: "340 Pinecrest Terrace, North Hills",
      status: "completed",
    },
  ]

  for (const job of sampleJobs) {
    const jobRef = doc(db, "jobs", job.id)
    await setDoc(
      jobRef,
      {
        ...job,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    // Add sample quotes subcollection
    if (job.id === "job_ev_charger_install") {
      const qRef1 = doc(db, "jobs", job.id, "quotes", "quote_elena_ev")
      await setDoc(qRef1, {
        id: "quote_elena_ev",
        jobId: job.id,
        providerId: "prov_elena_rostova",
        providerName: "Elena Rostova",
        providerPhotoURL: SAMPLE_PROVIDERS[1].photoURL,
        price: "$520",
        message: "Hello Sarah! I have extensive experience with Tesla & universal EV wallboxes. Price includes full copper conduit, 50A breaker, inspection permits, and load testing.",
        status: "pending",
        createdAt: serverTimestamp(),
      })
    }

    if (job.id === "job_pipe_burst_kitchen") {
      const qRef2 = doc(db, "jobs", job.id, "quotes", "quote_marcus_vance_pipe")
      await setDoc(qRef2, {
        id: "quote_marcus_vance_pipe",
        jobId: job.id,
        providerId: "prov_marcus_vance",
        providerName: "Marcus Vance",
        providerPhotoURL: SAMPLE_PROVIDERS[0].photoURL,
        price: "$260",
        message: "Hi Michael, I can come out this Saturday morning with all brass replacement valves and finish the job in 90 minutes. Full 1-year guarantee on parts & labor.",
        status: "accepted",
        createdAt: serverTimestamp(),
      })
    }
  }

  onProgress?.("Seeding bookings & appointment schedule...", 75)

  // 4. Seed Bookings
  const sampleBookings = [
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
      reviewComment: "Sarah and her crew did an extraordinary job! The landlord returned our full deposit with zero deductions. Highly recommended!",
      reviewedAt: serverTimestamp(),
    },
    {
      id: "book_hvac_sarah",
      jobId: "job_ac_tuneup",
      jobTitle: "Annual Central HVAC Diagnostics & Coil Clean",
      category: "HVAC",
      customerId: "cust_sarah_connor",
      customerName: "Sarah Connor",
      customerEmail: "sarah.connor@example.com",
      providerId: "prov_derrick_miller",
      providerName: "Derrick Miller",
      price: "$210",
      scheduledDate: "2026-09-08",
      scheduledTime: "02:00 PM - 04:00 PM",
      location: "1428 Elm Ridge, Westside District",
      status: "in_progress",
    },
  ]

  for (const b of sampleBookings) {
    const bRef = doc(db, "bookings", b.id)
    await setDoc(
      bRef,
      {
        ...b,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  onProgress?.("Seeding authentic customer reviews...", 90)

  // 5. Seed Reviews on Completed Bookings
  const sampleReviews = [
    {
      id: "rev_cleaning_emily",
      bookingId: "book_cleaning_emily",
      jobId: "job_deep_clean_moveout",
      providerId: "prov_sarah_jenkins",
      providerName: "Sarah Jenkins",
      customerId: "cust_emily_watson",
      customerName: "Emily Watson",
      customerPhotoURL: SAMPLE_CUSTOMERS[2].photoURL,
      rating: 5,
      comment: "Sarah and her crew did an extraordinary job! The landlord returned our full deposit with zero deductions. Professional, punctual, and eco-friendly products made the place smell fresh.",
      serviceCategory: "Cleaning",
    },
    {
      id: "rev_electrical_downtown",
      bookingId: "book_electrical_completed",
      jobId: "job_electrical_panel",
      providerId: "prov_elena_rostova",
      providerName: "Elena Rostova",
      customerId: "cust_michael_chang",
      customerName: "Michael Chang",
      customerPhotoURL: SAMPLE_CUSTOMERS[1].photoURL,
      rating: 5,
      comment: "Elena is brilliant. She diagnosed a recurring breaker trip within 15 minutes that two previous handymen couldn't figure out. Neat wiring and completely transparent pricing.",
      serviceCategory: "Electrical",
    },
    {
      id: "rev_plumbing_marcus",
      bookingId: "book_plumbing_completed",
      jobId: "job_water_heater",
      providerId: "prov_marcus_vance",
      providerName: "Marcus Vance",
      customerId: "cust_sarah_connor",
      customerName: "Sarah Connor",
      customerPhotoURL: SAMPLE_CUSTOMERS[0].photoURL,
      rating: 5,
      comment: "Marcus came out on a Sunday when our water heater began flooding the basement. Fast, honest, and saved our flooring from major damage. Will call him for all future plumbing needs!",
      serviceCategory: "Plumbing",
    },
  ]

  for (const rev of sampleReviews) {
    const revRef = doc(db, "reviews", rev.id)
    await setDoc(
      revRef,
      {
        ...rev,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  onProgress?.("Done! Marketplace database populated successfully.", 100)

  return {
    providersCount: SAMPLE_PROVIDERS.length,
    jobsCount: sampleJobs.length,
    bookingsCount: sampleBookings.length,
    reviewsCount: sampleReviews.length,
  }
}
