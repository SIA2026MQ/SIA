type CourseCategory = "Practices" | "Scriptures";

type CourseItem = {
  id: string;
  category: CourseCategory;
  title: string;
  description: string;
  price: string;
  duration: string;
  lessons: number;
  lessonTitles?: string[];
  lessonItems?: Array<{ title: string; videoDataUrl?: string; videoName?: string }>;
  rating: number;
  imageUrl?: string;
  imageDataUrl?: string;
};

type BlogItem = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  body: string[];
  imageUrl?: string;
  imageDataUrl?: string;
};

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "SIA", to: "/sia" },
  { label: "Events" },
  { label: "Courses", to: "/courses" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  {label: "Subscription", to: "/subscription" },
] as const;

export const webinars = [
  {
    id: "w1",
    title: "The Pathless Path: Weekly Satsang",
    date: "Every Sunday · 7:00 PM IST",
    description: "A contemplative live circle for inquiry, silence, and direct presence.",
    price: "$19",
  },
  {
    id: "w2",
    title: "Kundalini Breath & Awareness",
    date: "July 12 · 6:30 PM IST",
    description: "Guided practice to expand vitality and settle into centered awareness.",
    price: "$24",
  },
  {
    id: "w3",
    title: "Ancient Wisdom, Modern Life",
    date: "July 19 · 8:00 PM IST",
    description: "Practical transmission from sacred texts into daily action and stillness.",
    price: "$29",
  },
];

export const homeGallery = [
  "Mandala gathering hall",
  "Sunrise meditation retreat",
  "Spiritual discourse in nature",
  "Lotus altar and candles",
  "Yoga satsang at dusk",
  "Silent walking meditation",
];

export const courses: CourseItem[] = [
  {
    id: "c1",
    category: "Practices",
    title: "Kundalini Foundations",
    description: "Breath, kriya, mantra, and embodied awareness for inner clarity.",
    price: "$49",
    duration: "6 weeks",
    lessons: 18,
    rating: 4.9,
  },
  {
    id: "c2",
    category: "Practices",
    title: "Meditation for Witnessing",
    description: "Stabilize silence, dissolve reactivity, and rest in pure observation.",
    price: "Free",
    duration: "4 weeks",
    lessons: 12,
    rating: 4.8,
  },
  {
    id: "c3",
    category: "Scriptures",
    title: "Bhagavad Gita: Living Wisdom",
    description: "A direct and practical unfolding of timeless verses.",
    price: "$79",
    duration: "8 weeks",
    lessons: 24,
    rating: 5,
  },
  {
    id: "c4",
    category: "Scriptures",
    title: "Yoga Sutras for Daily Life",
    description: "Integrating stillness, discipline, and compassionate clarity.",
    price: "$59",
    duration: "5 weeks",
    lessons: 16,
    rating: 4.7,
  },
  {
    id: "c5",
    category: "Practices",
    title: "Pranayama Deep Dive",
    description: "Subtle breath maps for emotional balance and energetic refinement.",
    price: "$69",
    duration: "6 weeks",
    lessons: 20,
    rating: 4.9,
  },
  {
    id: "c6",
    category: "Scriptures",
    title: "Upanishadic Inquiry",
    description: "Self-knowledge through guided contemplation and satsang dialogue.",
    price: "$89",
    duration: "10 weeks",
    lessons: 28,
    rating: 4.9,
  },
];

export const eventFilters = ["All", "Free Satsang", "Webinars", "Retreats"] as const;

export const eventsData = [
  {
    id: "e1",
    type: "Free Satsang",
    title: "Open Presence Circle",
    date: "Jul 06 · 7:00 PM",
    location: "Online (Zoom)",
    description: "Meditative inquiry and Q&A with Jake.",
    price: "FREE",
    past: false,
  },
  {
    id: "e2",
    type: "Webinars",
    title: "Vedic Insight for Modern Stress",
    date: "Jul 13 · 8:00 PM",
    location: "Online",
    description: "Wisdom frameworks for work, family, and purpose.",
    price: "$19",
    past: false,
  },
  {
    id: "e3",
    type: "Retreats",
    title: "Himalayan Silence Retreat",
    date: "Aug 10-14",
    location: "Rishikesh, India",
    description: "Five-day immersive retreat with dawn kriya and satsang.",
    price: "$699",
    past: false,
  },
  {
    id: "e4",
    type: "Webinars",
    title: "The Four Yogas",
    date: "Jun 01 · 7:00 PM",
    location: "Online",
    description: "Understanding Bhakti, Karma, Raja and Gyana paths.",
    price: "$25",
    past: true,
  },
  {
    id: "e5",
    type: "Free Satsang",
    title: "Inner Stillness Session",
    date: "Jul 20 · 7:00 PM",
    location: "Online",
    description: "A guided entry into effortless stillness.",
    price: "FREE",
    past: false,
  },
  {
    id: "e6",
    type: "Retreats",
    title: "Desert Dawn Awareness Retreat",
    date: "Sep 02-06",
    location: "Jaisalmer, India",
    description: "Contemplative mornings and sacred fire evening circles.",
    price: "$749",
    past: false,
  },
];

export const blogPosts: BlogItem[] = [
  {
    slug: "the-still-point-within",
    category: "Meditation",
    title: "The Still Point Within",
    excerpt: "In the quiet center of experience, awareness reveals itself as whole and complete.",
    author: "Jake Light",
    date: "June 25, 2026",
    readTime: "7 min read",
    body: [
      "Awareness is not something we create. It is the open field in which all experiences come and go.",
      "As attention refines, we stop identifying with passing thoughts and begin to rest in direct knowing.",
      "The pathless path is not a rejection of practice; it is a maturation of practice into effortless presence.",
    ],
  },
  {
    slug: "vedantic-clarity-in-modern-life",
    category: "Vedic Wisdom",
    title: "Vedantic Clarity in Modern Life",
    excerpt:
      "Ancient teachings become practical when they are lived in relationship, work, and uncertainty.",
    author: "Jake Light",
    date: "June 19, 2026",
    readTime: "9 min read",
    body: [
      "Vedanta invites us to inquire: who is the one experiencing this moment?",
      "When we examine identity deeply, we discover freedom from rigid roles and inherited conditioning.",
      "Spiritual insight becomes real when compassion and responsibility deepen together.",
    ],
  },
  {
    slug: "breath-as-the-bridge",
    category: "Yoga",
    title: "Breath as the Bridge",
    excerpt: "Pranayama harmonizes body and mind, opening the subtle channel for grace.",
    author: "Jake Light",
    date: "June 11, 2026",
    readTime: "6 min read",
    body: [
      "The breath is both physical and sacred. It is where physiology and consciousness meet.",
      "With steady rhythms, we soften survival patterns and return to quiet coherence.",
      "A few conscious minutes each day can transform how we meet every challenge.",
    ],
  },
];

export const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "WhatsApp", href: "#" },
];
