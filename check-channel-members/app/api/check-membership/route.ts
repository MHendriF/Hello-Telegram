import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const botToken = process.env.BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: 'Missing telegram bot token' },
      { status: 500 }
    );
  }

  const { telegramId, channelUsername } = await request.json();

  if (!telegramId || !channelUsername) {
    return NextResponse.json(
      { error: 'Invalid request: missing telegramId or channelUsername' },
      { status: 400 }
    );
  }

  try {
    let formattedChatId = channelUsername;
    if (
      channelUsername.startsWith('@') &&
      !channelUsername.startsWith('-100')
    ) {
      formattedChatId = '@' + channelUsername;
    }

    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(
      formattedChatId
    )}&user_id=${telegramId}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Telegram API error: ${response.status} ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.ok) {
      const status = data.result.status;
      const isMember = ['member', 'creator', 'administrator'].includes(status);
      return NextResponse.json({ isMember });
    } else {
      return NextResponse.json(
        {
          error: `Telegram api return false: ${JSON.stringify(data)}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking Telegram membership:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to check membership: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred while checking channel membership' },
      { status: 500 }
    );
  }
}
