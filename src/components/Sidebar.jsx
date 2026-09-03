import React from 'react';
import { Plus, MessageSquare, Trash2, Mail, Phone } from 'lucide-react';

export default function Sidebar({ files, activeFileId, onSelectFile, onNewFile, onDeleteFile, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            M
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Manglish Typing</span>
        </div>

        <button className="btn-new-file" onClick={onNewFile}>
          <Plus size={18} />
          New File
        </button>
      </div>

      <div>
        <div className="sidebar-section-title">Today</div>
        <ul className="file-list">
          {files.map((file) => (
            <li
              key={file.id}
              className={`file-item ${file.id === activeFileId ? 'active' : ''}`}
              onClick={() => onSelectFile(file.id)}
            >
              <div className="file-item-info">
                <span className="file-item-title">{file.title || 'Untitled Document'}</span>
                <span className="file-item-time">{file.time || 'Just now'}</span>
              </div>
              <button 
                className="icon-btn" 
                style={{ padding: '2px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
                title="Delete File"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <p>Your files are stored only in this browser.</p>
        <a
          href="mailto:vaisakhperumthody@gmail.com?subject=Feedback%20for%20Manglish%20Typing%20App"
          className="btn-feedback"
        >
          <MessageSquare size={16} />
          Tell us your feedback
        </a>
        <a
          href="mailto:vaisakhperumthody@gmail.com?subject=Contact%20-%20MaglishPro"
          className="sidebar-contact-info"
          title="Email: vaisakhperumthody@gmail.com"
        >
          <Mail size={14} />
          <span>vaisakhperumthody@gmail.com</span>
        </a>
        <a
          href="tel:+919744449448"
          className="sidebar-contact-info"
          title="Call: +91 9744 449 448"
        >
          <Phone size={14} />
          <span>+91 9744 449 448</span>
        </a>
      </div>
    </aside>
  );
}
