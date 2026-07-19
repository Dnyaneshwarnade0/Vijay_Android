export const org = {
  name: "Varkari Shikshan Sanstha",
  fullName: "Shantibrahma Gurukulam — Varkari Shikshan Sanstha",
  shortName: "Shantibrahma Gurukulam",
  tagline: "Vidya Dadati Vinayam",
  taglineDev: "विद्या ददाति विनयम्",
  taglineEn: "Knowledge bestows humility",
  established: 1998,
  // TODO: replace with real details
  address: {
    line1: "Shantibrahma Gurukulam",
    line2: "Village [—], Tal. [—], Dist. Pune",
    line3: "Maharashtra, India — 4110[—]",
  },
  phone: "+91 XXXXX XXXXX",
  email: "info@shantibrahmagurukulam.com",
  website: "shantibrahmagurukulam.com",
  whatsapp: "+91 99999 99999",
  hours: "Mon – Sat, 8:00 AM – 6:00 PM",
  registration: "Reg. No. [TODO] · 12A / 80G [TODO]",
};

// TODO: replace with real banking details
export const banking = {
  accountName: "Shantibrahma Gurukulam Varkari Shikshan Sanstha",
  bank: "[Bank Name]",
  branch: "[Branch]",
  accountNumber: "XXXX XXXX XXXX",
  ifsc: "XXXX0000000",
  accountType: "Savings",
  upi: "shantibrahmagurukulam@upi",
};

const IMG = "https://shantibrahmagurukulam.com/wp-content/uploads/2026/07";

export const founder = {
  name: "Ankush Maharaj Kadam",
  role: "Founder & Head Acharya",
  photo: `${IMG}/%E0%A4%B8%E0%A4%82%E0%A4%B8%E0%A5%8D%E0%A4%A5%E0%A4%BE%E0%A4%AA%E0%A4%95-%E0%A4%85%E0%A4%82%E0%A4%95%E0%A5%81%E0%A4%B6-%E0%A4%AE%E0%A4%B9%E0%A4%B0%E0%A4%BE%E0%A4%9C-%E0%A4%95%E0%A4%A6%E0%A4%AE.jpg`.replace("%E0%A4%B9%E0%A4%B0", "%E0%A4%B9%E0%A4%BE"),
  bio: "Rooted in the Varkari tradition and inspired by the teachings of Kurekar Baba, Ankush Maharaj founded Shantibrahma Gurukulam to carry the timeless discipline of Haripath, Dnyaneshwari and Bhakti to the next generation — woven together with a modern school education.",
  quote:
    "Knowledge and devotion are the true provisions for life — this is what we place in the hands of every child.",
};

// Correct founder photo URL (kept raw)
founder.photo = `${IMG}/%E0%A4%B8%E0%A4%82%E0%A4%B8%E0%A5%8D%E0%A4%A5%E0%A4%BE%E0%A4%AA%E0%A4%95-%E0%A4%85%E0%A4%82%E0%A4%95%E0%A5%81%E0%A4%B6-%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%9C-%E0%A4%95%E0%A4%A6%E0%A4%AE.jpg`;

export const homeSlides = [
  { src: `${IMG}/%E0%A4%B6%E0%A4%BE%E0%A4%82%E0%A4%A4%E0%A5%80%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A4%B9%E0%A5%8D%E0%A4%AE-%E0%A4%95%E0%A5%81%E0%A4%B0%E0%A5%87%E0%A4%95%E0%A4%B0-%E0%A4%AC%E0%A4%BE%E0%A4%AC%E0%A4%BE%E0%A4%82%E0%A4%9A%E0%A5%8D%E0%A4%AF%E0%A4%BE-%E0%A4%86%E0%A4%97%E0%A4%AE%E0%A4%A8%E0%A4%BE%E0%A4%A8%E0%A4%BF%E0%A4%AE%E0%A4%BF%E0%A4%A4%E0%A5%8D%E0%A4%A4.png`, alt: "Welcoming ceremony at the gurukulam" },
  { src: `${IMG}/%E0%A4%B9%E0%A4%B0%E0%A4%BF%E0%A4%AA%E0%A4%BE%E0%A4%A0-%E0%A4%95%E0%A4%B0%E0%A4%A4%E0%A4%BE%E0%A4%A8%E0%A4%BE.png`, alt: "Students reciting Haripath" },
  { src: `${IMG}/%E0%A4%B9%E0%A4%B0%E0%A4%BF%E0%A4%AA%E0%A4%BE%E0%A4%A0-%E0%A4%95%E0%A4%B0%E0%A4%A4%E0%A4%BE%E0%A4%A8%E0%A4%BE-2.png`, alt: "Group Haripath recitation" },
  { src: `${IMG}/%E0%A4%B6%E0%A4%BE%E0%A4%B2%E0%A5%87%E0%A4%9A-%E0%A4%95%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%B8.png`, alt: "School classroom" },
  { src: `${IMG}/%E0%A4%B6%E0%A4%BE%E0%A4%B3%E0%A5%87%E0%A4%9A%E0%A4%BE-%E0%A4%95%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%B8-2.png`, alt: "Academic class in session" },
];

