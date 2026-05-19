export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const data = await context.request.json();
    const { timestamp, name, phone, email, prize, brand } = data;
    const existing = await context.env.DB.prepare('SELECT id FROM leads WHERE email = ? OR phone = ?').bind(email, phone).first();
    if (existing) return new Response(JSON.stringify({ error: 'duplicate' }), { status: 409, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    const offerId = 'AG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,6).toUpperCase();
    await context.env.DB.prepare('INSERT INTO leads (timestamp, name, phone, email, prize, brand, offer_id) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(timestamp||'', name||'', phone||'', email||'', prize||'', brand||'', offerId).run();
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer re_ZwJhg1fA_7PY1QEVmYNK3cd8V1cKsgV87', 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'AmazinGym <noreply@amazingym.pt>', to: email, subject: 'O teu prémio AmazinGym — ' + offerId, html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A1A1A;color:#EBEBEB;padding:40px;border-radius:12px;"><h1 style="color:#FF0000;">Parabéns, ' + name + '!</h1><p>Ganhaste um prémio na Feira Popular de Matosinhos.</p><div style="background:#2a2a2a;border:2px solid #FF0000;border-radius:12px;padding:24px;text-align:center;"><p style="color:#5A5A5A;font-size:12px;letter-spacing:3px;text-transform:uppercase;">O teu prémio</p><h2>' + prize + '</h2><p style="color:#5A5A5A;font-size:11px;letter-spacing:2px;text-transform:uppercase;">ID da oferta</p><p style="color:#FF0000;font-size:18px;font-weight:bold;letter-spacing:2px;">' + offerId + '</p></div><p style="color:#5A5A5A;font-size:13px;margin-top:24px;">Apresenta este email num dos nossos ginásios. Válido por 30 dias.</p><hr style="border:none;border-top:1px solid #323232;margin:24px 0;"><p style="color:#5A5A5A;font-size:11px;text-align:center;">AmazinGym — The House of Fitness</p></div>' }) });
    return new Response(JSON.stringify({ status: 'ok', offerId }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
