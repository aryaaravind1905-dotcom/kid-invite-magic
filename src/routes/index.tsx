import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import chibiBody from "@/assets/chibi-body.png";
import cardFrame from "@/assets/card-frame.png";
import firework from "@/assets/firework.png";
import bgImg from "@/assets/bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "You're Cordially Invited • Toddlers Town Annual Day" },
      {
        name: "description",
        content:
          "A heartfelt invitation to Toddlers Town Pre-Primary School's Annual Day Celebration.",
      },
    ],
  }),
  component: Invitation,
});

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Saptapadhi+Mangal+Karyalaya+Mahaveer+Circle+Ganapati+Galli+Khanapur+Rd+Machhe+Belagavi";

const CELEBRATION_SOUND =
  "https://cdn.pixabay.com/download/audio/2022/10/14/audio_3eef5d7cab.mp3?filename=cinematic-fireworks-celebration-7748.mp3";
const POP_SOUND =
  "https://cdn.pixabay.com/download/audio/2022/03/10/audio_a04c94bb27.mp3?filename=firework-explosion-6288.mp3";

function getParam(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function Invitation() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [childName, setChildName] = useState("your little one");
  const [faceUrl, setFaceUrl] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const fireworksLayer = useRef<HTMLDivElement>(null);
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const popAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const n = getParam("name").trim();
    const img = getParam("image").trim();
    if (n) setChildName(n);
    if (img) setFaceUrl(img);
  }, []);

  // Confetti pieces (premium gold/maroon palette)
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
        color: [
          "oklch(0.78 0.14 80)",   // gold
          "oklch(0.55 0.18 30)",   // maroon
          "oklch(0.65 0.18 40)",   // burnt orange
          "oklch(0.88 0.08 85)",   // cream
          "oklch(0.5 0.15 25)",    // deep red
        ][i % 5],
        rot: Math.random() * 360,
      })),
    []
  );

  const playPop = () => {
    if (!popAudio.current || muted) return;
    try {
      const a = popAudio.current.cloneNode(true) as HTMLAudioElement;
      a.volume = 0.4;
      a.play().catch(() => {});
    } catch {}
  };

  const launchFirework = (x: number, y: number) => {
    if (!fireworksLayer.current) return;
    const el = document.createElement("img");
    el.src = firework;
    el.className = "firework";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = "180px";
    el.style.height = "180px";
    el.style.transform = "translate(-50%, -50%) scale(0.2)";
    fireworksLayer.current.appendChild(el);
    gsap.to(el, {
      opacity: 1,
      scale: 1.4,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(el, {
          opacity: 0,
          scale: 1.8,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => el.remove(),
        });
      },
    });
    playPop();
  };

  const begin = () => {
    if (started) return;
    setStarted(true);
    if (bgMusic.current) {
      bgMusic.current.volume = 0.35;
      bgMusic.current.play().catch(() => {});
    }
  };

  // Main animation timeline once started
  useEffect(() => {
    if (!started) return;
    const ctx = gsap.context(() => {
      // Confetti continuous fall
      gsap.utils.toArray<HTMLElement>(".confetti-piece").forEach((el) => {
        const dur = parseFloat(el.dataset.dur || "6");
        const delay = parseFloat(el.dataset.delay || "0");
        gsap.fromTo(
          el,
          { y: -40, rotation: 0, opacity: 0 },
          {
            y: window.innerHeight + 80,
            rotation: 720,
            opacity: 1,
            duration: dur,
            delay,
            repeat: -1,
            ease: "none",
          }
        );
      });

      // Card reveal
      const tl = gsap.timeline();
      tl.from(cardRef.current, {
        scale: 0.7,
        opacity: 0,
        y: 40,
        rotateX: -20,
        duration: 1,
        ease: "back.out(1.4)",
      })
        .from(
          ".card-frame",
          { opacity: 0, scale: 1.1, duration: 0.8, ease: "power2.out" },
          "-=0.7"
        )
        .from(
          linesRef.current?.children ?? [],
          { y: 14, opacity: 0, duration: 0.45, stagger: 0.1, ease: "power2.out" },
          "-=0.4"
        )
        .from(
          avatarRef.current,
          { y: 60, opacity: 0, duration: 0.6, ease: "back.out(1.5)" },
          "-=0.3"
        )
        .from(
          bubbleRef.current,
          { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" },
          "-=0.2"
        );

      // Avatar gentle bobbing
      gsap.to(avatarRef.current, {
        y: -8,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.6,
      });

      // Fireworks burst sequence
      const burstAt = (xPct: number, yPct: number) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        launchFirework(w * xPct, h * yPct);
      };

      const burstTl = gsap.timeline({ delay: 0.2, repeat: -1, repeatDelay: 2.5 });
      burstTl
        .call(() => burstAt(0.18, 0.22))
        .call(() => burstAt(0.82, 0.28), [], "+=0.35")
        .call(() => burstAt(0.5, 0.15), [], "+=0.4")
        .call(() => burstAt(0.25, 0.7), [], "+=0.5")
        .call(() => burstAt(0.78, 0.72), [], "+=0.4");

      // Tiny sparks twinkle
      gsap.to(".spark", {
        scale: 1.6,
        opacity: 0,
        duration: 1.4,
        repeat: -1,
        repeatDelay: 0.8,
        stagger: { each: 0.1, from: "random" },
        ease: "power1.out",
      });
    }, stageRef);
    return () => ctx.revert();
  }, [started]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (bgMusic.current) bgMusic.current.muted = next;
  };

  return (
    <div
      ref={stageRef}
      className="relative h-[100dvh] w-full overflow-hidden festive-bg"
      style={{
        backgroundImage: `linear-gradient(180deg, oklch(0.97 0.03 85 / 0.85), oklch(0.93 0.06 60 / 0.92)), url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <audio ref={bgMusic} src={CELEBRATION_SOUND} loop preload="auto" />
      <audio ref={popAudio} src={POP_SOUND} preload="auto" />

      {/* Fireworks layer */}
      <div
        ref={fireworksLayer}
        className="pointer-events-none absolute inset-0 z-20"
      />

      {/* Confetti */}
      {started && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
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
      )}

      {/* Twinkling sparks */}
      {started &&
        [
          { top: "8%", left: "10%" },
          { top: "12%", right: "12%" },
          { top: "30%", left: "5%" },
          { top: "28%", right: "6%" },
          { bottom: "22%", left: "8%" },
          { bottom: "18%", right: "10%" },
          { top: "45%", left: "48%" },
        ].map((s, i) => (
          <span key={i} className="spark" style={s as React.CSSProperties} />
        ))}

      {/* Mute toggle */}
      {started && (
        <button
          onClick={toggleMute}
          aria-label="Toggle music"
          className="absolute top-4 right-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-base backdrop-blur shadow-md ring-1 ring-[oklch(0.7_0.13_75)] active:scale-95"
        >
          {muted ? "🔇" : "🎵"}
        </button>
      )}

      {/* Welcome / start gate */}
      {!started && (
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[oklch(0.55_0.16_60)] mb-3">
            Toddlers Town
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-gold mb-2">
            You're Cordially Invited
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs">
            A special celebration awaits. Tap below to open your invitation.
          </p>
          <button
            onClick={begin}
            className="btn-elegant rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground"
          >
            Open Invitation
          </button>
        </div>
      )}

      {/* Main invitation */}
      {started && (
        <div className="relative z-10 mx-auto flex h-full max-w-md flex-col items-center justify-start sm:justify-center px-4 py-4 overflow-y-auto">
          <div
            ref={cardRef}
            className="invite-card relative w-full px-5 sm:px-6 py-6 sm:py-7"
          >
            {/* Decorative gold frame overlay */}
            <img
              src={cardFrame}
              alt=""
              aria-hidden
              className="card-frame pointer-events-none absolute inset-0 h-full w-full opacity-25 mix-blend-multiply"
            />

            <div className="relative text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[oklch(0.55_0.16_60)]">
                Proudly Presented By
              </p>
              <h2 className="mt-1.5 font-display text-[1.55rem] sm:text-[1.75rem] leading-tight font-bold text-gold">
                Toddlers Town Pre-Primary School
              </h2>
              <div className="mx-auto my-2 h-px w-16 bg-[oklch(0.7_0.13_75)]/60" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Cordially Invites You To
              </p>
              <h1 className="mt-1 font-display text-[1.7rem] leading-tight font-semibold text-foreground">
                Annual Day
              </h1>
              <p className="font-display text-sm italic text-muted-foreground -mt-0.5">
                Celebration of Little Stars
              </p>
            </div>

            <div className="gold-divider my-4" />

            <div ref={linesRef} className="space-y-3 text-sm">
              <Row label="Date" value="Saturday, 17 May" />
              <Row label="Time" value="4:30 PM onwards" />
              <Row
                label="Venue"
                value="Saptapadhi Mangal Karyalaya"
                sub="Mahaveer Circle, Ganapati Galli, Khanapur Rd, Machhe, Belagavi"
              />
              <div className="pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground text-center mb-2">
                  Programme
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["Dance", "Fancy Dress", "Music", "Fun Games"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[oklch(0.7_0.13_75)] bg-white/70 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="gold-divider my-4" />

            <div className="text-center px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-1.5">
                Director's Message
              </p>
              <p className="font-display italic text-[12.5px] sm:text-[13px] leading-snug text-foreground">
                "Every little star at TTPS shines in their own beautiful way. Join us as we celebrate their journey, their joy, and their dreams."
              </p>
              <p className="mt-2 font-display text-[1.1rem] sm:text-[1.2rem] font-bold tracking-wide text-[oklch(0.55_0.16_60)]">
                — Minchu Satya
              </p>
              <p className="text-[9.5px] uppercase tracking-[0.25em] text-muted-foreground">
                Director, TTPS
              </p>
            </div>

            <div className="gold-divider my-4" />

            <div className="relative grid grid-cols-2 gap-2.5">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-elegant rounded-full bg-primary py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                View Location
              </a>
              <a
                href="tel:+910000000000"
                className="btn-elegant rounded-full border border-primary bg-transparent py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-primary"
              >
                Contact School
              </a>
            </div>
          </div>

          {/* Chibi avatar — full character image of the child */}
          <div
            ref={avatarRef}
            className="relative mt-2 flex w-full items-end justify-center gap-3"
          >
            <div className="relative h-[170px] w-[130px] shrink-0 drop-shadow-[0_6px_10px_rgba(80,30,10,0.25)]">
              {faceUrl ? (
                <img
                  src={faceUrl}
                  alt={childName}
                  className="absolute inset-0 h-full w-full object-contain object-bottom"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <img
                  src={chibiBody}
                  alt="Child avatar"
                  className="absolute inset-0 h-full w-full object-contain object-bottom"
                />
              )}
            </div>

            <div
              ref={bubbleRef}
              className="bubble max-w-[58%] text-[12.5px] leading-snug text-foreground"
            >
              <p className="font-display italic text-[oklch(0.55_0.16_60)] text-[11px] mb-0.5">
                A note from {childName}
              </p>
              Dear Amma & Appa, please come — I've been
              practicing just for you. ♥
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-base font-semibold text-foreground leading-tight">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug px-2">
          {sub}
        </p>
      )}
    </div>
  );
}
