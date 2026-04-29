exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('ERROR: No API key found');
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  console.log('API key found, length:', apiKey.length);

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    console.log('ERROR: Could not parse request body', e.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  console.log('Prompt length:', body.prompt ? body.prompt.length : 0);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: body.prompt }]
      })
    });

    console.log('API response status:', response.status);
    const data = await response.json();
    console.log('API response:', JSON.stringify(data).substring(0, 200));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    console.log('ERROR calling API:', e.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API call failed', detail: e.message })
    };
  }
};
