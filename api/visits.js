/* ==========================================================
   VERCEL SERVERLESS FUNCTION: api/visits.js (Supabase)
   ========================================================== */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
      visits: 42, 
      info: "Supabase credentials not configured in Vercel environment variables yet."
    });
  }

  try {
    let visits = 0;

    if (req.method === 'POST') {
      // Vercel automatically provides geolocation headers
      const country = req.headers['x-vercel-ip-country'] || 'Unknown';
      const city = req.headers['x-vercel-ip-city'] || 'Unknown';
      const location = city !== 'Unknown' ? `${city}, ${country}` : country;

      // Record a new visit, including the location data
      await fetch(`${supabaseUrl}/rest/v1/visits`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location })
      });
    }

    // Always fetch the latest count
    const countResponse = await fetch(`${supabaseUrl}/rest/v1/visits?select=id`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact',
        'Range-Unit': 'items'
      }
    });

    const rangeHeader = countResponse.headers.get('Content-Range');
    if (rangeHeader) {
      visits = parseInt(rangeHeader.split('/')[1], 10) || 0;
    }

    return res.status(200).json({ visits });

  } catch (error) {
    console.error("Supabase connection error inside api/visits:", error);
    return res.status(500).json({ error: "Failed to communicate with the database." });
  }
}
