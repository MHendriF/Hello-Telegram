'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export default function Home() {
  const [isChannelMember, setIsChannelMember] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [channelUsername, setChannelUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const initDataString = window.Telegram.WebApp.initData;
      if (initDataString) {
        const urlParams = new URLSearchParams(initDataString);
        try {
          const user = JSON.parse(urlParams.get('user') || '{}');
          if (user.id) {
            setTelegramId(user.id);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  const checkChannelMembership = async () => {
    if (!telegramId) {
      alert('This app can only be used within Telegram.');
      return;
    }

    if (!channelUsername) {
      alert('Please enter a channel username.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/check-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId, channelUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check membership.');
      }

      const data = await response.json();
      setIsChannelMember(data.isMember);
      setError(null);
    } catch (error) {
      console.error('Error checking channel membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!telegramId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8">Telegram Membership Check</h1>
        <p className="text-xl">
          This app can only be used within Telegram as a Mini App
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Telegram Membership Check</h1>
      <input
        type="text"
        placeholder="Type channel username (e.g,. @example)"
        value={channelUsername}
        onChange={(e) => setChannelUsername(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-96"
      />
      <button
        onClick={checkChannelMembership}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        {isLoading ? 'Checking...' : 'Check Membership'}
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {isChannelMember !== null && (
        <p className="mt-4">
          {isChannelMember
            ? 'You are a member of the channel.'
            : 'You are not a member of the channel.'}
        </p>
      )}
    </main>
  );
}

