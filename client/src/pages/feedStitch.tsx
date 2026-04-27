import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Component() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#10131b] min-h-screen text-[#e0e2ee]">
      <header className="fixed top-0 w-full rounded-b-2xl bg-slate-950/70 backdrop-blur-xl border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)] z-[100] flex justify-between items-center px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-cyan-500/30">
<img className="w-full h-full object-cover" data-alt="Celestial Guardian profile silhouette glowing in neon cyan and magenta light with a futuristic abstract atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeV9WyH2E1O3v9IEkYr6U8zuRpDuOob1yWfn_Ffp00gvRz6pL2hNx11CY73kAQqhyUb9YT0vY5yM6BSV_sArQ9tyk2K-Cns1FH0zphy7w3F20uUYtFNTi5ElUb6zEYUWH1BQBsNFTiyoSyRdGDvapQPPMF84404akZyut0K2jcNT1V1OAaeKWMxKeMoSotE8c9OOW3xGzcOnP00vZ0gceqhgM8g8NzfJ5tPbwhmUsNU_ruhqlncfayMo-eeBwc3idqPus6DuUiQwT9"/>
</div>
<span className="text-xl font-bold tracking-tighter text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] font-['Inter']">hectate Sanctuary</span>
</div>
<div className="flex items-center gap-4">
<button className="text-cyan-400 hover:text-cyan-300 transition-colors p-2">
<span className="material-symbols-outlined" data-icon="shield_with_heart">shield_with_heart</span>
</button>
</div>
</header>

<main className="pt-24 px-6 max-w-lg mx-auto cosmic-gradient">

<section className="mb-12 text-center">
<h1 className="text-4xl font-bold tracking-tight text-primary-fixed mb-2">Community Pulse</h1>
<p className="text-on-surface-variant font-light body-lg">Anonymous alerts and safety signals from your circle.</p>
</section>

<div className="perspective-container flex flex-col gap-12 pb-20">

<div className="depth-card-1 glass-panel rounded-2xl p-6 neon-border-magenta transition-all duration-500 relative group">
<div className="absolute -top-3 -right-3">
<span className="flex h-6 w-6 relative">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
<span className="relative inline-flex rounded-full h-6 w-6 bg-secondary"></span>
</span>
</div>
<div className="flex justify-between items-start mb-4">
<div className="px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary/30">
<span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Urgent Alert</span>
</div>
<span className="text-on-surface-variant text-xs font-light">2 mins ago</span>
</div>
<h2 className="text-2xl font-bold text-secondary mb-3 tracking-tight">Heavy Congestion: Neon District</h2>
<p className="text-on-surface-variant leading-relaxed mb-6 font-light">Unusual activity reported near the North Metro entrance. Several guardians suggest using the bypass route through Sector 7.</p>
<div className="flex items-center gap-4 border-t border-white/5 pt-4">
<div className="flex -space-x-2">
<div className="w-8 h-8 rounded-full bg-surface-container border border-background flex items-center justify-center">
<span className="material-symbols-outlined text-[14px] text-cyan-400" data-icon="visibility">visibility</span>
</div>
<div className="w-8 h-8 rounded-full bg-surface-container border border-background flex items-center justify-center">
<span className="material-symbols-outlined text-[14px] text-cyan-400" data-icon="bolt">bolt</span>
</div>
</div>
<span className="text-xs text-on-surface-variant font-semibold">12 Guardians Active Nearby</span>
</div>
</div>

<div className="depth-card-2 glass-panel rounded-2xl p-6 ghost-border transition-all duration-500">
<div className="flex justify-between items-start mb-4">
<div className="px-3 py-1 rounded-full bg-primary-fixed/10 border border-primary-fixed/20">
<span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Guardian Tip</span>
</div>
<span className="text-on-surface-variant text-xs font-light">1 hour ago</span>
</div>
<h2 className="text-xl font-bold text-on-surface mb-3 tracking-tight">The Midnight Path Protocol</h2>
<p className="text-on-surface-variant leading-relaxed mb-4 font-light italic">"Always keep your device in Stealth Mode when crossing the park after 11 PM. The proximity sensor is your best ally."</p>
<div className="flex justify-between items-center">
<button className="text-cyan-400 flex items-center gap-1 text-sm font-semibold">
<span className="material-symbols-outlined text-[18px]" data-icon="thumb_up">thumb_up</span>
<span>42 Trust Signals</span>
</button>
<span className="material-symbols-outlined text-on-surface-variant/30" data-icon="more_horiz">more_horiz</span>
</div>
</div>

<div className="depth-card-3 glass-panel rounded-2xl p-6 ghost-border transition-all duration-500">
<div className="flex justify-between items-start mb-4">
<div className="px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Community Note</span>
</div>
<span className="text-on-surface-variant text-xs font-light">3 hours ago</span>
</div>
<h2 className="text-xl font-bold text-on-surface mb-3 tracking-tight">Lighting Malfunction</h2>
<p className="text-on-surface-variant leading-relaxed font-light">The smart streetlights on 4th Ave are flickering. Reported to city maintenance, but avoid for now.</p>
</div>

<div className="depth-card-4 glass-panel rounded-2xl p-6 ghost-border transition-all duration-500">
<div className="flex justify-between items-start mb-4">
<div className="px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Archived Signal</span>
</div>
</div>
<h2 className="text-xl font-bold text-on-surface-variant/50 mb-3 tracking-tight">Verification Check Required</h2>
<p className="text-on-surface-variant/30 leading-relaxed font-light">Routine security scan complete for the downtown perimeter. All nodes reporting stable status.</p>
</div>
</div>
</main>



<nav className="fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center px-4 pb-6 pt-2 bg-slate-950/80 backdrop-blur-2xl border-t border-cyan-500/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] rounded-t-3xl">
<div className="flex flex-col items-center justify-center text-slate-500 opacity-60 hover:opacity-100 hover:text-fuchsia-400 transition-all">
<span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
<span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-widest mt-1">Sanctuary</span>
</div>
<div className="flex flex-col items-center justify-center text-cyan-400 bg-cyan-500/10 rounded-2xl px-4 py-1 shadow-[0_0_15px_rgba(0,255,255,0.2)] scale-110 transition-transform duration-500 ease-out">
<span className="material-symbols-outlined" data-icon="emergency_share" style={{ fontVariationSettings: '\'FILL\' 1' }}>emergency_share</span>
<span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-widest mt-1">Pulse</span>
</div>
<div className="flex flex-col items-center justify-center text-slate-500 opacity-60 hover:opacity-100 hover:text-fuchsia-400 transition-all">
<span className="material-symbols-outlined" data-icon="security">security</span>
<span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-widest mt-1">Guardian</span>
</div>
<div className="flex flex-col items-center justify-center text-slate-500 opacity-60 hover:opacity-100 hover:text-fuchsia-400 transition-all">
<span className="material-symbols-outlined" data-icon="fingerprint">fingerprint</span>
<span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-widest mt-1">Vault</span>
</div>
</nav>

<div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
<div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full"></div>
</div>
    </div>
  );
}
