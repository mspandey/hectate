import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Component() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#10131b] min-h-screen text-[#e0e2ee]">
      <nav className="fixed top-0 w-full z-50 bg-[#10131b]/70 backdrop-blur-3xl border-b border-[#00FFFF]/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
<div className="flex justify-between items-center px-8 py-4 max-w-full">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[#00FFFF]" style={{ fontVariationSettings: '\'FILL\' 1' }}>shield_with_heart</span>
<span className="text-2xl font-black tracking-[-0.02em] text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] font-headline">hectate</span>
</div>
<button className="bg-[#00FFFF] text-[#002020] px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase hover:scale-105 transition-transform active:scale-95 glow-cyan">
                ENTER SANCTUARY
            </button>
</div>
</nav>
<main className="relative pt-24 pb-20 overflow-hidden">

<div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px] -z-10"></div>
<div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[120px] -z-10"></div>

<section className="px-6 mb-24 relative">
<div className="max-w-md mx-auto text-center mb-12">
<h1 className="text-5xl font-black font-headline tracking-tighter leading-none mb-6">
                    YOUR <span className="text-[#00FFFF]">SIGNAL</span><br/>
                    IN THE <span className="text-[#FF00FF]">PULSE</span>
</h1>
<p className="text-on-surface-variant font-light leading-relaxed px-4">
                    Hectate — Where your safety isn't optional. The first 100% verified space for women.
                </p>
</div>

