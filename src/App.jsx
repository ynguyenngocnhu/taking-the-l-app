import React from 'react';
import { useRoute } from './lib/router.js';
import { TopBar } from './components/Shell.jsx';
import { Toast } from './components/ui.jsx';
import Standard from './pages/site/Standard.jsx';
import Studio from './pages/studio/Studio.jsx';
import Admin from './pages/admin/Admin.jsx';

export default function App() {
  const route = useRoute();
  return (
    <div className="min-h-screen bg-white text-ink">
      <TopBar area={route.area} />
      {route.area === 'standard' && <Standard />}
      {route.area === 'studio' && <Studio route={route} />}
      {route.area === 'admin' && <Admin route={route} />}
      <Toast />
    </div>
  );
}
