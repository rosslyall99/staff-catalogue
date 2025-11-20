export const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g';

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