<div className="relative max-w-sm mx-auto perspective-1000 group">
<div className="glass-panel rounded-3xl p-8 depth-shadow transform rotate-x-6 rotate-y--6 transition-all duration-500 hover:rotate-0">
<div className="flex justify-between items-start mb-12">
<div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00FFFF] to-[#FF00FF] p-[2px]">
<div className="w-full h-full rounded-full bg-[#10131b] flex items-center justify-center">
<span className="material-symbols-outlined text-[#00FFFF]" style={{ fontVariationSettings: '\'FILL\' 1' }}>verified</span>
</div>
</div>
<div className="text-right">
<span className="block text-[10px] font-bold text-[#00FFFF] tracking-widest uppercase mb-1">Status</span>
<span className="text-on-surface font-light text-sm">Active Network</span>
</div>
</div>
<div className="mb-8">
<h2 className="text-2xl font-bold font-headline mb-2">Guardian Shield v2.4</h2>
<p className="text-xs text-on-surface-variant opacity-70">Secured with Biometric Luminescence</p>
</div>
<div className="flex items-center gap-4">
<div className="flex -space-x-3">
<div className="w-8 h-8 rounded-full border-2 border-[#10131b] overflow-hidden">
<img alt="User avatar" className="w-full h-full object-cover" data-alt="Close-up portrait of a young Indian woman with professional lighting, soft cinematic focus, and a warm, glowing skin tone." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw-9QB4mgWS52PM6LOe5RUT10bFO1bKXROVz3CcDKJqhf01S7c3koAdhLyANGuFFI9gR5CPwDIqWxcrjdg9ubEib4JS1mLm-Fj4yNFIsvjAd1nKLRcRNjnaSD-aNnHDNDw9HtKWeWh6GAu7ShIvyVOvln0pS02amcUlqoszNjmSrpGK-TBzEFLUJ3iFO4ZUQLPRgJwQeccKRXmkGTl0STirrKLctcOvf64OXysEU6ZoOArU3WJIcn-97p6WMEGqMNqiL_YrgDZ5TKv"/>
</div>
<div className="w-8 h-8 rounded-full border-2 border-[#10131b] overflow-hidden">
<img alt="User avatar" className="w-full h-full object-cover" data-alt="Close-up portrait of a smiling Indian woman in an urban setting with neon city lights softly blurred in the background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9N3N0ggG-mq5E00J8oXAP1LqZVjRtwMJrjfjiVMOBkBl5ycF26dsmvtta8uLURWe1kP25XIuiH3LToVNnPggPEV9VmZImICqRjiJO6bcbr4Q5o7wcEq37ppNkadZSyz6wIKoYy13lKTVJLJg4bNupVG4XN280QBMQDKoNDmBELqS_7-Ub2m20GPwNScJ_vD892I_esiYHxOtOS4zHaXghr8jJHweEzlETQCMQa5n70STObr6N7UssQXOI5TrOtzwt0qb8oZ76geVZ"/>
</div>
<div className="w-8 h-8 rounded-full border-2 border-[#10131b] overflow-hidden">
<img alt="User avatar" className="w-full h-full object-cover" data-alt="Close-up artistic portrait of an Indian woman with elegant jewelry and dramatic teal and magenta rim lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5CcW221LXNec7YW4zzoXnOzes-RGwZCrlT7hvdKuYs0rk2uadDvOYZDeb67aVk3Qs2HcjPnhCY2spsNCV9zPdMM5WkL1w9zCChxwzPGt2BbQV-unG647DDkn4khOx9ssAE062VVjRaxVKubu2HBUCOTXpf7r3nsF2es_gX5EwRiFmPh1oD3T7Li5XBNywfoeBgeirmqBlXq7eHi6Ma94zNy-qLl_OTqdBcG88lMAJGBPEmw0KGyT_xWCsjgKeLna_RaiO-kh8M4eh"/>
</div>
</div>
<span className="text-[10px] font-semibold text-on-surface-variant">+4.2k Online</span>
</div>
</div>

<div className="absolute -bottom-6 right-8 w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center glow-magenta animate-pulse cursor-pointer">
<span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>emergency_share</span>
</div>
</div>
</section>

<section className="px-6 mb-24">
<div className="flex items-end justify-between mb-8 border-b border-[#00FFFF]/10 pb-4">
<div>
<h3 className="text-[#00FFFF] font-bold text-sm tracking-widest uppercase mb-1">Section 01</h3>
<h2 className="text-3xl font-bold font-headline">The Signal</h2>
</div>
<span className="material-symbols-outlined text-[#00FFFF]/50">radar</span>
</div>
<div className="glass-panel rounded-2xl overflow-hidden aspect-[4/5] relative">
<img alt="Real-time safety map" className="w-full h-full object-cover opacity-60" data-alt="A stylized night map of Mumbai with electric cyan routes, glowing magenta hotspots, and futuristic data overlays in a dark UI style." data-location="Mumbai" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY6gPXHgqK8R6J4ueWXDOQjfz6pEUZpjqwp1CEGA9a5H8NCnfDbbKk3_mGYgTcXuqVAPMpNjHjclx3m22OvkBgXivWlpMVd3kMpQj-7YFN0voZet9QpiaT_2QDxHYkFzfZD_0SIh-wpm_C28lb97fNVbnR_jMJ01OByCEEM-QKBWi3KPtQhMgt3gefposUP4xFD4LIv4gPt_ydnk0o3RCpApH0CDHc7pNGMYBd_CLFFcITINWibxsRDIdqYqBFn9uFdhpjrixCG9Rx"/>
<div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-transparent to-transparent"></div>

<div className="absolute bottom-6 left-6 right-6 p-6 glass-panel rounded-xl">
<div className="flex items-center gap-4 mb-4">
<div className="w-2 h-2 bg-[#00FFFF] rounded-full animate-ping"></div>
<span className="text-xs font-bold tracking-widest text-[#00FFFF]">LIVE NETWORK SCAN</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
<span className="text-[10px] text-on-surface-variant uppercase block">Guardians Nearby</span>
<span className="text-lg font-bold">124</span>
</div>
<div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
<span className="text-[10px] text-on-surface-variant uppercase block">Safe Zones</span>
<span className="text-lg font-bold">12</span>
</div>
</div>
</div>
</div>
</section>

<section className="px-6 mb-24">
<div className="flex items-end justify-between mb-8 border-b border-[#FF00FF]/10 pb-4">
<div>
<h3 className="text-[#FF00FF] font-bold text-sm tracking-widest uppercase mb-1">Section 02</h3>
<h2 className="text-3xl font-bold font-headline">The Pulse</h2>
</div>
<span className="material-symbols-outlined text-[#FF00FF]/50">favorite</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="col-span-2 glass-panel p-6 rounded-2xl border-l-4 border-[#FF00FF]">
<div className="flex items-center gap-3 mb-4">
<img className="w-10 h-10 rounded-full object-cover" data-alt="Portrait of a young Indian woman with bright neon background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY16aQoSpAF3uXlagUSqRMJtvb2LpKCbf9WBsYyJjCLhXS-IBo6u6DevGdFrlYdEWxuM3LFHAK3BSsSpgP9cJ0wgb7w3aDSnk5q1fFwviAQwPhxf_iqEqrhnMsjoi4RljouIf5UtoZjO4NBgyAHbVNASepbL67353N-YXZYCqhz_PyGtCubVQVAAk5oIJPfOg20y5UV6pZmtN9N_31KBuveZyyaLoIGnUt9b6BBRI0-x8uzjhPd1VTX_fb_HgNurKhv2mCuCYsdggF"/>
<div>
<p className="text-sm font-bold">Ananya R.</p>
<p className="text-[10px] text-on-surface-variant">Verified Member • 2m ago</p>
</div>
</div>
<p className="text-on-surface font-light text-sm mb-4">Just safely arrived at the Metro station. The walking path is well lit tonight. Safe travels everyone!</p>
<div className="flex gap-4">
<span className="material-symbols-outlined text-xs text-[#FF00FF]" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
<span className="material-symbols-outlined text-xs text-on-surface-variant">share</span>
</div>
</div>
<div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
<span className="material-symbols-outlined text-[#00FFFF] mb-4">groups</span>
<p className="text-xs font-bold leading-tight">Weekly Sanctuary Meetup</p>
<p className="text-[10px] text-on-surface-variant">42 attending</p>
</div>
<div className="glass-panel p-4 rounded-2xl bg-[#FF00FF]/5 flex flex-col justify-between">
<span className="material-symbols-outlined text-[#FF00FF] mb-4">campaign</span>
<p className="text-xs font-bold leading-tight">Safety Alert: Bandra East</p>
<p className="text-[10px] text-[#FF00FF]">Caution Advised</p>
</div>
</div>
</section>

<section className="px-6 mb-24">
<div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
<div>
<h3 className="text-on-surface-variant font-bold text-sm tracking-widest uppercase mb-1">Section 03</h3>
<h2 className="text-3xl font-bold font-headline">Protocols</h2>
</div>
<span className="material-symbols-outlined text-white/50">verified_user</span>
</div>
<div className="space-y-6">
<div className="flex items-center gap-6 p-6 glass-panel rounded-2xl">
<div className="w-12 h-12 flex-shrink-0 bg-surface-container-high rounded-xl flex items-center justify-center text-[#00FFFF]">
<span className="material-symbols-outlined">fingerprint</span>
</div>
<div>
<h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Biometric Binding</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Unique identity verification to prevent spoofing and unauthorized access.</p>
</div>
</div>
<div className="flex items-center gap-6 p-6 glass-panel rounded-2xl">
<div className="w-12 h-12 flex-shrink-0 bg-surface-container-high rounded-xl flex items-center justify-center text-[#FF00FF]">
<span className="material-symbols-outlined">network_check</span>
</div>
<div>
<h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Social Vouching</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Every member is verified by two existing guardians in the network.</p>
</div>
</div>
<div className="flex items-center gap-6 p-6 glass-panel rounded-2xl">
<div className="w-12 h-12 flex-shrink-0 bg-surface-container-high rounded-xl flex items-center justify-center text-white">
<span className="material-symbols-outlined">gpp_maybe</span>
</div>
<div>
<h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Zero-Leak Policy</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">End-to-end encryption for all location data and communication logs.</p>
</div>
</div>
</div>
</section>
</main>

<footer className="bg-[#10131b] w-full py-12 border-t border-[#00FFFF]/10">
<div className="flex flex-col items-center justify-center space-y-6 w-full px-6 text-center">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-[#00FFFF] text-sm">shield_with_heart</span>
<span className="text-lg font-black text-[#00FFFF] tracking-tight">hectate</span>
</div>
<p className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#00FFFF] max-w-xs leading-loose">
                © 2024 hectate. THE LUMINESCENT GUARDIAN.
            </p>
<div className="flex flex-wrap justify-center gap-6">
<a className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 hover:text-[#00FFFF] transition-colors" href="#">Privacy Shield</a>
<a className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 hover:text-[#00FFFF] transition-colors" href="#">Security Charter</a>
<a className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 hover:text-[#00FFFF] transition-colors" href="#">Network Access</a>
</div>
</div>
</footer>

<nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel rounded-t-3xl border-t-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
<div className="flex justify-around items-center h-16 px-4">
<div className="flex flex-col items-center gap-1 text-[#00FFFF]">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '\'FILL\' 1' }}>radar</span>
<span className="text-[8px] font-bold uppercase tracking-tighter">The Signal</span>
</div>
<div className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">favorite</span>
<span className="text-[8px] font-bold uppercase tracking-tighter">Pulse</span>
</div>
<div className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">groups</span>
<span className="text-[8px] font-bold uppercase tracking-tighter">Sanctuary</span>
</div>
<div className="flex flex-col items-center gap-1 text-slate-400">
<span className="material-symbols-outlined">verified_user</span>
<span className="text-[8px] font-bold uppercase tracking-tighter">Security</span>
</div>
</div>
</nav>
    </div>
  );
}
