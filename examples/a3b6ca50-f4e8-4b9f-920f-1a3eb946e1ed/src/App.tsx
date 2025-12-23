import React, { useState } from 'react';
import { Wand2, Copy, CheckCheck, Sparkles } from 'lucide-react';

type CopyType = 'social' | 'marketing' | 'product' | 'headline';

interface GeneratorForm {
  type: CopyType;
  keywords: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
}

function App() {
  const [form, setForm] = useState<GeneratorForm>({
    type: 'social',
    keywords: '',
    tone: 'professional',
    length: 'medium'
  });
  
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const samples = {
      social: "探索无限可能，创造独特价值。让我们一起打造精彩纷呈的品牌故事！#创新 #品质",
      marketing: "突破传统界限，开启崭新篇章。用心倾听，为您带来更好的体验。",
      product: "精心打造的品质之选，让生活更添精彩。专注细节，只为呈现卓越。",
      headline: "开启智慧新未来，让梦想触手可及。"
    };
    
    setGeneratedText(samples[form.type]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-indigo-600" />
              智能文案生成器
            </h1>
            <div className="px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-medium">
              AI 驱动
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  文案类型
                </label>
                <select
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value as CopyType})}
                >
                  <option value="social">社交媒体</option>
                  <option value="marketing">营销文案</option>
                  <option value="product">产品描述</option>
                  <option value="headline">标题文案</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  语气风格
                </label>
                <select
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                  value={form.tone}
                  onChange={(e) => setForm({...form, tone: e.target.value})}
                >
                  <option value="professional">专业正式</option>
                  <option value="casual">轻松随意</option>
                  <option value="humorous">幽默有趣</option>
                  <option value="serious">严肃认真</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                关键词
              </label>
              <input
                type="text"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                placeholder="输入关键词，用逗号分隔"
                value={form.keywords}
                onChange={(e) => setForm({...form, keywords: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文案长度
              </label>
              <div className="flex gap-4 bg-gray-50 p-2 rounded-xl">
                {['short', 'medium', 'long'].map((length) => (
                  <label key={length} className="flex-1">
                    <input
                      type="radio"
                      name="length"
                      value={length}
                      checked={form.length === length}
                      onChange={(e) => setForm({...form, length: e.target.value as 'short' | 'medium' | 'long'})}
                      className="sr-only peer"
                    />
                    <div className="text-center py-2 rounded-lg cursor-pointer transition-all peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-indigo-600 text-gray-600">
                      {length === 'short' ? '简短' : length === 'medium' ? '适中' : '长篇'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-200"
            >
              <Wand2 className="w-5 h-5" />
              生成文案
            </button>

            {generatedText && (
              <div className="mt-8 animate-fade-in">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 relative">
                  <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">{generatedText}</p>
                  <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-lg transition-all"
                    title="复制文案"
                  >
                    {copied ? 
                      <CheckCheck className="w-5 h-5 text-green-500" /> : 
                      <Copy className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;