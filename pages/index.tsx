import { useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PromptInput } from '../components/Step1_Prompt/PromptInput';
import { ScriptList } from '../components/Step1_Prompt/ScriptList';
import { useScriptStore } from '../lib/scriptStore';

const Home: NextPage = () => {
  const { selectedScriptId } = useScriptStore();
  const router = useRouter();

  const handleNextStep = () => {
    if (selectedScriptId) {
      router.push(`/step2?scriptId=${selectedScriptId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI 숏츠 생성기 - Step 1</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-8">
          <PromptInput />
          <ScriptList />
        </div>

        {selectedScriptId && (
          <div className="fixed bottom-4 right-4">
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              다음 단계로
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
