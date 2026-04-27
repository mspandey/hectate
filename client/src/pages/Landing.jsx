import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Shield, 
  Lock, 
  MessageCircleHeart, 
  Scale, 
  Siren, 
  Users, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2,
  Phone
} from 'lucide-react'

// Asset Imports
import heroMain from '../assets/hero-main.png'
import heroAccent1 from '../assets/hero-accent-1.png'
import heroAccent2 from '../assets/hero-accent-2.png'
import verificationMain from '../assets/verification-main.png'
import gridVoices from '../assets/grid-voices.png'
import gridLegal from '../assets/grid-legal.png'
import gridResources from '../assets/grid-resources.png'
import gridAlerts from '../assets/grid-alerts.png'

import LandingNavbar from '../components/layout/LandingNavbar'
import LandingFooter from '../components/layout/LandingFooter'
import '../styles/Landing.css'

gsap.registerPlugin(ScrollTrigger)

// ── Typewriter Hook ──────────────────────────────────────────
function useTypewriter(fullText, speed = 60, startDelay = 300) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const delayTimer = setTimeout(() => {
      const timer = setInterval(() => {
        i++
        setDisplayed(fullText.slice(0, i))
        if (i >= fullText.length) {
          clearInterval(timer)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(timer)
    }, startDelay)
    return () => clearTimeout(delayTimer)
  }, [fullText, speed, startDelay])

  return { displayed, done }
}
// ─────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const mainRef = useRef(null)
  const productRef = useRef(null)

  const line1 = 'Hectate —'
  const line2 = "Safety isn't optional here."
  const { displayed: typed1, done: done1 } = useTypewriter(line1, 80, 400)
  const { displayed: typed2, done: done2 } = useTypewriter(
    done1 ? line2 : '',
    55,
    180
  )

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance
      gsap.from('.gsap-reveal', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out'
      })

      gsap.from('.hero-visual-v2', {
        scale: 0.9,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out'
      })

      // 2. Parallax Scrolling for Hero Accents removed as accents are removed

      // card-2 removed

      // 3. Product Rotation & Scale (The core user request)
      gsap.fromTo('.product-img', 
        { scale: 0.8, opacity: 0, rotationY: -15 },
        {
          scale: 1,
          opacity: 1,
          rotationY: 15,
          scrollTrigger: {
            trigger: '.product-showcase',
            start: 'top 80%',
            end: 'bottom top',
            scrub: 1.5,
          }
        }
      )

      // 4. Reveal Animations for sections
      const sections = gsap.utils.toArray('.reveal-section')
      sections.forEach(section => {
        gsap.from(section, {
          opacity: 0,
          y: 50,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        })
      })

      // 5. Grid Item Stagger
      gsap.from('.grid-card-v2', {
        scale: 0.9,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.grid-v2',
          start: 'top 80%'
        }
      })

    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="landing-v2" ref={mainRef}>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="hero-v2">
        <div className="hero-text-content">

                    <h1 className="hero-title-v2 gsap-reveal typewriter-hero">
            <span className="typewriter-line1">
              {typed1}
              {!done1 && <span className="typewriter-cursor">|</span>}
            </span>
            <br />
            <span className="gradient-text typewriter-line2">
              {typed2}
              {done1 && !done2 && <span className="typewriter-cursor gradient-cursor">|</span>}
            </span>
          </h1>
          <p className="hero-description-v2 gsap-reveal">
            Hectate is a premium, women-only ecosystem for verified support, 
            legal advocacy, and community safety. Your voice, protected.
          </p>
          <div className="hero-actions gsap-reveal">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/join')}>
              Get Verified <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/feed')}>
              Explore Community
            </button>
          </div>
        </div>

        <div className="hero-visual-v2">
          <div className="hero-images gsap-reveal">
            <div className="hero-images-stack">
              <img src={heroAccent1} alt="Accent 1" className="hero-accent-img accent-1" />
              <img src={heroAccent2} alt="Accent 2" className="hero-accent-img accent-2" />
              <img src={heroMain} alt="Hectate Main" className="hero-main-img-v2" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase / Verification Section */}
      <section className="section-v2 product-showcase">
        <div className="bg-text-watermark">HECTATE</div>
        
        <div className="journal-sidebar-text">ISSUE NO. 01 — IDENTITY</div>
        <div className="journal-page-num">02</div>

        <div className="content-centered reveal-section">
          <div className="section-label">Identity Gate</div>
          <h2 className="section-title text-center">Secure Your <br />Community Access</h2>
          <p className="section-sub text-center mx-auto">
            Our multi-factor verification ensures every profile is a verified woman. 
            We use advanced AI to validate Aadhaar and face-match in real-time.
          </p>
          
          <div className="artisanal-reveal-container" ref={productRef}>
            <div className="reveal-mask"></div>
            <img src={verificationMain} alt="Verification System" className="product-img" />
          </div>

          <div className="feature-list-centered">
            <div className="feature-item">
              <CheckCircle2 color="#60A5FA" size={20} /> 
              <span>Zero fake accounts guaranteed</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 color="#60A5FA" size={20} /> 
              <span>End-to-end identity encryption</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 color="#60A5FA" size={20} /> 
              <span>Privacy-first data handling</span>
            </div>
          </div>

          <button className="btn btn-primary btn-lg mt-12" onClick={() => navigate('/join')}>
            Start Verification <ChevronRight size={16} />
          </button>
        </div>
      </section>


      {/* Call to Action Banner */}
      <section className="section-v2 reveal-section">
        <div className="verify-banner-v2">
          <div className="verify-bg-glow"></div>
          <h2 className="gradient-text" style={{fontSize:48, fontWeight: 700, marginBottom:24, position:'relative'}}>
            Ready to join the safest <br />community for women?
          </h2>
          <p style={{color:'var(--text-muted)', fontSize:18, marginBottom:40, maxWidth:600, margin: '0 auto 40px', position:'relative'}}>
            Join 12,000+ women who trust Hectate for their safety, 
            support, and sisterhood.
          </p>
          <button className="btn btn-primary btn-lg" style={{position:'relative'}} onClick={() => navigate('/join')}>
            Join Hectate Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

    </div>
  )
}
