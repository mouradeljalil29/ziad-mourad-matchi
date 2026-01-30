// BinomeMatch Constants

export const SKILLS_OPTIONS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "PHP",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Git",
  "UI/UX",
  "Figma",
  "Tailwind",
  "Next.js",
  "Vue.js",
  "Angular",
  "Flutter",
  "React Native",
  "Swift",
  "Kotlin",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Cybersecurity",
] as const;

export const INTERESTS_OPTIONS = [
  "Web Development",
  "Mobile Apps",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "DevOps",
  "UI/UX Design",
  "Blockchain",
  "IoT",
  "Game Development",
  "Cybersecurity",
  "Open Source",
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "evenings", label: "Evenings" },
  { value: "flexible", label: "Flexible" },
] as const;

export const PROJECT_TYPE_OPTIONS = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "data", label: "Data" },
  { value: "devops", label: "DevOps" },
  { value: "any", label: "Any" },
] as const;

export const LOOKING_FOR_OPTIONS = [
  { value: "binome", label: "Partner (Binôme)" },
  { value: "team", label: "Team" },
  { value: "any", label: "Any" },
] as const;

export const CONTACT_PREFERENCE_OPTIONS = [
  { value: "in-app", label: "In-App Messages" },
  { value: "email", label: "Email" },
] as const;

export const LEVEL_OPTIONS = [
  "L1",
  "L2",
  "L3",
  "M1",
  "M2",
  "PhD",
  "Bootcamp",
  "Self-taught",
  "Other",
] as const;