export const aboutSlides = [
  { src: `${IMG}/%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%9C-%E0%A4%AD%E0%A4%BE%E0%A4%B7%E0%A4%A3.png`, alt: "Maharaj addressing the gathering" },
  { src: `${IMG}/%E0%A4%95%E0%A5%81%E0%A4%B0%E0%A5%87%E0%A4%95%E0%A4%B0-%E0%A4%AC%E0%A4%BE%E0%A4%AC%E0%A4%BE%E0%A4%82%E0%A4%9A%E0%A4%BE-%E0%A4%B8%E0%A4%A4%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0.png`, alt: "Felicitation of Kurekar Baba" },
  { src: `${IMG}/%E0%A4%95%E0%A5%81%E0%A4%B0%E0%A5%87%E0%A4%95%E0%A4%B0-%E0%A4%AC%E0%A4%BE%E0%A4%AC%E0%A4%BE-.png`, alt: "Kurekar Baba" },
  { src: `${IMG}/%E0%A4%AE%E0%A4%BE%E0%A4%89%E0%A4%B2%E0%A5%80-%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%BE%E0%A4%82%E0%A4%9A%E0%A4%BE-%E0%A4%B8%E0%A4%A4%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0-%E0%A4%95%E0%A4%B0%E0%A4%A4%E0%A4%BE%E0%A4%A8%E0%A4%BE.png`, alt: "Felicitation of Mauli Maharaj" },
];

export const curriculumSlides = [
  { src: `${IMG}/%E0%A4%9C%E0%A5%8D%E0%A4%9E%E0%A4%BE%E0%A4%A8%E0%A5%87%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%B0%E0%A5%80-%E0%A4%AA%E0%A4%BE%E0%A4%A0.png`, alt: "Dnyaneshwari study session" },
  { src: `${IMG}/%E0%A4%9C%E0%A5%8D%E0%A4%9E%E0%A4%BE%E0%A4%A8%E0%A5%87%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%B0%E0%A5%80-%E0%A4%AA%E0%A4%BE%E0%A4%A0-2.png`, alt: "Dnyaneshwari class" },
];

export const gallery = [
  { url: `${IMG}/%E0%A4%B6%E0%A4%BE%E0%A4%B2%E0%A5%87%E0%A4%9A-%E0%A4%95%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%B8.png`, caption: "Classroom session" },
  { url: `${IMG}/%E0%A4%B6%E0%A4%BE%E0%A4%B3%E0%A5%87%E0%A4%9A%E0%A4%BE-%E0%A4%95%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%B8-2.png`, caption: "Academic learning" },
  { url: `${IMG}/%E0%A4%8F%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%AE-%E0%A4%98%E0%A5%87%E0%A4%A4%E0%A4%BE%E0%A4%A8%E0%A4%BE.png`, caption: "Examinations" },
  { url: `${IMG}/%E0%A4%B9%E0%A4%B0%E0%A4%BF%E0%A4%AA%E0%A4%BE%E0%A4%A0-%E0%A4%95%E0%A4%B0%E0%A4%A4%E0%A4%BE%E0%A4%A8%E0%A4%BE.png`, caption: "Haripath recitation" },
  { url: `${IMG}/%E0%A4%B9%E0%A4%B0%E0%A4%BF%E0%A4%AA%E0%A4%BE%E0%A4%A0-%E0%A4%95%E0%A4%B0%E0%A4%A4%E0%A4%BE%E0%A4%A8%E0%A4%BE-2.png`, caption: "Group Haripath" },
  { url: `${IMG}/%E0%A4%B6%E0%A4%BE%E0%A4%82%E0%A4%A4%E0%A5%80%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A4%B9%E0%A5%8D%E0%A4%AE-%E0%A4%95%E0%A5%81%E0%A4%B0%E0%A5%87%E0%A4%95%E0%A4%B0-%E0%A4%AC%E0%A4%BE%E0%A4%AC%E0%A4%BE%E0%A4%82%E0%A4%9A%E0%A5%8D%E0%A4%AF%E0%A4%BE-%E0%A4%86%E0%A4%97%E0%A4%AE%E0%A4%A8%E0%A4%BE%E0%A4%A8%E0%A4%BF%E0%A4%AE%E0%A4%BF%E0%A4%A4%E0%A5%8D%E0%A4%A4.png`, caption: "Welcome ceremony" },
];

