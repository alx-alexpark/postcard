"use client"
import { useState, useRef } from 'react';

function generateSlug() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `sussycard-${result}`;
}

export default function CreatePage() {
  const [status, setStatus] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const slugRef = useRef('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const apiKey = formData.get('apiKey');
    const recipient = formData.get('recipient');
    const remark = formData.get('remark');

    // Use the current slug only
    const currentSlug = slugRef.current;

    const res = await fetch('/api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
      body: JSON.stringify({ recipient, slug: currentSlug, remark }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus('Postcard created!');
      form.reset();
      const newSlug = generateSlug();
      setSlug(newSlug);
      slugRef.current = newSlug;
    } else {
      setStatus(data.error || 'Error creating postcard');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', color: '#22223b' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 340, maxWidth: '90vw', color: '#22223b' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '2rem', color: '#232046', letterSpacing: 1 }}>Create a Postcard</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input name="recipient" placeholder="Recipient" required style={{ padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16, outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', color: '#232046' }} />
          <input name="remark" placeholder="Remark" style={{ padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16, outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', color: '#232046' }} />
          <input name="apiKey" placeholder="Admin API Key" required type="password" style={{ padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16, outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', color: '#232046' }} />
          <div style={{ fontSize: 14, color: '#232046', background: '#f1f5f9', borderRadius: 6, padding: '8px 12px', marginTop: 4, wordBreak: 'break-all' }}>
            <strong>Slug:</strong> {slug || <button 
              type="button" 
              onClick={() => { const newSlug = generateSlug(); setSlug(newSlug); slugRef.current = newSlug; }}
              style={{ background: 'none', border: 'none', color: '#3730a3', textDecoration: 'underline', cursor: 'pointer', fontSize: 14, padding: 0 }}
            >
              Generate new slug
            </button>}
          </div>
          <button type="submit" style={{ padding: 14, borderRadius: 8, background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.08)', cursor: 'pointer', marginTop: 8, transition: 'background 0.2s' }}>Create Postcard</button>
        </form>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a href={`https://postcard.parkalex.dev/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3730a3', textDecoration: 'underline', fontWeight: 500, fontSize: 16 }}>
            https://postcard.parkalex.dev/{slug}
          </a>
        </div>
        {status && <div style={{ marginTop: 18, textAlign: 'center', color: status === 'Postcard created!' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>{status}</div>}
      </div>
    </div>
  );
}
