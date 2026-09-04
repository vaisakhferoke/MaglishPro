import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Undo, Redo, Bold, Italic, Underline, Type, Highlighter, 
  List, MoreVertical, Mic, Copy, Check 
} from 'lucide-react';
import { getMalayalamSuggestions } from '../services/transliterationService';

// Utility to calculate exact (x, y) coordinates of caret in textarea
function getCaretCoordinates(element, position) {
  if (!element) return { top: 40, left: 20, height: 24 };

  const div = document.createElement('div');
  const style = window.getComputedStyle(element);

  const properties = [
    'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
    'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
    'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing',
    'tabSize'
  ];

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';

  properties.forEach(prop => {
    div.style[prop] = style[prop];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(style.borderTopWidth || '0'),
    left: span.offsetLeft + parseInt(style.borderLeftWidth || '0'),
    height: parseInt(style.lineHeight || '24')
  };
  document.body.removeChild(div);

  return coordinates;
}

export default function ManglishEditor({ 
  text, 
  setText, 
  onCopy, 
  isCopied,
  activeLanguage,
  setActiveLanguage
}) {
  const [fontSize, setFontSize] = useState(12);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [popoverPos, setPopoverPos] = useState({ top: 40, left: 20 });
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const showSuggestions = activeLanguage === 'മലയാളം' && suggestions.length > 0;

  // Handle word-by-word transliteration lookup
  // Stop recognition when switching away from Malayalam
  useEffect(() => {
    if (activeLanguage !== 'മലയാളം' && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [activeLanguage]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeLanguage !== 'മലയാളം') {
      return;
    }

    const cursorIndex = textareaRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursorIndex);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1] || '';

    if (lastWord.length >= 2 && /^[a-zA-Z]+$/.test(lastWord)) {
      // Dynamically calculate exact caret position to place suggestion popover below the text line
      if (textareaRef.current) {
        const coords = getCaretCoordinates(textareaRef.current, cursorIndex);
        const containerWidth = textareaRef.current.clientWidth || 600;
        const calcLeft = Math.min(coords.left, Math.max(10, containerWidth - 230));
        const calcTop = coords.top + (coords.height || 24) + 6;

        setPopoverPos({ top: calcTop, left: Math.max(10, calcLeft) });
      }

      let active = true;
      getMalayalamSuggestions(lastWord).then((candidates) => {
        if (!active) return;
        if (candidates && candidates.length > 0) {
          setSuggestions(candidates);
          setActiveSuggestionIndex(0);
        } else {
          setSuggestions([]);
        }
      });

      return () => { active = false; };
    } else {
      setSuggestions((prev) => (prev.length > 0 ? [] : prev));
    }
  }, [text, activeLanguage]);

  // Apply chosen suggestion to text
  const applySuggestion = (selectedMalayalamWord) => {
    const cursorIndex = textareaRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursorIndex);
    const textAfterCursor = text.slice(cursorIndex);
    
    const words = textBeforeCursor.split(/\s+/);
    words[words.length - 1] = selectedMalayalamWord;
    
    const newTextBefore = words.join(' ') + ' ';
    const newText = newTextBefore + textAfterCursor;
    
    setText(newText);
    setSuggestions([]);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = newTextBefore.length;
        textareaRef.current.selectionEnd = newTextBefore.length;
      }
    }, 10);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

  // Voice recognition toggle
  const toggleVoiceTyping = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Try Chrome/Edge!');
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
    recognition.lang = activeLanguage === 'മലയാളം' ? 'ml-IN' : 'en-US';
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
      setText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, activeLanguage, setText]);

  return (
    <div className="editor-card">
      <div className="card-header-bar manglish-header">
        <div className="badge-icon">M</div>
        <span>Manglish Typing</span>
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

      {/* Input Text Area */}
      <div className="editor-input-wrapper">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          style={{ fontSize: `${fontSize}px` }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type Manglish or Malayalam text here... (e.g. kannil malayalam, njan veettil ethi, sugamano)"
        />

        {/* Suggestion Candidates Popover */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-popover" style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className={`suggestion-item ${idx === activeSuggestionIndex ? 'active' : ''}`}
                onClick={() => applySuggestion(item)}
              >
                <span className="suggestion-num">{idx + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Bottom Bar */}
      <div className="card-bottom-bar">
        <div className="lang-switch-tabs">
          <button 
            className={`tab-btn ${activeLanguage === 'മലയാളം' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('മലയാളം')}
          >
            മലയാളം
          </button>
          <button 
            className={`tab-btn ${activeLanguage === 'English' ? 'active' : ''}`}
            onClick={() => setActiveLanguage('English')}
          >
            English
          </button>
        </div>

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