export const features = [
  { icon: "📿", title: "Haripath & Bhakti Sadhana", body: "Daily collective Haripath recitation and the disciplined nurturing of Varkari sanskars." },
  { icon: "🏠", title: "Residential Gurukulam", body: "A safe, disciplined environment with lodging and boarding for full-time resident students." },
  { icon: "📖", title: "Dnyaneshwari Study", body: "In-depth recitation, interpretation and philosophy of the ovis of Sant Dnyaneshwar." },
  { icon: "🎓", title: "Modern School Education", body: "Full state-syllabus academic classes alongside traditional Varkari training." },
];

export const stats = [
  { value: 27, suffix: "+", label: "Years of tradition" },
  { value: 180, suffix: "+", label: "Students each year" },
  { value: 45, suffix: "+", label: "Maharajas in parivar" },
  { value: 500, suffix: "+", label: "Alumni across India" },
];

export const testimonials = [
  { quote: "My son received discipline, devotion and academics together. The atmosphere here truly shapes character.", name: "A Parent", role: "Student's family" },
  { quote: "Haripath and Dnyaneshwari took root in me here. The Maharaj's guidance is unforgettable.", name: "Former Student", role: "Gurukulam alumnus" },
  { quote: "Blending school education with Varkari tradition — this institution is genuinely one of a kind.", name: "Local Resident", role: "Donor" },
];

export const faqs = [
  { q: "What is the age range for admission?", a: "Students between roughly 6 and 16 years of age are considered. Please contact the office for specific cases." },
  { q: "Is residential facility available?", a: "Yes. The gurukulam provides full lodging, boarding, and a structured daily routine for resident students." },
  { q: "Do you provide 80G tax exemption on donations?", a: "Please contact the office for the latest status of our 12A / 80G certification and receipts." },
  { q: "Is a regular school syllabus taught?", a: "Yes. Alongside Varkari training, students follow a full state-board academic curriculum." },
];

export const milestones = [
  { year: "1998", title: "Founded", body: "Shantibrahma Gurukulam is established with the blessings of Kurekar Baba." },
  { year: "2005", title: "First residential batch", body: "The first full residential batch of students begins their Varkari studies." },
  { year: "2014", title: "Modern school integration", body: "Full state-syllabus academics are woven into the daily gurukul routine." },
  { year: "2024", title: "500+ alumni", body: "Over five hundred students have passed through the parampara and serve across India." },
];

export const curriculum = [
  { title: "Haripath Recitation", body: "Daily collective recitation of Sant Dnyaneshwar and Sant Tukaram's Haripath with meaning." },
  { title: "Pakhawaj & Instruments", body: "Foundational and advanced training in Taal, Mridang and Pakhawaj — the rhythm of bhakti sangeet." },
  { title: "Dnyaneshwari Study", body: "Deep reading of the ovis, interpretation and philosophical grounding." },
  { title: "Sanskrit & Marathi", body: "Language study rooted in the scriptural tradition, taught alongside comprehension and composition." },
  { title: "Kirtan & Pravachan", body: "Structured training in performing kirtan, storytelling and public discourse." },
  { title: "Modern Academics", body: "State-syllabus school classes covering mathematics, sciences, English and social sciences." },
];

export const admissionSteps = [
  { title: "Enquiry", body: "Reach out via phone, WhatsApp or the enquiry form." },
  { title: "Visit", body: "Schedule a visit to the gurukulam with parents." },
  { title: "Interview", body: "Short conversation with the child and family." },
  { title: "Documents", body: "Submit required identity and academic documents." },
  { title: "Admission", body: "Confirm seat and complete the fee formalities." },
];

export const requiredDocs = [
  "Birth certificate",
  "Aadhaar card (student & parent)",
  "Previous school leaving / transfer certificate",
  "Latest report card",
  "Recent passport-size photographs (4)",
  "Parent contact & address proof",
];

export const causes = [
  { icon: "🍚", title: "Sponsor a Meal", body: "Fund a day of nourishing bhojan for all resident students.", amount: "₹1,100" },
  { icon: "📚", title: "Sponsor Books", body: "Provide a full year of textbooks, scriptures and stationery for one student.", amount: "₹2,500" },
  { icon: "🎓", title: "Sponsor a Student", body: "Cover one child's full-year residential education, food and training.", amount: "₹36,000" },
];
