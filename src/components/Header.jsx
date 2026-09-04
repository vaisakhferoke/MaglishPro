import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

export default function Header({ isDarkMode, setIsDarkMode, toggleSidebar }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <button className="icon-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className="app-title">Manglish Pro</h1>
        </div>
      </div>

      <div className="header-right">
        <button 
          className="icon-btn" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
