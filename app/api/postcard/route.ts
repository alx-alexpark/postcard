import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();
    
    // Query the postcards table for the specific slug
    const result = await client.query(
      'SELECT recipient, remark FROM postcards WHERE slug = $1',
      [slug]
    );
    
    await client.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Postcard not found' }, { status: 404 });
    }
    
    const { recipient, remark } = result.rows[0];
    
    return NextResponse.json({ recipient, remark });
  } catch (error) {
    console.error('Error fetching postcard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug in request body' }, { status: 400 });
    }
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();
    
    // Get the postcard data
    const postcardResult = await client.query(
      'SELECT recipient, remark FROM postcards WHERE slug = $1',
      [slug]
    );
    
    if (postcardResult.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Postcard not found' }, { status: 404 });
    }
    
    const { recipient, remark } = postcardResult.rows[0];
    
    // Get all webhook URLs
    const webhookResult = await client.query('SELECT * FROM webhooks');

    await client.end();
    
    const message = {
      text: `<@U01581HFAGZ>: Your postcard sent to \`${recipient}\` with remark \`${remark}\` has arrived`
    };
    
    // Send to all webhooks
    const webhookPromises = webhookResult.rows.map(async (webhook) => {
      try {
        const response = await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        
        if (!response.ok) {
          console.error(`Failed to send to webhook ${webhook.webhook_url}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error sending to webhook ${webhook.webhook_url}:`, error);
      }
    });
    
    await Promise.all(webhookPromises);
    
    return NextResponse.json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}