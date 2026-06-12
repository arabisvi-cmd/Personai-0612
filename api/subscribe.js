/* ==========================================================
   VERCEL SERVERLESS FUNCTION: api/subscribe.js (Supabase)
   ========================================================== */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { email } = req.body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  const cleanEmail = email.trim().toLowerCase();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ 
      success: true, 
      info: "Waitlist email validated locally. Supabase credentials not configured in Vercel yet."
    });
  }

  try {
    // Vercel automatically provides geolocation headers
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] || 'Unknown';
    const location = city !== 'Unknown' ? `${city}, ${country}` : country;

    const response = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ email: cleanEmail, location })
    });

    if (!response.ok) {
      throw new Error(`Supabase API returned status: ${response.status}`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Supabase connection error inside api/subscribe:", error);
    return res.status(500).json({ error: "Failed to log waitlist email." });
  }
}
