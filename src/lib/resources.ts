export interface Resource { name: string; url: string; description: string; category: "Counseling & crisis" | "Health & wellness" | "Academic support" | "Student services" }

/** Official links, checked live when added. */
export const RESOURCES: Resource[] = [
  { name: "ASU Counseling Services", url: "https://eoss.asu.edu/counseling", description: "Free, confidential counseling for enrolled ASU students, including 24/7 crisis support. See their site for current phone numbers and locations.", category: "Counseling & crisis" },
  { name: "988 Suicide & Crisis Lifeline", url: "https://988lifeline.org", description: "Call or text 988 any time, day or night, in the U.S. Free and confidential.", category: "Counseling & crisis" },
  { name: "ASU Health Services", url: "https://eoss.asu.edu/health", description: "Medical care, appointments and health resources on campus.", category: "Health & wellness" },
  { name: "ASU Wellness", url: "https://wellness.asu.edu", description: "Wellness programs, workshops and healthy-living resources for Sun Devils.", category: "Health & wellness" },
  { name: "Academic Support Network (Tutoring)", url: "https://tutoring.asu.edu", description: "Free tutoring, writing centers and study support.", category: "Academic support" },
  { name: "Student Accessibility and Inclusive Learning Services", url: "https://eoss.asu.edu/accessibility", description: "Accommodations and support for students with disabilities.", category: "Academic support" },
  { name: "Dean of Students", url: "https://eoss.asu.edu/dos", description: "Help navigating challenges, student advocacy and basic-needs support.", category: "Student services" },
  { name: "ASU Career Services", url: "https://career.asu.edu", description: "Career coaching, resume help, internships and job fairs.", category: "Student services" },
];
