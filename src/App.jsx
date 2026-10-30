import React from 'react';
import { useRoute } from './lib/router.js';
import { PublicHeader, PublicFooter } from './components/Shell.jsx';
import { Toast } from './components/ui.jsx';
import Home from './pages/site/Home.jsx';
import StandardPage from './pages/site/StandardPage.jsx';
import Estimator from './pages/site/Estimator.jsx';
import Verified from './pages/site/Verified.jsx';
import Verify from './pages/site/Verify.jsx';
import Brands from './pages/site/Brands.jsx';
import Join from './pages/site/Join.jsx';
import Studio from './pages/studio/Studio.jsx';
import Admin from './pages/admin/Admin.jsx';

const SITE = { home: Home, standard: StandardPage, estimator: Estimator, verified: Verified, verify: Verify, brands: Brands, join: Join };

export default function App() {
  const route = useRoute();
  if (route.area === 'studio') return <div className="min-h-screen bg-white text-ink"><Studio route={route} /><Toast /></div>;
  if (route.area === 'admin') return <div className="min-h-screen bg-white text-ink"><Admin route={route} /><Toast /></div>;
  const Page = SITE[route.page] || Home;
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <PublicHeader page={route.page} />
      <div className="flex-1"><Page id={route.id} /></div>
      <PublicFooter />
      <Toast />
    </div>
  );
}
