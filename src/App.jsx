import React, { useState } from 'react';
import { CustomExamReview } from './components/exam';

export default function App() {
  // Branch main: Ẩn tất cả các tab khác, chỉ giữ và hiển thị tab '🎯 Ôn & Thi riêng'
  const [viewMode, setViewMode] = useState('custom-practice');

  const navItems = [
    { id: 'custom-practice', label: '🎯 Ôn & Thi riêng' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '0.6rem 1.2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          onClick={() => setViewMode('custom-practice')}
          title="Một Đời Người, Một Con Đường"
        >
          <img
            src="/logo.png"
            alt="Logo Cảnh sát học bài"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #f59e0b',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.45)',
              flexShrink: 0
            }}
          />
          <strong style={{ fontSize: '1.1rem', letterSpacing: '0.02rem' }}>Một Đời Người, Một Con Đường</strong>
        </div>

        <nav style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: 8,
                border: 'none',
                background: '#0284c7',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.92rem',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.45)'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area - Vừa vặn 1 màn hình trên Laptop/PC */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1040, padding: '0.5rem 1rem', boxSizing: 'border-box', margin: '0 auto' }}>
          <CustomExamReview />
        </div>
      </main>
    </div>
  );
}
