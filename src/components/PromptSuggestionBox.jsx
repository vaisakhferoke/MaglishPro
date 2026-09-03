import React, { useState } from 'react';
import { MessageSquareCode, Copy, Check } from 'lucide-react';

export default function PromptSuggestionBox({ manglishText, englishText, onCopyAll, isCopiedAll }) {
  const [selectedTemplate, setSelectedTemplate] = useState('convert');
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);

  const promptTemplates = {
    convert: "Convert the above Manglish text to English.",
    chatgpt: "Act as an expert English assistant. Expand and refine the following translated content with clear explanations:\n\n" + (englishText || manglishText || ""),
    image: "Create a detailed 8k hyperrealistic Midjourney image prompt based on this context:\n\n\"" + (englishText || manglishText || "") + "\", cinematic lighting, photorealistic, octane render, 8k resolution.",
    email: "Write a polite and professional formal email draft using the following details:\n\n" + (englishText || manglishText || ""),
    summary: "Summarize the key action items and takeaways from the text below into concise bullet points:\n\n" + (englishText || manglishText || ""),
    grammar: "Please proofread, fix all grammatical errors, and enhance tone for official communication:\n\n" + (englishText || manglishText || "")
  };

  const getGeneratedPrompt = () => {
    return promptTemplates[selectedTemplate] || promptTemplates.convert;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getGeneratedPrompt());
    setIsCopiedPrompt(true);
    setTimeout(() => setIsCopiedPrompt(false), 2000);
  };

  return (
    <div className="editor-card">
      <div className="card-header-bar prompt-header">
        <div className="badge-icon"><MessageSquareCode size={18} /></div>
        <span>Prompt Suggestion</span>
      </div>

      <div className="prompt-select-box">
        <label className="select-label">Choose a prompt</label>
        <select 
          className="custom-select" 
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="convert">Convert the above Manglish text to English.</option>
          <option value="chatgpt">ChatGPT / Claude AI Assistant Prompt</option>
          <option value="image">Midjourney / DALL-E Image Generation Prompt</option>
          <option value="email">Professional Email / Business Letter Draft</option>
          <option value="summary">Summary & Actionable Bullet Points</option>
          <option value="grammar">Grammar Polish & Professional Refinement</option>
        </select>

        <div className="prompt-output-preview">
          {getGeneratedPrompt()}
        </div>
      </div>

      <div className="card-bottom-bar prompt-bottom-bar" style={{ justifyContent: 'center', gap: '16px' }}>
        <button 
          className="action-btn primary"
          onClick={handleCopyPrompt}
        >
          {isCopiedPrompt ? <Check size={16} /> : <Copy size={16} />}
          <span>{isCopiedPrompt ? 'Prompt Copied!' : 'Copy Prompt'}</span>
        </button>

        <button 
          className="action-btn"
          onClick={onCopyAll}
        >
          {isCopiedAll ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          <span>{isCopiedAll ? 'All Copied!' : 'Copy All'}</span>
        </button>
      </div>
    </div>
  );
}
