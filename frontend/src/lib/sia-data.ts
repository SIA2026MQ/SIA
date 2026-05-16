// Rich placeholder content for the SIA platform.
// Imagery uses Unsplash with stable IDs and ?auto=format params for performance.

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/sia", label: "SIA" },
  { to: "/events", label: "Events" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=900&q=70", alt: "Lit candles in meditation hall" },
  { src: "https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&w=900&q=70", alt: "Hands resting in mudra during meditation" },
  { src: "https://images.unsplash.com/photo-1474418397713-2f1091382189?auto=format&fit=crop&w=900&q=70", alt: "Seeker meditating at sunrise on a mountain" },
  { src: "https://images.unsplash.com/photo-1599982051819-7d1aaa54e26b?auto=format&fit=crop&w=900&q=70", alt: "Singing bowls and incense" },
  { src: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=70", alt: "Candles at a sacred altar" },
  { src: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=900&q=70", alt: "Woman in lotus pose at sunset" },
];

export type EventType = "satsang" | "webinar" | "retreat";
export interface SIAEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  description: string;
  price: string; // "FREE" or "$120"
  image: string;
  past?: boolean;
}

export const EVENTS: SIAEvent[] = [];

export type CourseCategory = "practices" | "scriptures";
export interface SIACourse {
  id: string;
  title: string;
  category: CourseCategory;
  tag: string;
  description: string;
  duration: string;
  lessons: number;
  price: string;
  rating: number;
  image: string;
}

export const COURSES: SIACourse[] = [
  {
    id: "c1",
    title: "Foundations of Kundalini Practice",
    category: "practices",
    tag: "Kundalini",
    description: "An eight-week awakening of the dormant inner energy through kriya, mantra, and pranayama.",
    duration: "8 weeks",
    lessons: 32,
    price: "$129",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c2",
    title: "The Art of Pranayama",
    category: "practices",
    tag: "Breathwork",
    description: "Six classical pranayama techniques for clarity, vitality, and inner stillness.",
    duration: "4 weeks",
    lessons: 16,
    price: "$79",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c3",
    title: "Meditation: From Effort to Effortless",
    category: "practices",
    tag: "Meditation",
    description: "Move from technique to surrender. A guided path into silent presence.",
    duration: "6 weeks",
    lessons: 24,
    price: "Free",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1474418397713-2f1091382189?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c4",
    title: "Yoga of Devotion (Bhakti)",
    category: "practices",
    tag: "Bhakti",
    description: "Open the heart through chant, ritual, and the living relationship with the Divine.",
    duration: "5 weeks",
    lessons: 20,
    price: "$89",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c5",
    title: "Bhagavad Gita: A Living Commentary",
    category: "scriptures",
    tag: "Gita",
    description: "Eighteen chapters, eighteen lessons. Krishna's wisdom for the modern seeker.",
    duration: "12 weeks",
    lessons: 54,
    price: "$179",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c6",
    title: "The Upanishads Unveiled",
    category: "scriptures",
    tag: "Vedanta",
    description: "Ten principal Upanishads, read aloud and unpacked verse-by-verse.",
    duration: "10 weeks",
    lessons: 40,
    price: "$149",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c7",
    title: "Patanjali's Yoga Sutras",
    category: "scriptures",
    tag: "Yoga Sutras",
    description: "The eight-limb path to samadhi, with daily contemplative practice.",
    duration: "8 weeks",
    lessons: 30,
    price: "$119",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "c8",
    title: "Rig Veda Foundations",
    category: "scriptures",
    tag: "Vedic",
    description: "An introduction to the oldest living scripture — its hymns, gods, and inner meaning.",
    duration: "6 weeks",
    lessons: 22,
    price: "$99",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&w=900&q=70",
  },
  {
  id: "c9",
  title: "Chakra Healing & Energy Alignment",
  category: "practices",
  tag: "Chakras",
  description: "Balance the seven chakras through meditation, bija mantras, visualization, and subtle body practices.",
  duration: "7 weeks",
  lessons: 28,
  price: "$109",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c10",
  title: "Sacred Sound & Mantra Meditation",
  category: "practices",
  tag: "Mantra",
  description: "Explore the transformative power of Sanskrit mantras, chanting, and vibrational healing.",
  duration: "5 weeks",
  lessons: 18,
  price: "$89",
  rating: 4.9,
  image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c11",
  title: "Inner Silence Retreat",
  category: "practices",
  tag: "Mindfulness",
  description: "A structured journey into silence, awareness, and conscious observation inspired by Vipassana traditions.",
  duration: "10 days",
  lessons: 12,
  price: "$59",
  rating: 4.7,
  image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c12",
  title: "Ayurveda for Daily Living",
  category: "practices",
  tag: "Ayurveda",
  description: "Learn doshas, daily rituals, yogic nutrition, and holistic practices for balance and vitality.",
  duration: "6 weeks",
  lessons: 26,
  price: "$119",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c13",
  title: "The Science of Karma",
  category: "scriptures",
  tag: "Karma Yoga",
  description: "Understand karma, dharma, and conscious action through classical yogic teachings and modern examples.",
  duration: "5 weeks",
  lessons: 20,
  price: "$95",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c14",
  title: "Ramayana: Wisdom Through Story",
  category: "scriptures",
  tag: "Ramayana",
  description: "Dive into the timeless epic of Rama, Sita, and Hanuman with spiritual and symbolic interpretations.",
  duration: "9 weeks",
  lessons: 36,
  price: "$139",
  rating: 4.9,
  image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c15",
  title: "Tantra Beyond Myth",
  category: "scriptures",
  tag: "Tantra",
  description: "A grounded introduction to authentic tantric philosophy, meditation, and sacred consciousness.",
  duration: "8 weeks",
  lessons: 30,
  price: "$159",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c16",
  title: "The Wisdom of Adi Shankaracharya",
  category: "scriptures",
  tag: "Advaita",
  description: "Study the teachings of non-duality through selected works and commentaries of Adi Shankaracharya.",
  duration: "7 weeks",
  lessons: 25,
  price: "$129",
  rating: 5.0,
  image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c17",
  title: "Sacred Geometry & Yantra Meditation",
  category: "practices",
  tag: "Yantra",
  description: "Use yantras and sacred geometry as tools for meditation, focus, and spiritual alignment.",
  duration: "4 weeks",
  lessons: 14,
  price: "$69",
  rating: 4.7,
  image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=70",
},
{
  id: "c18",
  title: "Jnana Yoga: The Path of Wisdom",
  category: "scriptures",
  tag: "Jnana",
  description: "Self-inquiry, discernment, and the direct path to realization through Vedantic teachings.",
  duration: "8 weeks",
  lessons: 32,
  price: "$149",
  rating: 4.9,
  image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=70",
},
];

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "the-pathless-path",
    title: "The Pathless Path: Why Every Tradition Points Home",
    category: "Spirituality",
    excerpt: "After decades among the world's religions, one truth keeps surfacing — there is nowhere to arrive.",
    body: `## The longing beneath every path

Every great tradition begins with a longing — a wordless ache that pulls us toward the unseen. The seeker imagines that somewhere, in some practice or place or person, there is an answer waiting. We collect maps. We try sequences. We test teachers.

## The discovery

After many years of pilgrimage, a strange reversal occurs. The seeker realises that what was being sought is what is doing the seeking. The destination was never elsewhere. It was the very awareness that lit the search.

> The Pathless Path is not the rejection of paths. It is the recognition that all genuine paths dissolve into the One.

## Living it

To live the Pathless Path is not to abandon practice. It is to practise without the burden of arrival — to sit, breathe, chant, serve, and love, knowing that every act is already the destination wearing a different mask.`,
    author: "Jake Light",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80",
    date: "April 14, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=75",
    featured: true,
  },
  {
    slug: "kundalini-without-fear",
    title: "Kundalini Without Fear: Awakening as Devotion",
    category: "Yoga",
    excerpt: "The serpent of inner energy is gentle when met with reverence. A guide for the cautious seeker.",
    body: `## The misunderstood Shakti

Kundalini has been mythologised into something terrifying. In truth, she is the most intimate intelligence within us, and she rises only as fast as the heart can hold her.\n\n## Three principles for safe awakening\n\n1. **Devotion before technique.** Practice from love, not ambition.\n2. **Stability of body.** The nervous system must be tended like a garden.\n3. **A living teacher.** Books are maps; a teacher is the road itself.`,
    author: "Jake Light",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80",
    date: "March 28, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1600&q=75",
  },
  {
    slug: "reading-the-gita-as-a-mirror",
    title: "Reading the Gita as a Mirror, Not a Manual",
    category: "Vedic Wisdom",
    excerpt: "Krishna's words to Arjuna are not instructions. They are reflections of what we already know.",
    body: `## A battlefield within\n\nArjuna's despondency is our own. The chariot is the body, the horses the senses, the charioteer the awakened Self.\n\n## The Gita's invitation\n\nRead it slowly. Read it again. Notice which verses unsettle you — those are the ones that have come to liberate you.`,
    author: "Jake Light",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80",
    date: "March 12, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1600&q=75",
  },
  {
    slug: "the-discipline-of-stillness",
    title: "The Discipline of Stillness",
    category: "Meditation",
    excerpt: "Meditation is not an escape from the world. It is the courage to meet it without armour.",
    body: `## What stillness asks of us\n\nStillness is the willingness to be — without performance, without rehearsal, without flight.\n\n## A simple instruction\n\nSit. Breathe. Notice. Repeat for the rest of your life.`,
    author: "Jake Light",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80",
    date: "February 26, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1474418397713-2f1091382189?auto=format&fit=crop&w=1600&q=75",
  },
  {
    slug: "what-the-upanishads-cannot-say",
    title: "What the Upanishads Cannot Say",
    category: "Vedic Wisdom",
    excerpt: "The greatest teachings end in silence. Here is why the rishis kept reaching for the unsayable.",
    body: `## Neti, neti\n\n*Not this, not this.* The Upanishads define the Self by what it is not — peeling away every false identity until only awareness remains.\n\n## Why it matters\n\nIn an age that worships definition, the rishis remind us that the most important Reality is the one no word can hold.`,
    author: "Jake Light",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80",
    date: "February 09, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=75",
  },
  {
    slug: "the-householder-mystic",
    title: "The Householder Mystic",
    category: "Personal Journey",
    excerpt: "You do not need a cave or a robe. The kitchen, the inbox, the children — these are the temple.",
    body: `## Awakening in ordinary life\n\nThe great myth is that the spiritual life requires renunciation of the world. The Pathless Path teaches the opposite — to bring sacredness *into* the world.\n\n## Three quiet practices\n\n- One conscious breath before each meal.\n- One moment of silent gratitude before sleep.\n- One person each day looked at as if for the first time.`,
    author: "Jake Light",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80",
    date: "January 22, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=75",
  },
];

export const TIMELINE = [
  { year: "1995", title: "The first calling", text: "A young Jake encounters meditation through a chance meeting in northern India." },
  { year: "2001", title: "Years of pilgrimage", text: "Living among monks, sufis, kabbalists, and Vedic scholars across three continents." },
  { year: "2008", title: "Kundalini awakening", text: "An extended Himalayan retreat opens the door to direct experience of Shakti." },
  { year: "2014", title: "Founding of SIA", text: "Shifting Into Awareness is born as a global community for sincere seekers." },
  { year: "2020", title: "The online sangha", text: "Live satsangs go global, reaching seekers in 40+ countries weekly." },
  { year: "2026", title: "The Pathless Path", text: "A new era of teaching, retreats, and scripture commentary begins." },
];
