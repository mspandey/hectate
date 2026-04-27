import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Component() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#10131b] min-h-screen text-[#e0e2ee]">
      <div className="orb orb-cyan"></div>
<div className="orb orb-magenta"></div>

<header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary-fixed text-2xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>shield_person</span>
<span className="text-2xl font-bold tracking-tighter text-primary-fixed drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] font-inter">hectate</span>
</div>
<div className="flex items-center gap-6">
<button className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest hover:text-primary-fixed transition-colors">Help</button>
<button className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest hover:text-primary-fixed transition-colors">Privacy</button>
</div>
</header>

<main className="relative z-10 w-full max-w-md px-6">
<div className="glass-panel rounded-3xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-outline-variant/20 relative overflow-hidden">

<div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-fixed/5 blur-3xl rounded-full"></div>
<div className="relative z-10">

<div className="mb-10 text-center">
<h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Welcome Back</h1>
<p className="text-on-surface-variant body-lg font-light">Your safety sanctuary is just a heartbeat away.</p>
</div>

<form className="space-y-8">
<div className="space-y-6">

<div className="group relative">
<label className="absolute -top-3 left-4 px-1 bg-surface-container-highest text-[10px] font-semibold uppercase tracking-widest text-primary-fixed z-20">Identity Link</label>
<div className="flex items-center bg-surface-container-low rounded-xl border border-outline-variant/30 px-4 py-4 transition-all duration-300 input-glow">
<span className="material-symbols-outlined text-on-surface-variant mr-3 group-focus-within:text-primary-fixed">fingerprint</span>
<input className="bg-transparent border-none focus:ring-0 text-on-surface w-full placeholder:text-on-surface-variant/40 placeholder:font-light" placeholder="Enter Mobile Number or Aadhaar" type="text"/>
</div>
</div>
<div className="flex items-center justify-between px-2">
<label className="flex items-center gap-2 cursor-pointer group">
<input className="rounded border-outline-variant/30 bg-surface-container text-primary-fixed focus:ring-primary-fixed focus:ring-offset-surface" type="checkbox"/>
<span className="text-xs text-on-surface-variant font-medium group-hover:text-on-surface">Remember Device</span>
</label>
<a className="text-xs text-secondary font-semibold hover:opacity-80" href="#">Trouble Signing In?</a>
</div>
</div>

<button className="w-full bg-primary-fixed text-on-primary-fixed font-bold py-5 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3" type="button">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '\'FILL\' 1' }}>bolt</span>
                        Send Security Pulse (OTP)
                    </button>
</form>

<div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
<p className="text-on-surface-variant text-sm font-light">
                        New to the community? 
                        <a className="text-primary-fixed font-semibold ml-1 hover:underline" href="#">Create Secure Vault</a>
</p>
</div>
</div>
</div>

<div className="mt-8 grid grid-cols-2 gap-4 opacity-60">
<div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>verified_user</span>
</div>
<div>
<p className="text-[10px] font-bold text-on-surface tracking-wide uppercase">Encrypted</p>
<p className="text-[8px] text-on-surface-variant">256-bit AES</p>
</div>
</div>
<div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-fixed/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-fixed text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>diversity_3</span>
</div>
<div>
<p className="text-[10px] font-bold text-on-surface tracking-wide uppercase">Community</p>
<p className="text-[8px] text-on-surface-variant">Verified Guardians</p>
</div>
</div>
</div>
</main>

<footer className="fixed bottom-6 w-full text-center z-50 pointer-events-none">
<p className="text-[10px] text-on-surface-variant/40 font-semibold tracking-[0.2em] uppercase">Trusted by 2M+ Women Across Bharat</p>
</footer>

<div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );
}
