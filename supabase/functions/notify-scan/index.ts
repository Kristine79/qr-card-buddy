const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY is not configured');

    const { chatId, plate, brand, action } = await req.json();

    if (!chatId) {
      return new Response(JSON.stringify({ ok: false, error: 'No chatId provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let text: string;
    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    if (action === 'evacuation') {
      text = `⚠️ <b>Внимание! Эвакуация!</b>\n\nКто-то сообщает, что ваш автомобиль <b>${brand}</b> (${plate}) могут эвакуировать!\n\n🕐 ${now}`;
    } else if (action === 'damage') {
      text = `🚗 <b>Повреждение автомобиля</b>\n\nКто-то сообщает о повреждении вашего автомобиля <b>${brand}</b> (${plate}).\n\n🕐 ${now}`;
    } else if (action === 'vandalism') {
      text = `🔨 <b>Вандализм</b>\n\nОбнаружен акт вандализма в отношении вашего автомобиля <b>${brand}</b> (${plate}).\n\n🕐 ${now}`;
    } else if (action === 'message') {
      text = `💬 <b>Новое сообщение</b>\n\nКто-то хочет связаться с вами по поводу автомобиля <b>${brand}</b> (${plate}).\n\n🕐 ${now}`;
    } else {
      text = `👀 <b>Визитка отсканирована</b>\n\nКто-то отсканировал QR-код вашего автомобиля <b>${brand}</b> (${plate}).\n\n🕐 ${now}`;
    }

    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Telegram API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending notification:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
