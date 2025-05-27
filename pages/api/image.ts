import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메소드입니다' });
  }

  try {
    const { prompt, stylePrompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '프롬프트가 필요합니다' });
    }

    const fullPrompt = `${prompt}, ${stylePrompt}, best quality, highly detailed`;

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    res.status(200).json({ 
      imageUrl: image.data[0].url,
      prompt: fullPrompt // 디버깅용
    });

  } catch (error) {
    console.error('이미지 생성 중 오류:', error);
    res.status(500).json({ 
      error: '이미지 생성 중 오류가 발생했습니다',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 