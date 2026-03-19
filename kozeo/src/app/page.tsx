"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageLoader } from "../components/common/PageLoader";
import { WordReveal, HeaderReveal } from "../components/common/ScrollReveal";

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 40, startDelay = 0, startTyping = true) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!startTyping) return;

    setDisplayedText("");
    setIsTyping(false);
    setIsComplete(false);

    let timeout: NodeJS.Timeout;
    const startInitialDelay = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      
      const typeNextChar = () => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
          // Add slight random variance to typing speed for a realistic feel
          const currentSpeed = speed + (Math.random() - 0.5) * (speed * 0.5);
          timeout = setTimeout(typeNextChar, currentSpeed);
        } else {
          setIsTyping(false);
          setIsComplete(true);
        }
      };
      
      typeNextChar();
    }, startDelay);

    return () => {
      clearTimeout(startInitialDelay);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay, startTyping]);

  return { displayedText, isTyping, isComplete };
}

// ─── Canvas Dash Field — 120 wandering dashes, soft rotary wave physics ───────
type Dash = {
  x: number; y: number;           // current px position
  vx: number; vy: number;         // physics velocity (mouse influence)
  baseVx: number; baseVy: number; // constant ambient drift velocity
  baseX: number; baseY: number;   // base position (% of canvas size → px)
  length: number;                 // dash length px
  width: number;                  // dash width px
  baseAlpha: number;              // resting opacity 0.1–0.35
  phase: number;                  // idle pulse phase offset
  speed: number;                  // idle pulse speed
  rx: number; ry: number;         // drift phase
  ox: number; oy: number;         // drift amplitude
};

