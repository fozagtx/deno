'use client';

import { useState } from 'react';
import { Sidebar, ChatPlayground } from '@/components';

type NavItem = 'playground' | 'profiles' | 'tools';

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavItem>('playground');

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="flex-1 overflow-hidden">
        {activeNav === 'playground' && <ChatPlayground />}
      </main>
    </div>
  );
}
