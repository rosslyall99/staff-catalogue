export const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaWJuYmx1Y2Z0eXpidHplcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE2MDcsImV4cCI6MjA3ODY5NzYwN30.f60ZZIQh0lntvTACdKU0HuLUHgtsbQbwq_csFdeQcRc';

export async function supabaseFetch(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            ...options.headers
        },
        ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
}