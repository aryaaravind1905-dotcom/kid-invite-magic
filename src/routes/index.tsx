import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "You're Invited! • Toddlers Town Annual Day" },
      {
        name: "description",
        content:
          "A magical invitation from your little one to Toddlers Town Pre-Primary School's Annual Day Celebration.",
      },
    ],
  }),
  component: Invitation,
});

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Saptapadhi+Mangal+Karyalaya+Mahaveer+Circle+Ganapati+Galli+Khanapur+Rd+Machhe+Belagavi";

function getParam(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function Invitation() {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const [childName, setChildName] = useState("your little star");
  const [faceUrl, setFaceUrl] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const n = getParam("name").trim();
    const img = getParam("image").trim();
    if (n) setChildName(n);
    if (img) setFaceUrl(img);
  }, []);

  // Confetti pieces (continuous)
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        color: [
          "oklch(0.85 0.2 25)",
          "oklch(0.88 0.18 90)",
          "oklch(0.78 0.2 350)",
          "oklch(0.82 0.13 230)",
          "oklch(0.85 0.13 160)",
        ][i % 5],
        rot: Math.random() * 360,
      })),
    []
  );

  const balloons = useMemo(
    () =>
      [
        { left: "8%", color: "oklch(0.78 0.2 25)", delay: 0 },
        { left: "22%", color: "oklch(0.85 0.18 90)", delay: 1.2 },
        { left: "78%", color: "oklch(0.78 0.2 350)", delay: 0.6 },
        { left: "90%", color: "oklch(0.82 0.13 230)", delay: 2 },
        { left: "55%", color: "oklch(0.85 0.13 160)", delay: 1.6 },
      ],
    []
  );

  // Entry animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sparks at corners
      gsap.from(".spark", {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "back.out(2)",
      });
      gsap.to(".spark", {
        scale: 1.4,
        opacity: 0,
        duration: 1.2,
        delay: 0.5,
        repeat: -1,
        repeatDelay: 1.6,
        stagger: { each: 0.08, from: "random" },
        ease: "power1.out",
      });

      // Confetti fall
      gsap.utils.toArray<HTMLElement>(".confetti-piece").forEach((el) => {
        const dur = parseFloat(el.dataset.dur || "6");
        const delay = parseFloat(el.dataset.delay || "0");
        gsap.fromTo(
          el,
          { y: -40, rotation: 0, opacity: 0 },
          {
            y: window.innerHeight + 60,
            rotation: 540,
            opacity: 1,
            duration: dur,
            delay,
            repeat: -1,
            ease: "none",
          }
        );
      });

      // Balloons floating up forever
      gsap.utils.toArray<HTMLElement>(".balloon-wrap").forEach((el) => {
        const delay = parseFloat(el.dataset.delay || "0");
        gsap.fromTo(
          el,
          { y: window.innerHeight + 100 },
          {
            y: -160,
            duration: 14,
            delay,
            repeat: -1,
            ease: "none",
          }
        );
        gsap.to(el, {
          x: "+=20",
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });

      // Envelope intro
      gsap.from(envelopeRef.current, {
        scale: 0,
        rotation: -20,
        duration: 1,
        delay: 0.3,
        ease: "back.out(1.7)",
      });
      gsap.to(envelopeRef.current, {
        y: -10,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Try to play celebration sound
      if (audioRef.current) {
        audioRef.current.volume = 0.35;
        audioRef.current.play().catch(() => {});
      }
    }, stageRef);
    return () => ctx.revert();
  }, []);

  // Open invitation
  const openInvite = () => {
    if (opened) return;
    setOpened(true);
    if (audioRef.current) {
      setMuted(false);
      audioRef.current.play().catch(() => {});
    }

    requestAnimationFrame(() => {
      const tl = gsap.timeline();
      tl.to(envelopeRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -40,
        duration: 0.4,
        ease: "back.in(1.4)",
      })
        .from(
          cardRef.current,
          { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(1.6)" },
          "-=0.1"
        )
        .from(
          linesRef.current?.children ?? [],
          { y: 16, opacity: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
          "-=0.3"
        )
        .from(
          avatarRef.current,
          { y: 60, opacity: 0, duration: 0.5, ease: "back.out(1.6)" },
          "-=0.2"
        )
        .from(
          bubbleRef.current,
          { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" },
          "-=0.1"
        );

      // Avatar jump + wave loop
      gsap.to(avatarRef.current, {
        y: -14,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4,
      });
      gsap.to(".wave-arm", {
        rotation: 25,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        transformOrigin: "20% 20%",
        ease: "sine.inOut",
        delay: 1.4,
      });
    });
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
    if (muted) audioRef.current.play().catch(() => {});
  };

  return (
    <div
      ref={stageRef}
      className="relative h-[100dvh] w-full overflow-hidden festive-bg"
    >
      {/* Celebration sound (tiny chime via data URI fallback) */}
      <audio
        ref={audioRef}
        loop
        muted={muted}
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_69a61cd2c9.mp3?filename=festive-chime-8s-loop-100319.mp3"
      />

      {/* Corner sparks */}
      {[
        { top: "6%", left: "6%" },
        { top: "8%", right: "8%" },
        { bottom: "10%", left: "8%" },
        { bottom: "12%", right: "6%" },
        { top: "30%", left: "3%" },
        { top: "28%", right: "4%" },
      ].map((s, i) => (
        <span key={i} className="spark" style={s as React.CSSProperties} />
      ))}

      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="confetti-piece"
            data-dur={c.duration}
            data-delay={c.delay}
            style={{
              left: `${c.left}%`,
              background: c.color,
              transform: `rotate(${c.rot}deg)`,
            }}
          />
        ))}
      </div>

      {/* Balloons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {balloons.map((b, i) => (
          <div
            key={i}
            className="balloon-wrap absolute bottom-0"
            data-delay={b.delay}
            style={{ left: b.left }}
          >
            <div className="balloon" style={{ background: b.color }} />
          </div>
        ))}
      </div>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        aria-label="Toggle music"
        className="absolute top-3 right-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/80 text-xl backdrop-blur shadow-md active:scale-95"
      >
        {muted ? "🔇" : "🎵"}
      </button>

      {/* Stage content */}
      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col items-center justify-center px-5 py-6">
        {!opened && (
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-bold text-foreground drop-shadow-sm">
              A surprise for you{" "}
              <span className="inline-block animate-pulse">💌</span>
            </h1>
            <button
              ref={envelopeRef as React.RefObject<HTMLButtonElement> as never}
              onClick={openInvite}
              className="envelope-glow active:scale-95 transition-transform"
              aria-label="Open invitation"
            >
              <Envelope />
            </button>
            <p className="text-base font-semibold text-muted-foreground">
              Tap the envelope to open ✨
            </p>
          </div>
        )}

        {opened && (
          <>
            <div
              ref={cardRef}
              className="invite-card relative w-full rounded-3xl p-5 pt-6"
            >
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  You're Invited
                </p>
                <h1 className="mt-1 text-[1.55rem] leading-tight font-bold text-foreground">
                  Toddlers Town
                  <br />
                  <span className="text-primary">Annual Day 🎉</span>
                </h1>
              </div>

              <div className="dashed-divider my-4" />

              <div ref={linesRef} className="space-y-2.5 text-sm">
                <Row icon="📅" label="Saturday, 17 May" bold />
                <Row icon="⏰" label="4:30 PM" bold />
                <Row
                  icon="📍"
                  label="Saptapadhi Mangal Karyalaya"
                  sub="Mahaveer Circle, Ganapati Galli, Khanapur Rd, Machhe, Belagavi"
                />
                <div className="rounded-2xl bg-secondary/40 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Programs
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[
                      ["💃", "Dance"],
                      ["👗", "Fancy Dress"],
                      ["🎵", "Music"],
                      ["🎲", "Fun Games"],
                    ].map(([e, t]) => (
                      <span
                        key={t}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm"
                      >
                        {e} {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pop rounded-2xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
                >
                  📍 View Location
                </a>
                <a
                  href="tel:+910000000000"
                  className="btn-pop rounded-2xl bg-accent py-3 text-center text-sm font-bold text-accent-foreground"
                >
                  📞 Contact School
                </a>
              </div>
            </div>

            {/* Avatar + speech bubble */}
            <div
              ref={avatarRef}
              className="relative mt-4 flex w-full items-end justify-center gap-3"
            >
              <ChibiChild faceUrl={faceUrl} />
              <div ref={bubbleRef} className="bubble max-w-[58%] text-[13px] font-semibold leading-snug">
                Amma & Appa ❤️
                <br />
                Please come to{" "}
                <span className="text-primary">{childName}</span>'s school function!
                <br />
                I want to perform for you 🥺✨
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  sub,
  bold,
}: {
  icon: string;
  label: string;
  sub?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-lg leading-none">{icon}</span>
      <div className="flex-1">
        <p className={bold ? "font-bold text-foreground" : "text-foreground font-semibold"}>
          {label}
        </p>
        {sub && <p className="text-xs text-muted-foreground leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

function Envelope() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
      <defs>
        <linearGradient id="env-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.88 0.16 25)" />
          <stop offset="1" stopColor="oklch(0.72 0.2 15)" />
        </linearGradient>
        <linearGradient id="env-flap" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.92 0.14 30)" />
          <stop offset="1" stopColor="oklch(0.78 0.2 20)" />
        </linearGradient>
      </defs>
      <rect x="10" y="30" width="160" height="100" rx="14" fill="url(#env-body)" />
      <path d="M10 44 L90 96 L170 44 L170 30 L10 30 Z" fill="url(#env-flap)" />
      <circle cx="90" cy="92" r="22" fill="oklch(0.97 0.1 90)" stroke="oklch(0.6 0.18 20)" strokeWidth="3" />
      <text
        x="90"
        y="100"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fill="oklch(0.5 0.2 20)"
      >
        ♥
      </text>
    </svg>
  );
}

function ChibiChild({ faceUrl }: { faceUrl: string }) {
  return (
    <div className="relative h-[150px] w-[110px] shrink-0">
      {/* Body */}
      <svg
        viewBox="0 0 110 150"
        className="absolute inset-0 h-full w-full"
      >
        {/* Legs */}
        <rect x="38" y="118" width="14" height="28" rx="6" fill="oklch(0.55 0.12 260)" />
        <rect x="58" y="118" width="14" height="28" rx="6" fill="oklch(0.55 0.12 260)" />
        {/* Shoes */}
        <ellipse cx="44" cy="146" rx="10" ry="4" fill="oklch(0.3 0.05 30)" />
        <ellipse cx="66" cy="146" rx="10" ry="4" fill="oklch(0.3 0.05 30)" />
        {/* Body shirt */}
        <path
          d="M25 80 Q55 70 85 80 L82 122 Q55 130 28 122 Z"
          fill="oklch(0.78 0.2 25)"
        />
        {/* Collar */}
        <path d="M45 78 L55 88 L65 78 Z" fill="white" />
        {/* Left arm (waving) */}
        <g className="wave-arm" style={{ transformOrigin: "30px 88px" }}>
          <rect x="14" y="82" width="14" height="36" rx="7" fill="oklch(0.85 0.06 60)" />
          <circle cx="21" cy="80" r="9" fill="oklch(0.85 0.06 60)" />
        </g>
        {/* Right arm */}
        <rect x="82" y="86" width="14" height="34" rx="7" fill="oklch(0.85 0.06 60)" />
      </svg>

      {/* Head */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="relative h-[68px] w-[68px] overflow-hidden rounded-full border-[3px] border-white bg-[oklch(0.85_0.06_60)] shadow-md">
          {faceUrl ? (
            <img
              src={faceUrl}
              alt="child"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <svg viewBox="0 0 68 68" className="h-full w-full">
              <circle cx="26" cy="30" r="3" fill="#222" />
              <circle cx="42" cy="30" r="3" fill="#222" />
              <path
                d="M24 42 Q34 50 44 42"
                stroke="#222"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="20" cy="40" r="3" fill="oklch(0.8 0.15 20 / 0.6)" />
              <circle cx="48" cy="40" r="3" fill="oklch(0.8 0.15 20 / 0.6)" />
            </svg>
          )}
        </div>
        {/* Party hat */}
        <svg
          viewBox="0 0 60 40"
          className="absolute -top-5 left-1/2 h-7 w-10 -translate-x-1/2"
        >
          <polygon points="30,2 6,38 54,38" fill="oklch(0.78 0.2 350)" />
          <circle cx="30" cy="3" r="3" fill="oklch(0.88 0.18 90)" />
          <rect x="6" y="36" width="48" height="4" fill="oklch(0.88 0.18 90)" />
        </svg>
      </div>
    </div>
  );
}
