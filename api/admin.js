/* ==========================================================
   VERCEL SERVERLESS FUNCTION: api/admin.js (Supabase)
   ========================================================== */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ 
      visits: 88, 
      subscribers: [
        ["human@example.com", new Date().toISOString()],
        ["alpha@personai.in", new Date().toISOString()]
      ],
      info: "Supabase keys not configured in Vercel environment variables yet."
    });
  }

  try {
    // 1. Fetch current global visits count
    const visitsResponse = await fetch(`${supabaseUrl}/rest/v1/visits?select=id`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact',
        'Range-Unit': 'items'
      }
    });
    
    let visits = 0;
    const rangeHeader = visitsResponse.headers.get('Content-Range');
    if (rangeHeader) {
      visits = parseInt(rangeHeader.split('/')[1], 10) || 0;
    }

    // 2. Fetch waitlist emails
    const waitlistResponse = await fetch(`${supabaseUrl}/rest/v1/waitlist?select=email,created_at&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const waitlistData = await waitlistResponse.json();
    
    // Format to match frontend expected array of arrays: [[email, time], [email, time]]
    const subscribers = (waitlistData || []).map(row => [row.email, row.created_at]);

    return res.status(200).json({ visits, subscribers });

  } catch (error) {
    console.error("Supabase connection error inside api/admin:", error);
    return res.status(500).json({ error: "Failed to retrieve administrative statistics." });
  }
}
