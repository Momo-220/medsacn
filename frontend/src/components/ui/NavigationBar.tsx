'use client';

import React from 'react';
import { useNavigation } from '@/lib/navigation/NavigationContext';

export function NavigationBar() {
  const { currentScreen, navigateTo } = useNavigation();

  return (
    <nav className="fixed bottom-[max(30px,env(safe-area-inset-bottom))] left-4 right-4 sm:left-6 sm:right-6 max-w-2xl mx-auto z-50">
      <div className="relative">
        {/* The Floating Island Bar */}
        <div className="relative bg-white dark:bg-gray-800 rounded-[40px] h-[85px] shadow-[0_10px_40px_rgba(26,59,93,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-colors">
          {/* Navigation Items Container */}
          <div className="flex items-center justify-around h-full px-6 relative z-10">
            <NavItem 
              icon="home" 
              active={currentScreen === 'home'}
              onClick={() => navigateTo('home')}
            />
            <NavItem 
              icon="chat" 
              active={currentScreen === 'chat'}
              onClick={() => navigateTo('chat')} 
            />
            
            {/* Spacer for central button */}
            <div className="w-[68px]"></div>
            
            <NavItem 
              icon="pharmacy" 
              active={currentScreen === 'pharmacy' || currentScreen === 'history'}
              onClick={() => navigateTo('pharmacy')}
            />
            <NavItem 
              icon="settings" 
              active={currentScreen === 'settings'}
              onClick={() => navigateTo('settings')}
            />
          </div>
          
          {/* The Sexy Dip - Organic Concave Curve (SVG Path) */}
          <svg
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
            width="100"
            height="30"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            style={{ filter: 'drop-shadow(0 -2px 8px rgba(26, 59, 93, 0.06))' }}
          >
            <path
              d="M 0 30 L 0 20 C 20 20, 30 10, 50 10 C 70 10, 80 20, 100 20 L 100 30 Z"
              fill="white"
              className="dark:fill-gray-800"
            />
          </svg>
        </div>
        
        {/* Central Action Portal Button - Elevated with Glow */}
        <button
          onClick={() => navigateTo('scan')}
          className="absolute left-1/2 -translate-x-1/2 -top-[34px] w-[68px] h-[68px] bg-gradient-to-r from-[#5B9FED] to-[#3B7FD4] rounded-full shadow-[0_4px_20px_rgba(91,159,237,0.4)] flex items-center justify-center z-20"
        >
          {/* Plus Icon in White */}
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function NavItem({ 
  icon, 
  active = false,
  onClick
}: { 
  icon: 'home' | 'chat' | 'pharmacy' | 'settings'; 
  active?: boolean;
  onClick?: () => void;
}) {
  const iconPaths: Record<string, string> = {
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    pharmacy: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
  };

  return (
    <button 
      onClick={onClick}
      className="relative flex items-center justify-center w-12 h-12 group"
    >
      <svg 
        className={`w-6 h-6 ${active ? 'text-[#4A90E2]' : 'text-[#94A3B8]'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
      </svg>
      
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4A90E2] rounded-full" />
      )}
    </button>
  );
}