const DotField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const frameRef = useRef<number>(0);
  const dashesRef  = useRef<Dash[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // --- Build radiating dash field with more gaps ------------------------
    const initDashes = (w: number, h: number) => {
      dashesRef.current = Array.from({ length: 200 }, () => { // Increased count for denser field
        const bx = Math.random();
        const by = Math.random();
        return {
          x: bx * w, y: by * h,
          vx: 0, vy: 0,
          baseVx: (Math.random() - 0.5) * 0.4, // ambient random drift
          baseVy: (Math.random() - 0.5) * 0.4,
          baseX: bx, baseY: by,
          length: 3 + Math.random() * 3, // Smaller size: 3px to 6px
          width: 1 + Math.random() * 1,  // Thinner: 1px to 2px
          baseAlpha: 0.35 + Math.random() * 0.45, // Increased resting opacity so they are normally visible (0.35 to 0.8)
          phase: Math.random() * Math.PI * 2,
          speed: 0.005 + Math.random() * 0.01,
          rx: Math.random() * Math.PI * 2,
          ry: Math.random() * Math.PI * 2,
          ox: (Math.random() - 0.5) * 35, // wandering radius
          oy: (Math.random() - 0.5) * 35,
        };
      });
    };

    // --- Resize handler ---------------------------------------------------
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      initDashes(w, h);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // --- Physics constants ------------------------------------------------
    const SPRING_K = 0.035;  // Tension pulling back to wandering base
    const DAMPING = 0.82;    // Friction for bouncy/squishy effect
    const RADIUS = 280;      // Mouse influence radius
    const REPEL_FORCE = 4.5; // Strength of the 3D concave push

    // --- Draw loop --------------------------------------------------------
    let t = 0;
    const draw = () => {
      t += 0.01; // Global time for ambient wave math
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const rect = canvas.getBoundingClientRect();

      ctx.clearRect(0, 0, w, h);

      for (const dash of dashesRef.current) {
        // Idle pulse
        dash.phase += dash.speed;
        const pulse = (Math.sin(dash.phase) + 1) / 2;

        // Apply constant ambient drift
        dash.x += dash.baseVx;
        dash.y += dash.baseVy;

        // Wrap around screen beautifully
        if (dash.x < 0) dash.x += w;
        if (dash.x > w) dash.x -= w;
        if (dash.y < 0) dash.y += h;
        if (dash.y > h) dash.y -= h;

        // Target base position = Layout position + wandering Brownian motion
        const tx = (dash.baseX * w) + Math.sin(t * 3 + dash.rx) * dash.ox;
        const ty = (dash.baseY * h) + Math.cos(t * 2 + dash.ry) * dash.oy;

        // Mouse position in canvas-local px
        const localMx = mx - rect.left;
        const localMy = my - rect.top;

        const dxM = dash.x - localMx;
        const dyM = dash.y - localMy;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM) || 1;
        const proximity = distM < RADIUS ? 1 - distM / RADIUS : 0;

        // Spring pulling back to wandering target
        const dxBase = tx - dash.x;
        const dyBase = ty - dash.y;
        let ax = dxBase * SPRING_K;
        let ay = dyBase * SPRING_K;

        // Concave 3D plushie repel from mouse
        if (proximity > 0) {
          // Quadratic falloff gives a soft, squishy gradient to the 3D push
          const force = Math.pow(proximity, 2) * REPEL_FORCE;
          ax += (dxM / distM) * force * 15;
          ay += (dyM / distM) * force * 15;
        }

        // Apply acceleration to velocity, then damping
        dash.vx += ax;
        dash.vy += ay;
        dash.vx *= DAMPING;
        dash.vy *= DAMPING;

        // Apply mouse velocity + friction
        dash.x += dash.vx;
        dash.y += dash.vy;

        // Calculate dynamic angle: always radiate out from screen center
        const angle = Math.atan2(dash.y - h / 2, dash.x - w / 2);

        // Alpha: base + idle pulse + subtle mouse glow (effect is little lesser)
        const alpha = Math.min(dash.baseAlpha + pulse * 0.1 + proximity * 0.4, 1);

        // Draw glow behind the dash when mouse is near
        if (proximity > 0.05) {
          const glowR = (dash.length / 2 + 3) + proximity * 15;
          const grad = ctx.createRadialGradient(dash.x, dash.y, 0, dash.x, dash.y, glowR);
          grad.addColorStop(0, `rgba(59,130,246,${proximity * 0.4})`);
          grad.addColorStop(1, `rgba(59,130,246,0)`);
          ctx.beginPath();
          ctx.arc(dash.x, dash.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Draw the radiating dash
        ctx.save();
        ctx.translate(dash.x, dash.y);
        ctx.rotate(angle); 
        
        ctx.beginPath();
        // Slightly lengthen the line based on proximity
        const activeLength = dash.length + proximity * 4;
        ctx.moveTo(-activeLength / 2, 0);
        ctx.lineTo(activeLength / 2, 0);
        
        ctx.lineWidth = dash.width + proximity * 1.0;
        ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
        ctx.lineCap = "round";
        ctx.stroke();
        
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    // --- Mouse tracking ---------------------------------------------------
    const onMove  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()               => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMove,  { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};


import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../store/userSlice";

// ─── Navbar ──────────────────────────────────────────────────────────────────
const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handler = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
      
      let overDark = false;
      const darkSections = ["dark-showcase", "cta-section"];
      
      for (const id of darkSections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the navbar (top 64px) is within this dark section
          if (rect.top <= 64 && rect.bottom > 64) {
            overDark = true;
            break;
          }
        }
      }
      setOnDark(overDark);
    };

    window.addEventListener("scroll", handler, { passive: true });
    handler(); // Initial check

    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActuallyDark = onDark;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-20 theme-transition transition-all duration-700 ease-out ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-black/5"
          : "bg-transparent border-transparent"
      } ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-20px]"}`}
    >
      <nav className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/kozeoLogo.png"
            alt="Kozeo"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span
            className={`font-semibold text-[15px] tracking-tight transition-colors duration-500 ${
              isActuallyDark ? "text-white" : "text-black"
            }`}
          >
            Kozeo
          </span>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Speedruns", href: "#dark-showcase" },
            { label: "Work Sprints", href: "#work-sprints" },
            { label: "Projects", href: "#projects" },
            { label: "Skill Forge", href: "/login" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm transition-colors duration-500 ${
                isActuallyDark
                  ? "text-white/70 hover:text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/Atrium"
              className={`text-sm px-6 py-2 rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                isActuallyDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              Open Atrium
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`hidden sm:block text-sm px-4 py-2 rounded-full transition-colors duration-500 ${
                  isActuallyDark
                    ? "text-white/80 hover:text-white"
                    : "text-black/70 hover:text-black"
                }`}
              >
                Login
              </Link>
              <Link
                href="/login?mode=signup"
                className={`text-sm px-5 py-2 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                  isActuallyDark
                    ? "bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

// ─── Scroll To Top ───────────────────────────────────────────────────────────
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-8 right-8 z-[60] w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { displayedText, isComplete } = useTypewriter("The Proof-First Portfolio\nfor Tech Pros.", 30, 1500);

  return (
    <section suppressHydrationWarning className="relative min-h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden pt-32 pb-16">
      <DotField />
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none opacity-50"
        style={{
          background: "radial-gradient(circle at 15% 15%, rgba(59,130,246,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl mx-auto gap-8">
        <div className="flex items-center gap-2.5 animate-fadeIn" style={{ animationDelay: "2s", opacity: 0 }}>
          <Image src="/kozeoLogo.png" alt="Kozeo" width={26} height={26} className="rounded-full" priority />
          <span className="text-black/80 font-medium text-[15px] tracking-tight">Kozeo</span>
        </div>

        <h1
          className="font-black text-black tracking-tight min-h-[2.2em] whitespace-pre-wrap"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4.8rem)", lineHeight: "1.02" }}
        >
          {displayedText}
          <span className="inline-block w-[4px] h-[0.85em] bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 ml-2 align-baseline animate-pulse rounded-full" />
        </h1>

        <div
          className={`transition-all duration-1000 ease-out flex flex-col items-center gap-8 ${
            isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <WordReveal 
            className="text-black/55 max-w-xl font-medium justify-center" 
            baseDelay={2.5}
          >
            Stop sending static resumes. Build a live, verifiable record of your skills by solving real startup challenges.
          </WordReveal>

          <HeaderReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold text-[15px] hover:bg-neutral-800 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300 shadow-xl"
              >
                Start Your First Speedrun
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-4 bg-white text-black/80 rounded-full font-bold text-[15px] hover:bg-neutral-50 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300 border border-black/10"
              >
                Browse Active Sprints
              </Link>
            </div>
          </HeaderReveal>
          
          <div className="flex items-center gap-6 mt-4 text-[11px] font-bold text-black/30 uppercase tracking-[0.2em]">
             <span>Verifiable</span>
             <div className="w-1 h-1 rounded-full bg-black/20" />
             <span>Proof-First</span>
             <div className="w-1 h-1 rounded-full bg-black/20" />
             <span>Career-Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Section: Feature Showcase ──────────────────────────────────────
import { DynamicShowcase } from "../components/common/DynamicShowcase";

const ShowcaseSection = () => (
  <section id="dark-showcase" suppressHydrationWarning className="bg-[#050505] min-h-screen w-full flex items-center relative overflow-hidden py-24 lg:py-0">
    {/* Remove the border-t to avoid sub-pixel rendering gaps if any, 
        or ensure it matches the background perfectly. */}
    <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 lg:py-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Text */}
        <div className="lg:col-span-5 space-y-8 text-white">
          <div className="space-y-4">
            <HeaderReveal>
              <h2
                className="font-black text-white tracking-tighter"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: "1.0" }}
              >
                Proven, Not
                <br />
                Just Claimed.
              </h2>
            </HeaderReveal>
            <WordReveal className="text-white/40 text-xl leading-relaxed font-medium">
              Kozeo is the world's first platform where every entry in your portfolio is backed by verifiable proof.
            </WordReveal>
          </div>
          
          <div className="space-y-6">
            {[
              { t: "Elite Speedruns", d: "Timed, high-stakes coding missions evaluated by AI." },
              { t: "Live Work Sprints", d: "Ship real features for fast-growing startups." },
              { t: "Dynamic Identity", d: "Export a verifiable proof-of-work history instantly." }
            ].map((f, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 group-hover:scale-150 transition-transform" />
                <div>
                  <h4 className="font-bold text-[17px] text-white">{f.t}</h4>
                  <p className="text-sm text-white/30 leading-snug">{f.d}</p>
                </div>
              </div>
            ))}
          </div>

          <HeaderReveal delay={0.3}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-black text-blue-400 hover:gap-4 transition-all"
            >
              EXPLORE THE ECOSYSTEM
            </Link>
          </HeaderReveal>
        </div>

        {/* Dynamic Visual */}
        <div className="lg:col-span-7">
           <DynamicShowcase />
        </div>
      </div>
    </div>
  </section>
);

// ─── Removed DarkShowcase as it's now part of the master dynamic showcase ───

// ─── Icon Strip + Tagline ──────────────────────────────────────────────────────
const ICONS = ["⟳", "←", "✓", "⊞", "⊡", "↑", "⬡", "⟨/⟩", "⎘", "→", "□", "⋮⋮", "✦", "▶_", "⊕", "⟳"];
const IconStripSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { displayedText } = useTypewriter(
    "Kozeo is our verifiable career platform, evolving the resume into the proof-first era.",
    40,
    0,
    isVisible
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} suppressHydrationWarning className="bg-white border-y border-black/5 py-32 relative overflow-hidden">
      <div className="relative overflow-hidden mb-16">
        <div className="icon-strip-track">
          {[...ICONS, ...ICONS].map((icon, i) => (
            <div
              key={i}
              className="shrink-0 mx-2 w-14 h-14 rounded-full bg-black/5 border border-black/8 flex items-center justify-center text-black/60 text-lg hover:bg-black/10 transition-colors cursor-default"
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <p
          className="font-semibold text-black tracking-tight leading-tight min-h-[3em] whitespace-pre-wrap"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
        >
          {displayedText}
          <span className="inline-block w-[3px] h-[0.9em] bg-gradient-to-b from-emerald-400 via-blue-500 to-purple-500 ml-2 align-baseline animate-pulse rounded-full" />
        </p>
      </div>
    </section>
  );
};

// ─── Agent-First / Work Sprints ────────────────────────────────────────────────
const WorkSprintsSection = () => (
  <section id="work-sprints" suppressHydrationWarning className="bg-[#f8f9fa] py-32 relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Text */}
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-5">
            <HeaderReveal>
              <h2
                className="font-semibold text-black tracking-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: "1.15" }}
              >
                A Proof-First
                <br />
                Experience
              </h2>
            </HeaderReveal>
            <WordReveal className="text-black/55 text-lg leading-relaxed max-w-sm">
              Run multiple sprints at the same time, across any skill domain, from
              one central mission control view.
            </WordReveal>
          </div>
          <HeaderReveal delay={0.4}>
            <Link
              href="/login"
              className="inline-block px-6 py-3 rounded-full border border-black/20 text-black/70 text-sm font-medium hover:border-black/40 hover:text-black hover:-translate-y-0.5 hover:shadow-sm active:scale-95 transition-all duration-300"
            >
              Explore Product
            </Link>
          </HeaderReveal>
        </div>

        {/* Inbox / Task card mockup */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-white rounded-2xl border border-black/8 shadow-xl overflow-hidden">
            {/* Gradient header */}
            <div
              className="h-24 w-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(219,234,254,0.8) 0%, rgba(236,252,203,0.6) 50%, rgba(254,243,199,0.5) 100%)",
              }}
            />
            {/* Inbox body */}
            <div className="p-5 space-y-2 -mt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-black/80 mb-3 px-1">
                <span>Sprints</span>
                <svg className="w-4 h-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              {[
                {
                  title: "Build a fintech dashboard UI",
                  time: "now",
                  sub: "sprint-2024-q1",
                  badge: null,
                },
                {
                  title: "API Integration Research",
                  time: "2 mins ago",
                  sub: "sprint-2024-q1",
                  badge: "⟳",
                },
                {
                  title: "React Performance Sprint",
                  time: "8 mins ago",
                  sub: "sprint-2024-q1",
                  badge: "Idle",
                  review: true,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-black/8 px-4 py-3.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-black/85">
                        {item.title}{" "}
                        <span className="text-black/35 font-normal">{item.time}</span>
                      </div>
                      <div className="text-xs text-black/40">{item.sub}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="text-xs text-black/40">{item.badge}</span>
                      )}
                      {item.review && (
                        <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-300">
                           Review
                        </button>
                      )}
                    </div>
                  </div>
                  {i === 2 && (
                    <div className="mt-2 text-xs text-black/40 leading-relaxed">
                      I&apos;ve finished the Sprint. You can see a summary of the work and a
                      verification video in the walkthrough.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Projects Section ──────────────────────────────────────────────────────────
const ProjectsSection = () => (
  <section id="projects" className="bg-white border-t border-black/6 py-24 lg:py-32">
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
        {/* Text */}
        <div className="lg:w-1/2 space-y-6">
          <HeaderReveal>
            <h2
              className="font-semibold text-black tracking-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: "1.15" }}
            >
              Your portfolio is
              <br />
              your new resume.
            </h2>
          </HeaderReveal>
          <WordReveal className="text-black/55 text-lg leading-relaxed max-w-md">
            Generate a dynamic profile URL packed with verifiable proof of your
            capabilities. Stand out to recruiters instantly.
          </WordReveal>
          <div className="space-y-6 pt-2">
            {[
              { title: "Verified Work History", desc: "Employers see actual deliverables and code, not just claims" },
              { title: "Reputation Signals", desc: "Showcase reviews and reliability scores from real startups" },
              { title: "Skill Badges", desc: "Earn automatic badges based on Sprint and Project completions" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-px h-10 bg-blue-500/60 shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-black text-[15px] mb-0.5">{item.title}</div>
                  <div className="text-sm text-black/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile card mockup */}
        <div className="lg:w-1/2 w-full flex justify-center">
          <div className="relative w-full max-w-sm">
            <div className="bg-white rounded-2xl border border-black/10 shadow-xl p-6 relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  JS
                </div>
                <div>
                  <div className="h-4 w-28 bg-black/10 rounded mb-1.5" />
                  <div className="h-3 w-20 bg-black/6 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Latest Project", value: "Fintech Dashboard Refactor" },
                  { label: "Top Skill Signal", value: "React Performance Tuning" },
                  { label: "Reputation Score", value: "98 / 100  ★★★★★" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3.5 rounded-xl border border-black/8 bg-black/2">
                    <div className="text-[10px] text-black/40 font-semibold uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-sm text-black/75 font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Blue glow behind card */}
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full pointer-events-none z-0" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA = () => {
  return (
    <section id="cta-section" suppressHydrationWarning className="bg-black text-white py-32 relative overflow-hidden flex items-center min-h-[60vh]">
      {/* Background glow for CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-12 w-full relative z-10">
        <HeaderReveal>
          <h2
            className="font-black tracking-tighter text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", lineHeight: "0.95" }}
          >
            Own Your 
            <br />
            Technical Truth.
          </h2>
        </HeaderReveal>
        <WordReveal className="text-white/50 text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed font-medium justify-center">
          The era of claimed skills is over. Join the proof-first movement and build a career that cannot be ignored.
        </WordReveal>
        <HeaderReveal delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/login"
              className="px-10 py-5 bg-white text-black rounded-full font-black text-[16px] hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 transition-all duration-300 uppercase tracking-widest"
            >
              Claim Your Portfolio URL
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 border-2 border-white/20 text-white rounded-full font-black text-[16px] hover:bg-white/10 hover:border-white/40 hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-widest"
            >
              Explore Active Sprints
            </Link>
          </div>
        </HeaderReveal>
        
        <div className="pt-12 flex flex-col items-center gap-4">
           <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Integrated with top startups</div>
           <div className="flex gap-8 opacity-20 grayscale brightness-200">
              {["SOLARIS", "FINTECHX", "AUTOSTREAM", "HEALTHLINK"].map(name => (
                <span key={name} className="text-sm font-black italic">{name}</span>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer suppressHydrationWarning className="bg-white pt-24 pb-12 border-t border-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-24">
          <div className="max-w-sm space-y-4">
            <HeaderReveal>
              <h3 className="text-2xl font-black tracking-tight text-black">Experience Proof</h3>
            </HeaderReveal>
            <WordReveal className="text-black/40 text-sm leading-relaxed font-medium">
              Building the technical standard for verifiable careers. Join the ecosystem where skills are proven, not just claimed.
            </WordReveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-12 lg:gap-24">
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Platform</h4>
              <ul className="space-y-3">
                {[
                  { label: "Speedruns", href: "#dark-showcase" },
                  { label: "Work Sprints", href: "#work-sprints" },
                  { label: "Projects", href: "#projects" },
                  { label: "Skill Forge", href: "/login" }
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm font-semibold text-black/60 hover:text-black transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Resources</h4>
              <ul className="space-y-3">
                 {["Docs", "Changelog", "Mission Control", "Reputation Hub"].map(item => (
                  <li key={item}>
                    <Link href="/login" className="text-sm font-semibold text-black/60 hover:text-black transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Brand Section: Massive Text */}
        <div className="relative mb-20">
          <h2 
            className="text-black font-black leading-[0.8] select-none pointer-events-none text-center"
            style={{ 
              fontSize: "clamp(4rem, 21vw, 24rem)", 
              letterSpacing: "-0.06em",
              marginLeft: "-0.03em" 
            }}
          >
            KOZEO
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <Image src="/kozeoLogo.png" alt="Kozeo" width={24} height={24} className="rounded-full shadow-sm" />
              <span className="font-bold text-sm tracking-tight text-black">Kozeo</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-black/10" />
            <span className="text-xs font-semibold text-black/30 tracking-tight">© {mounted ? new Date().getFullYear() : "2026"} Kozeo Ecosystems. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8">
             {["About", "Careers", "Privacy", "Terms"].map((item) => (
               <Link 
                 key={item} 
                 href="/login" 
                 className="text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
               >
                 {item}
               </Link>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kozeo",
    url: "/",
    description:
      "Kozeo is a proof-first career platform for tech professionals to build verifiable portfolios through Speedruns, Work Sprints, and Projects.",
  };

  return (
    <>
      {isLoading && (
        <PageLoader
          duration={2000}
          onComplete={() => setIsLoading(false)}
          useSlideAnimation={true}
        />
      )}

      <div
        suppressHydrationWarning
        className={`w-full min-h-screen transition-opacity duration-700 bg-white text-black ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Navbar />
        <main>
          <Hero />
          <IconStripSection />
          <ShowcaseSection />
          <WorkSprintsSection />
          <ProjectsSection />
          <CTA />
        </main>
        <ScrollToTop />
        <Footer />
        
      </div>
    </>
  );
}
