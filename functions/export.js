export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM leads ORDER BY created_at ASC`
    ).all();

    const header = ['id','timestamp','name','phone','email','prize','brand','created_at'];
    const rows = results.map(r => header.map(k => '"' + String(r[k]||'').replace(/"/g,'""') + '"').join(','));
    const csv = [header.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads-amazingym.csv"',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
