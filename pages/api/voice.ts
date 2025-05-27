import type { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabs } from '@11labs/client';

const voice = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Text and voiceId are required' });
  }

  try {
    const audioBuffer = await voice.textToSpeech({
      text,
      voiceId,
      modelId: 'eleven_multilingual_v2',
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    return res.send(audioBuffer);
  } catch (error) {
    console.error('Voice generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate voice',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 