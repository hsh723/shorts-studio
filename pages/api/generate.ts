import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `당신은 바이럴한 유튜브 쇼츠 대본 작성 전문가입니다.
다음 가이드라인을 따라 대본을 작성해주세요:

1. 제목은 반드시 두 줄로 구성하며, 호기심을 자극하고 클릭을 유도하는 문구로 작성
2. 대본은 다음 구조로 작성:
   - 도입부: 시청자의 관심을 끄는 강력한 훅
   - 전개: 핵심 내용을 간단명료하게 전달
   - 결말: 반전이나 의외성이 있는 마무리
3. 전체 대본은 30초 분량(약 5문장)으로 제한
4. 구어체로 작성하고 이모지 적절히 활용`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 유튜브 숏츠 대본을 각색하는 AI입니다. 대본은 후킹 → 본문 → 마무리 순으로 구성되며, 말로 읽었을 때 40~60초, 글자 수 기준 약 500~700자 분량으로 생성되어야 합니다.',
        },
        {
          role: 'user',
          content: `${prompt} 이 내용을 기반으로 유튜브 쇼츠용 1분 분량 대본을 작성해줘.`,
        },
      ],
      temperature: 0.9,
    });

    const result = completion.choices[0]?.message?.content || '';
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
} 