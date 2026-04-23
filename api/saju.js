export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  try {
    const body = req.body;

    // 모델 검증 - Sonnet 허용
    const allowedModels = [
      'claude-sonnet-4-6',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-6',
    ];
    const model = allowedModels.includes(body.model)
      ? body.model
      : 'claude-sonnet-4-6';

    // 토큰 제한 - 최대 8000
    const maxTokens = Math.min(body.max_tokens || 6000, 8000);

    const requestBody = {
      model: model,
      max_tokens: maxTokens,
      messages: body.messages,
    };
    // system 프롬프트가 있으면 포함
    if (body.system) requestBody.system = body.system;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: 'Anthropic API 오류',
        detail: errText,
        status: response.status,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('saju.js error:', err);
    return res.status(500).json({ error: err.message });
  }
}
