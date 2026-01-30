import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEMO_NAMES = [
  "Alex Chen",
  "Samira Khan",
  "Jordan Taylor",
  "Priya Patel",
  "Marcus Johnson",
  "Léa Martin",
  "Omar Hassan",
  "Emma Wilson",
  "Yuki Tanaka",
  "Fatima Al-Rashid",
  "Lucas Silva",
  "Zara Ahmed",
];

const DEMO_SKILLS_SETS = [
  ["React", "TypeScript", "Node.js", "PostgreSQL"],
  ["Python", "Machine Learning", "SQL", "Docker"],
  ["Vue.js", "JavaScript", "Tailwind", "Git"],
  ["Flutter", "Dart", "Firebase", "UI/UX"],
  ["Java", "Spring", "MongoDB", "AWS"],
  ["Next.js", "React", "TypeScript", "Figma"],
  ["Python", "Data Science", "PostgreSQL", "Docker"],
  ["React Native", "JavaScript", "Node.js", "Git"],
  ["Swift", "iOS", "UI/UX", "Figma"],
  ["Kotlin", "Android", "Java", "Git"],
  ["DevOps", "Docker", "AWS", "Linux"],
  ["Cybersecurity", "Python", "SQL", "Networking"],
];

const AVAILABILITIES = ["weekdays", "weekends", "evenings", "flexible"] as const;
const PROJECT_TYPES = ["web", "mobile", "data", "devops", "any"] as const;
const LOOKING_FOR = ["binome", "team", "any"] as const;
const CITIES = ["Paris", "Lyon", "Toulouse", "Marseille", "Nantes", "Bordeaux", "Lille", "Strasbourg"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const count = Math.min(12, Math.max(8, DEMO_NAMES.length));
  const created: string[] = [];

  for (let i = 0; i < count; i++) {
    const name = DEMO_NAMES[i];
    const email = `demo${i + 1}+${Date.now()}@binomematch.demo`;
    const password = crypto.randomUUID();

    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (userError || !userData.user) {
      console.error("createUser error:", userError);
      continue;
    }

    const skills = DEMO_SKILLS_SETS[i % DEMO_SKILLS_SETS.length];
    const availability = AVAILABILITIES[i % AVAILABILITIES.length];
    const preferred_project_type = PROJECT_TYPES[i % PROJECT_TYPES.length];
    const looking_for = LOOKING_FOR[i % LOOKING_FOR.length];
    const city = CITIES[i % CITIES.length];

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userData.user.id,
      display_name: name,
      level: i % 2 === 0 ? "M1" : "L3",
      city,
      bio: `Demo profile for ${name}. Interested in ${preferred_project_type} projects.`,
      skills,
      availability,
      preferred_project_type,
      looking_for,
      is_visible: true,
    });

    if (profileError) {
      console.error("profile insert error:", profileError);
      continue;
    }
    created.push(name);
  }

  return Response.json(
    {
      message: `Created ${created.length} demo profiles.`,
      created,
    },
    {
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  );
});
