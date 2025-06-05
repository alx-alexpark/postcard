'use client';

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';

interface PostcardData {
  recipient: string;
  remark: string;
}

export default function PostcardPage() {
  const params = useParams();
  const slug = params!.slug as string;
  const [postcardData, setPostcardData] = useState<PostcardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    const fetchPostcard = async () => {
      try {
        const response = await fetch(`/api/postcard?slug=${slug}`);
        if (!response.ok) {
          throw new Error('Postcard not found');
        }
        const data = await response.json();
        setPostcardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPostcard();
    }
  }, [slug]);

  const handleIGotIt = async () => {
    setNotifying(true);
    try {
      const response = await fetch(`/api/postcard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      alert('Notification sent!');
    } catch (err) {
      alert('Failed to send notification');
      console.error(err);
    } finally {
      setNotifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-black">Loading postcard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!postcardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-black">Postcard not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">You got a postcard from Alex!</h1>
        <h1 className="text-md font-bold text-center mb-6 text-black">Make sure to send pics on Slack :)</h1>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Recipient:
            </label>
            <p className="text-lg font-semibold text-black">{postcardData.recipient}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Remark:
            </label>
            <p className="text-lg italic border-l-4 border-blue-500 pl-4 text-black">
              &quot;{postcardData.remark}&quot;
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleIGotIt}
            disabled={notifying}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            {notifying ? '...' : 'Acknowledge Receipt 📮'}
          </button>
        </div>
      </div>
    </div>
  );
}