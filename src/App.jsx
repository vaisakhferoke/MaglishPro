import React, { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ManglishEditor from './components/ManglishEditor';
import EnglishTranslationBox from './components/EnglishTranslationBox';
import PromptSuggestionBox from './components/PromptSuggestionBox';
import { translateToEnglish } from './services/translationService';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);

  // Files & History state
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('manglish_files');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore parse error */ }
    }
    return [
      {
        id: 'file-1',
        title: 'കണ്ണിൽ malayalam',
        time: 'Just now',
        manglish: 'കണ്ണിൽ malayalam',
        english: 'My name is Arjun.\nI am going to office today.\nThe meeting will start at 10 o\'clock.\nPlease keep the file ready.',
        language: 'മലയാളം'
      }
    ];
  });

  const [activeFileId, setActiveFileId] = useState('file-1');

  // Active File Data
  const initialActive = files.find(f => f.id === 'file-1') || files[0];

  const [manglishText, setManglishText] = useState(initialActive ? initialActive.manglish : '');
  const [englishText, setEnglishText] = useState(initialActive ? initialActive.english : '');
  const [activeLanguage, setActiveLanguage] = useState(initialActive ? initialActive.language : 'മലയാളം');

  // Copy indicator states
  const [isCopiedManglish, setIsCopiedManglish] = useState(false);
  const [isCopiedEnglish, setIsCopiedEnglish] = useState(false);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  // Refs to avoid stale closures in debounced translation
  const activeFileIdRef = React.useRef(activeFileId);
  const activeLanguageRef = React.useRef(activeLanguage);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  useEffect(() => {
    activeLanguageRef.current = activeLanguage;
  }, [activeLanguage]);

  // Persist files to localStorage
  useEffect(() => {
    localStorage.setItem('manglish_files', JSON.stringify(files));
  }, [files]);

  const updateActiveFile = React.useCallback((mText, eText) => {
    setFiles(prev => prev.map(f => {
      if (f.id === activeFileIdRef.current) {
        const firstLine = mText.split('\n')[0].trim();
        return {
          ...f,
          title: firstLine || 'Untitled Document',
          manglish: mText,
          english: eText,
          language: activeLanguageRef.current
        };
      }
      return f;
    }));
  }, []);

  // Auto-translate Manglish/Malayalam text to English with debounce
  useEffect(() => {
    if (!manglishText.trim()) return;

    const timer = setTimeout(() => {
      translateToEnglish(manglishText).then(translated => {
        if (translated) {
          setEnglishText(translated);
          // Update active file title & content
          updateActiveFile(manglishText, translated);
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [manglishText, updateActiveFile]);

  const handleSelectFile = (id) => {
    setActiveFileId(id);
    const target = files.find(f => f.id === id);
    if (target) {
      setManglishText(target.manglish);
      setEnglishText(target.english);
      setActiveLanguage(target.language || 'മലയാളം');
    }
  };

  const handleNewFile = () => {
    const newId = `file-${Date.now()}`;
    const newFileObj = {
      id: newId,
      title: 'Untitled Document',
      time: 'Just now',
      manglish: '',
      english: '',
      language: 'മലയാളം'
    };
    setFiles([newFileObj, ...files]);
    setActiveFileId(newId);
    setManglishText('');
    setEnglishText('');
    setActiveLanguage('മലയാളം');
  };

  const handleDeleteFile = (idToDelete) => {
    const updated = files.filter(f => f.id !== idToDelete);
    if (updated.length === 0) {
      const defaultFile = {
        id: `file-${Date.now()}`,
        title: 'Untitled Document',
        time: 'Just now',
        manglish: '',
        english: '',
        language: 'മലയാളം'
      };
      setFiles([defaultFile]);
      setActiveFileId(defaultFile.id);
      setManglishText('');
      setEnglishText('');
      setActiveLanguage('മലയാളം');
    } else {
      setFiles(updated);
      if (activeFileId === idToDelete) {
        const next = updated[0];
        setActiveFileId(next.id);
        setManglishText(next.manglish);
        setEnglishText(next.english);
        setActiveLanguage(next.language || 'മലയാളം');
      }
    }
  };

  const handleCopyManglish = () => {
    navigator.clipboard.writeText(manglishText);
    setIsCopiedManglish(true);
    setTimeout(() => setIsCopiedManglish(false), 2000);
  };

  const handleCopyEnglish = () => {
    navigator.clipboard.writeText(englishText);
    setIsCopiedEnglish(true);
    setTimeout(() => setIsCopiedEnglish(false), 2000);
  };

  const handleCopyAll = () => {
    const combined = `--- Manglish / Malayalam ---\n${manglishText}\n\n--- Translation to English ---\n${englishText}`;
    navigator.clipboard.writeText(combined);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  // Track mobile breakpoint reactively
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    let wasMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Only auto-close when crossing from desktop to mobile, not on every mobile resize
      if (mobile && !wasMobile) setSidebarOpen(false);
      wasMobile = mobile;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        toggleSidebar={() => setSidebarOpen((open) => !open)}
      />

      {/* Mobile sidebar overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen && isMobile ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="main-layout">
        <Sidebar 
          files={files}
          activeFileId={activeFileId}
          onSelectFile={isMobile ? (id) => { handleSelectFile(id); setSidebarOpen(false); } : handleSelectFile}
          onNewFile={isMobile ? () => { handleNewFile(); setSidebarOpen(false); } : handleNewFile}
          onDeleteFile={handleDeleteFile}
          isOpen={sidebarOpen}
        />

        <main className="content-area">
          {/* Section 1: Manglish Typing Editor */}
          <ManglishEditor 
            text={manglishText}
            setText={(val) => {
              setManglishText(val);
              updateActiveFile(val, englishText);
            }}
            onCopy={handleCopyManglish}
            isCopied={isCopiedManglish}
            activeLanguage={activeLanguage}
            setActiveLanguage={setActiveLanguage}
          />

          {/* Section 2: Translation to English */}
          <EnglishTranslationBox 
            translationText={englishText}
            setTranslationText={(val) => {
              setEnglishText(val);
              updateActiveFile(manglishText, val);
            }}
            onCopy={handleCopyEnglish}
            isCopied={isCopiedEnglish}
          />

          {/* Section 3: Prompt Suggestion & Conversion */}
          <PromptSuggestionBox 
            manglishText={manglishText}
            englishText={englishText}
            onCopyAll={handleCopyAll}
            isCopiedAll={isCopiedAll}
          />

          <footer className="footer-copyright">
            <div className="footer-content">
              <span>© {new Date().getFullYear()} MaglishPro. All rights reserved.</span>
              <div className="footer-contact-group">
                <a 
                  href="mailto:vaisakhperumthody@gmail.com?subject=Inquiry%20-%20MaglishPro" 
                  className="footer-contact-link"
                  title="Send Email to vaisakhperumthody@gmail.com"
                >
                  <Mail size={14} />
                  <span>vaisakhperumthody@gmail.com</span>
                </a>
                <span className="footer-divider">•</span>
                <a 
                  href="tel:+919744449448" 
                  className="footer-contact-link"
                  title="Call +91 9744 449 448"
                >
                  <Phone size={14} />
                  <span>+91 9744 449 448</span>
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
