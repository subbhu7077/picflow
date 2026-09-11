const SUPABASE_URL = "https://nuqqtvqkbpraxhowpoya.supabase.co";
const SUPABASE_KEY = "sb_publishable__hbybHtM15GlGuMrFr4vWQ_iL0ivaFt";

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase Client Initialized");
  } catch (e) {
    console.error("Supabase Init Failed:", e);
  }
}
