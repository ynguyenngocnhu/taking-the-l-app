import React, { useMemo, useState } from 'react';
import { BarChart3, Megaphone, Users, ClipboardCheck, SlidersHorizontal, Trophy } from 'lucide-react';
import { SideLayout, ResetDemo } from '../../components/Shell.jsx';
import { Avatar } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import Overview from './Overview.jsx';
import { CampaignsAdmin } from './Campaigns.jsx';
import { CreatorsAdmin, CreatorProfile } from './Creators.jsx';
import Review from './Review.jsx';
import { Benchmarks, Leaderboard } from './Standard.jsx';

export default function Admin({ route }) {
  const { state } = useStore();
  const pending = state.posts.filter((p) => p.status === 'review').length;
  const pageKey = { '': 'overview', creator: 'creators' }[route.page] ?? route.page;
  const items = [
    { key: 'overview', label: 'Overview', Icon: BarChart3, to: 'admin' },
    { key: 'campaigns', label: 'Campaigns', Icon: Megaphone, to: 'admin-campaigns' },
    { key: 'creators', label: 'Creators', Icon: Users, to: 'admin-creators' },
    { key: 'review', label: 'Submission review', Icon: ClipboardCheck, to: 'admin-review', badge: pending || null },
    { key: 'standard', label: 'L Standard', Icon: SlidersHorizontal, to: 'admin-standard' },
    { key: 'leaderboard', label: 'Leaderboard', Icon: Trophy, to: 'admin-leaderboard' },
  ];
  const user = (
    <span className="mt-2 flex items-center gap-2.5">
      <Avatar name="Programme Admin" size={34} />
      <span className="flex flex-col leading-tight"><b className="text-[14px]">Programme admin</b><span className="text-[12px] text-mute">L'Oréal SAPMENA</span></span>
    </span>
  );
  let body;
  switch (route.page) {
    case 'campaigns': body = <CampaignsAdmin />; break;
    case 'creators': body = <CreatorsAdmin />; break;
    case 'creator': body = <CreatorProfile id={route.id} />; break;
    case 'review': body = <Review />; break;
    case 'standard': body = <Benchmarks />; break;
    case 'leaderboard': body = <Leaderboard />; break;
    default: body = <Overview />;
  }
  return (
    <SideLayout title="Admin Console" user={user} items={items} current={pageKey} footer={<ResetDemo />}>
      <div key={route.page + route.id} className="rise">{body}</div>
      <div className="mt-12 lg:hidden"><ResetDemo /></div>
    </SideLayout>
  );
}
