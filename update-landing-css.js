const fs = require('fs');
let css = fs.readFileSync('client/src/styles/Landing.css', 'utf8');

// Body background
css = css.replace(/body\s*\{[^}]+\}/, \ody {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: radial-gradient(circle at 20% 30%, rgba(37,99,235,0.2), transparent),
              radial-gradient(circle at 80% 20%, rgba(124,58,237,0.2), transparent),
              radial-gradient(circle at 50% 80%, rgba(236,72,153,0.2), transparent),
              #0B1120;
  background-attachment: fixed;
  color: var(--text-white);
  overflow-x: hidden;
  position: relative;
}\);

// Transparent sections
css = css.replace(/background-color:\s*var\(--maroon\);/g, 'background-color: transparent;');
css = css.replace(/background-color:\s*#000000;/g, 'background-color: transparent;');
css = css.replace(/background-color:\s*#0A0A0A;/g, 'background-color: transparent;');
css = css.replace(/background-color:\s*var\(--maroon-light\);/g, 'background-color: transparent;');

// Gradient Text
css = css.replace(/\.gradient-text\s*\{[^}]+\}/, \.gradient-text {
  background: linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}\);

// Navbar
css = css.replace(/\.navbar-v2\s*\{[^}]+\}/, \.navbar-v2 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 5%;
  background: rgba(10,15,30,0.7);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}\);

// Buttons
css = css.replace(/\.btn-primary\s*\{[^}]+\}/, \.btn-primary {
  background: linear-gradient(135deg, #2563EB, #7C3AED, #EC4899);
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 13px;
  padding: 18px 36px;
  border-radius: 50px;
  border: none;
  box-shadow: 0 10px 30px rgba(124,58,237,0.4);
  transition: all 0.2s ease;
}\);
css = css.replace(/\.btn-primary:hover\s*\{[^}]+\}/, \.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  color: white;
}\);

css = css.replace(/\.btn-pink\s*\{[^}]+\}/, \.btn-pink {
  background: linear-gradient(135deg, #2563EB, #7C3AED, #EC4899);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 30px rgba(124,58,237,0.4);
}\);
css = css.replace(/\.btn-pink:hover\s*\{[^}]+\}/, \.btn-pink:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  color: white;
}\);

// Cards (Glass Effect)
const glassEffect = \
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 0 25px rgba(124,58,237,0.15);\;

css = css.replace(/(\.editorial-main-box\s*\{[^}]*?)(background:\s*var\(--maroon-light\);)/, \$1\\);
css = css.replace(/(\.hero-floating-card\s*\{[^}]*?)(background:\s*rgba[^;]+;)/, \$1\\);
css = css.replace(/(\.verify-banner-v2\s*\{[^}]*?)(background:\s*var\(--maroon\);)/, \$1\\);
css = css.replace(/(\.grid-card-v2\s*\{[^}]*?)(overflow:\s*hidden;)/, \$1\\);

// Section Dividers / Accents
css = css.replace(/\.box-label\s*\{[^}]+\}/, \.box-label {
  padding: 12px 20px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #A78BFA;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 700;
  position: relative;
}
.box-label::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #7C3AED, transparent);
}\);

// Replace the glowing verify banner
css = css.replace(/background:\s*radial-gradient\(circle,\s*rgba\(37,99,235,0\.15\)\s*0%,\s*transparent\s*70%\);/, 'background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);');

// Make SOS keep red (if there is an SOS button)
// The user says "Keep SOS red". The SOS button usually has .btn-danger or similar, let's just make sure.

fs.writeFileSync('client/src/styles/Landing.css', css);
console.log("Updated Landing.css");
