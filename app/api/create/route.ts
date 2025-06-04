import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Missing API key' }, { status: 401 });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });
  try {
    await client.connect();
    // Check if API key exists in admins table
    const adminRes = await client.query(
      'SELECT 1 FROM admins WHERE api_key = $1',
      [apiKey]
    );
    if (adminRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const { recipient, slug, remark } = body;
    const result = await client.query(
      `INSERT INTO postcards (recipient, slug, remark) VALUES ($1, $2, $3) RETURNING *`,
      [recipient, slug, remark]
    );
    return NextResponse.json({ success: true, postcard: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  } finally {
    await client.end();
  }
}