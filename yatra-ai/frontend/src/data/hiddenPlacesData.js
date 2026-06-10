// ╔══════════════════════════════════════════════════════════════════════╗
// ║           YATRA AI — CUSTOM HIDDEN PLACES DATABASE                  ║
// ║                                                                      ║
// ║  Yahan apne custom hidden places add karo.                           ║
// ║  Ye places Explorer Mode me map pe 🗝️ icon ke saath dikhenge.        ║
// ║  Har destination ke liye alag array hai.                             ║
// ║                                                                      ║
// ║  FILE LOCATION: frontend/src/data/hiddenPlacesData.js               ║
// ╚══════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A PLACE:
//
//  1. Destination ka naam dhundho neeche (e.g. "Lucknow", "Varanasi")
//  2. Agar destination nahi hai toh nayi entry banao (example dekhlo)
//  3. Places array me object add karo:
//
//  {
//    name: "Jagah ka naam",           // required
//    description: "Description",      // required — 1-2 lines, kya special hai
//    speciality: "Kya unique hai",    // required — 1 line, shown as badge on map
//    lat: 26.8467,                    // required — Google Maps se copy karo
//    lon: 80.9462,                    // required — Google Maps se copy karo
//    category: "cafe|nature|heritage|street|viewpoint|food|art|spiritual",
//    bestTime: "Evening / Monsoon",   // optional
//    howToReach: "Kaisay pohoncho",   // optional
//    tip: "Insider tip",              // optional — shown on map popup
//    tags: ["photogenic", "peaceful"] // optional
//  }
//
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOM_HIDDEN_PLACES = {

  // ── LUCKNOW ──────────────────────────────────────────────────────────────
  "lucknow": [
    {
      name: "Shahi Baoli (Royal Stepwell)",
      description: "Ek forgotten Mughal-era baoli jisme koi nahi jaata. Sidhiyan utarke paani tak pohoncho — bilkul shant jagah hai.",
      speciality: "Forgotten Mughal stepwell, crowd-free",
      lat: 26.8742,
      lon: 80.9215,
      category: "heritage",
      bestTime: "Early morning, 6-8 AM",
      howToReach: "Hazratganj se auto lo, Nadan Mahal Road pe utro",
      tip: "Camera zaroor lo — reflections bohot sundar aate hain",
      tags: ["photography", "heritage", "peaceful"]
    },
    {
      name: "Tunda Kebabi's Secret Kitchen",
      description: "Asli tunde ke kebab yahan bante hain backstage — tourist wali dukaan nahi, ye original family kitchen hai.",
      speciality: "Original 1905 family recipe kebabs",
      lat: 26.8604,
      lon: 80.9120,
      category: "food",
      bestTime: "Lunch time, 12-2 PM",
      howToReach: "Chowk area, Akbari Gate ke peeche gali me",
      tip: "Sirf cash accept hota hai, zyaada bheed na ho tab jao",
      tags: ["food", "local", "authentic"]
    },
    {
      name: "Dilkusha Kothi Ruins",
      description: "1857 ki kranti ke time jali yeh British hunting lodge ab ek haunted-looking ruin hai — bahut kam log aate hain.",
      speciality: "1857 revolt ruins, eerie & photogenic",
      lat: 26.8338,
      lon: 80.9740,
      category: "heritage",
      bestTime: "Golden hour — 5-6 PM",
      howToReach: "Dilkusha Colony, bus se accessible",
      tip: "ASI protected site hai — entry free, but wear good shoes",
      tags: ["history", "photography", "offbeat"]
    }
  ],

  // ── VARANASI ─────────────────────────────────────────────────────────────
  "varanasi": [
    {
      name: "Lolark Kund",
      description: "Shehr ke sabse purane sun-worship kund me se ek — deep underground, sidhiyon se utarke pohoncho. Tourists almost kabhi nahi aate.",
      speciality: "2500+ year old sun kund, completely hidden",
      lat: 25.2924,
      lon: 82.9866,
      category: "spiritual",
      bestTime: "Early morning puja time",
      howToReach: "Assi Ghat ke paas, locals se pucho",
      tip: "Ek local guide lo — finding it alone is tricky",
      tags: ["spiritual", "ancient", "offbeat"]
    },
    {
      name: "Nai Sadak Book Bazaar",
      description: "Paristaan for book lovers — footpath pe laakho purani, rare aur second-hand books milti hain, bahut saste mein.",
      speciality: "Rare books & manuscripts for ₹20-200",
      lat: 25.3126,
      lon: 83.0076,
      category: "street",
      bestTime: "10 AM - 6 PM, weekdays less crowded",
      howToReach: "Godowlia Chowk se 5 min walk",
      tip: "Bargaining expected, aur time do — gems milte hain",
      tags: ["books", "local", "shopping"]
    }
  ],

  // ── JAIPUR ───────────────────────────────────────────────────────────────
  "jaipur": [
    {
      name: "Panna Meena Ka Kund",
      description: "Amer Fort ke paas ek completely hidden stepwell — geometric patterns aur symmetry ke liye photographers ka paradise.",
      speciality: "Hidden stepwell with stunning geometry",
      lat: 26.9884,
      lon: 75.8506,
      category: "heritage",
      bestTime: "Early morning for best light",
      howToReach: "Amer Fort entrance se 5 min walk",
      tip: "Alag alag angles try karo — har photo unique lagti hai",
      tags: ["photography", "architecture", "hidden"]
    },
    {
      name: "Rajmahal Cafe at Old City",
      description: "Ek haveli ke andar chupa cafe jahan rooftop se poora walled city dikhta hai — bilkul non-touristy vibe.",
      speciality: "Rooftop haveli cafe with old city views",
      lat: 26.9239,
      lon: 75.8267,
      category: "cafe",
      bestTime: "Sunset - 5:30 to 7 PM",
      howToReach: "Johari Bazaar ke andar gali me",
      tip: "Reservation nahi milti — seedha jao, usually jagah milti hai",
      tags: ["cafe", "views", "romantic"]
    }
  ],

  // ── DELHI ────────────────────────────────────────────────────────────────
  "delhi": [
    {
      name: "Agrasen ki Baoli",
      description: "Connaught Place ke bilkul paas ek 14th century stepwell — surrounded by modern buildings, bilkul otherworldly feel.",
      speciality: "Medieval stepwell in heart of modern Delhi",
      lat: 28.6274,
      lon: 77.2205,
      category: "heritage",
      bestTime: "Weekday mornings, 7-9 AM",
      howToReach: "Barakhamba Road metro, 10 min walk",
      tip: "Best photos neeche se upar dekhte hue aate hain",
      tags: ["photography", "history", "offbeat"]
    },
    {
      name: "Majnu Ka Tilla Tibetan Colony",
      description: "Delhi ke andar chota Tibet — Tibetan cafes, monasteries, momos, thukpa aur bilkul alag vibe.",
      speciality: "Authentic Tibetan food & culture in Delhi",
      lat: 28.7189,
      lon: 77.2262,
      category: "street",
      bestTime: "Lunch to evening",
      howToReach: "Vidhan Sabha metro, 5 min walk",
      tip: "Ama Cafe ki butter tea miss mat karna",
      tags: ["food", "culture", "offbeat"]
    }
  ],

  // ── MUMBAI ───────────────────────────────────────────────────────────────
  "mumbai": [
    {
      name: "Banganga Tank",
      description: "Walkeshwar me ek 1000+ saal purana sacred tank — right next to luxury Malabar Hill, but feels like ancient India.",
      speciality: "Ancient sacred tank hidden in luxury neighborhood",
      lat: 18.9551,
      lon: 72.7989,
      category: "spiritual",
      bestTime: "Early morning",
      howToReach: "Walkeshwar area, Malabar Hill",
      tip: "Dhobi ghats bhi nearby hain — interesting to observe",
      tags: ["spiritual", "history", "peaceful"]
    }
  ],

  // ── BANGALORE ─────────────────────────────────────────────────────────────
  "bangalore": [
    {
      name: "Bugle Rock Park",
      description: "3 billion year old granite rocks ke beech ek hidden park — city ke andar jungle jaisi feeling.",
      speciality: "3 billion year old ancient rock formations",
      lat: 12.9356,
      lon: 77.5641,
      category: "nature",
      bestTime: "Evening walks",
      howToReach: "Basavanagudi area",
      tip: "Dodda Ganesha Temple bhi paas hai — combine the visit",
      tags: ["nature", "geology", "peaceful"]
    }
  ],

  // ── AGRA ─────────────────────────────────────────────────────────────────
  "agra": [
    {
      name: "Mehtab Bagh at Sunset",
      description: "Taj ke bilkul saamne, river paar, ek garden — idhar se Taj ka sabse acha view milta hai bina crowds ke.",
      speciality: "Best Taj Mahal view without the crowds",
      lat: 27.1769,
      lon: 78.0431,
      category: "viewpoint",
      bestTime: "One hour before sunset",
      howToReach: "Boat se river cross karo ya bridge se",
      tip: "Full moon pe aao — moonlit Taj is surreal",
      tags: ["viewpoint", "photography", "romantic"]
    }
  ],

  // ── KOLKATA ───────────────────────────────────────────────────────────────
  "kolkata": [
    {
      name: "College Street Coffee House",
      description: "1942 se chal raha iconic adda — intellectuals, poets, students ki meeting ground. Old Kolkata ka dil.",
      speciality: "80+ year old literary adda, unchanged since 1942",
      lat: 22.5793,
      lon: 88.3639,
      category: "cafe",
      bestTime: "Afternoon, 3-6 PM",
      howToReach: "College Street, near Presidency University",
      tip: "Pehli floor pe jao — ground floor tourist-y hai",
      tags: ["heritage", "cafe", "intellectual"]
    }
  ]

  // ─────────────────────────────────────────────────────────────────────────
  // NAYI CITY ADD KARO — BUS YE FORMAT FOLLOW KARO:
  //
  // , "cityname": [     <-- lowercase city name, comma se pehli city ke baad
  //   {
  //     name: "...",
  //     description: "...",
  //     speciality: "...",
  //     lat: 00.0000,
  //     lon: 00.0000,
  //     category: "cafe|nature|heritage|street|viewpoint|food|art|spiritual",
  //     bestTime: "...",
  //     howToReach: "...",
  //     tip: "...",
  //     tags: ["tag1", "tag2"]
  //   }
  // ]
  // ─────────────────────────────────────────────────────────────────────────
}

// ── Helper function — destination match karo ─────────────────────────────────
// Ye function TripMap aur GemsTab use karegi automatically

export function getCustomPlacesForDestination(destination) {
  if (!destination) return []
  
  const key = destination.toLowerCase().trim()
  
  // Exact match
  if (CUSTOM_HIDDEN_PLACES[key]) return CUSTOM_HIDDEN_PLACES[key]
  
  // Partial match — e.g. "Lucknow, UP" bhi match ho jaye "lucknow" se
  const matchedKey = Object.keys(CUSTOM_HIDDEN_PLACES).find(
    k => key.includes(k) || k.includes(key.split(',')[0].trim())
  )
  
  return matchedKey ? CUSTOM_HIDDEN_PLACES[matchedKey] : []
}

export default CUSTOM_HIDDEN_PLACES