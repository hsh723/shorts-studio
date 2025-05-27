import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const system = `
당신은 영상 제작 전문가입니다. 사용자의 대본이나 주제 아이디어를 받아서 영상의 스토리보드를 자동으로 구성합니다.
총 4~6개의 씬으로 나누고, 각 씬마다 다음 정보를 포함하세요:

- time (예: 0~5초)
- scene (시각적 요소 설명)
- audio (어떤 목소리나 톤의 더빙이 들어가는지)
- subtitle (화면에 출력될 핵심 자막)

목표는 유튜브 숏츠나 릴스를 30~60초 안에 압축해서 구성하는 것입니다.
`;

  const userPrompt = `다음 내용을 기반으로 영상 스토리보드를 구성해줘:\n${prompt}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
    });

    const result = response.choices[0].message.content;
    res.status(200).json({ result });
  } catch (err) {
    console.error("Storyboard GPT Error:", err);
    res.status(500).json({ error: 'Failed to generate storyboard' });
  }
} 