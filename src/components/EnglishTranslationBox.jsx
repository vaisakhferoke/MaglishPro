import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Languages, Undo, Redo, Bold, Italic, Underline, Type, Highlighter, 
  List, MoreVertical, Mic, Copy, Check 
} from 'lucide-react';

export default function EnglishTranslationBox({ translationText, setTranslationText, onCopy, isCopied }) {
  const [fontSize, setFontSize] = useState(12);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleVoiceTyping = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranslationText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, setTranslationText]);

  return (
    <div className="editor-card">
      <div className="card-header-bar translation-header">
        <div className="badge-icon"><Languages size={18} /></div>
        <span>Translation to English</span>
      </div>

      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <button className="toolbar-btn" title="Undo"><Undo size={16} /></button>
        <button className="toolbar-btn" title="Redo"><Redo size={16} /></button>
        <div className="toolbar-divider"></div>

        <select className="font-size-control">
          <option>Default</option>
          <option>Serif</option>
          <option>Monospace</option>
        </select>

        <div className="toolbar-divider"></div>

        <div className="font-size-control">
          <button className="font-size-btn" onClick={() => setFontSize(Math.max(10, fontSize - 1))}>-</button>
          <span>{fontSize}</span>
          <button className="font-size-btn" onClick={() => setFontSize(Math.min(32, fontSize + 1))}>+</button>
        </div>

        <div className="toolbar-divider"></div>

        <button className="toolbar-btn" title="Bold"><Bold size={16} /></button>
        <button className="toolbar-btn" title="Italic"><Italic size={16} /></button>
        <button className="toolbar-btn" title="Underline"><Underline size={16} /></button>
        <button className="toolbar-btn" title="Text Color"><Type size={16} /></button>
        <button className="toolbar-btn" title="Highlight"><Highlighter size={16} /></button>
        <div className="toolbar-divider"></div>
        <button className="toolbar-btn" title="Bullet List"><List size={16} /></button>
        <button className="toolbar-btn" title="More Options"><MoreVertical size={16} /></button>
      </div>

      {/* Editable Translated Text Box */}
      <div className="editor-input-wrapper">
        <textarea
          className="editor-textarea"
          style={{ fontSize: `${fontSize}px` }}
          value={translationText}
          onChange={(e) => setTranslationText(e.target.value)}
          placeholder="English translation will automatically appear here..."
        />
      </div>

      {/* Card Bottom Bar */}
      <div className="card-bottom-bar" style={{ justifyContent: 'flex-end' }}>
        <div className="action-buttons">
          <button 
            className={`action-btn ${isListening ? 'active-recording' : ''}`}
            onClick={toggleVoiceTyping}
          >
            <Mic size={16} />
            <span>{isListening ? 'Listening...' : 'Voice Typing'}</span>
          </button>

          <button className="action-btn" onClick={onCopy}>
            {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
