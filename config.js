// ============================================================
// PLATAFORMA POWER FIT (Metodologia GeFit), configuração compartilhada
// Este arquivo é incluído em todas as páginas do sistema.
// ============================================================

const SUPABASE_URL = 'https://irwvagffrguiljaxrzmd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd3ZhZ2Zmcmd1aWxqYXhyem1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNDk5ODUsImV4cCI6MjEwNDkyNTk4NX0.YAApyaH6iIHEua_89fgCUpMzgXRIcWb_vNRkBQAoq5A';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACADEMIA_ID = '693a66c2-c983-499d-a611-a3225e91ea8f';

// ---------- Sessão do usuário logado ----------

function gefitGetUser() {
  const raw = localStorage.getItem('gefit_user');
  return raw ? JSON.parse(raw) : null;
}

function gefitSetUser(usuario) {
  localStorage.setItem('gefit_user', JSON.stringify(usuario));
}

function gefitLogout() {
  localStorage.removeItem('gefit_user');
  window.location.href = 'index.html';
}

// Chame no topo de qualquer página que exige login (exceto index.html)
function gefitRequireLogin() {
  const user = gefitGetUser();
  if (!user) {
    window.location.href = 'index.html';
  }
  return user;
}
