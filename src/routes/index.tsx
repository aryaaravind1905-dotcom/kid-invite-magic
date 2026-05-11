import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import chibiBody from "@/assets/chibi-body.png";
import cardFrame from "@/assets/card-frame.png";
import firework from "@/assets/firework.png";
import bgImg from "@/assets/bg.jpg";
import kidsFooter from "@/assets/kids-footer.png";

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

// Convert common share URLs (Google Drive, Dropbox) into direct image URLs
function normalizeImageUrl(url: string): string {
  try {
    // Google Drive: /file/d/<ID>/view  OR  ?id=<ID>
    const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    const driveOpen = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const id = driveFile?.[1] || (url.includes("drive.google.com") ? driveOpen?.[1] : undefined);
    if (id) return `https://lh3.googleusercontent.com/d/${id}=w800`;

    // Dropbox: ?dl=0 -> ?raw=1
    if (url.includes("dropbox.com")) {
      return url.replace("?dl=0", "?raw=1").replace("&dl=0", "&raw=1");
    }
  } catch {}
  return url;
}

function Invitation() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [childName, setChildName] = useState("your little one");
  const [faceUrl, setFaceUrl] = useState("");
  const [personalized, setPersonalized] = useState(false);

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
    if (img) setFaceUrl(normalizeImageUrl(img));
    setPersonalized(Boolean(n || img));
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

  // Cracker rocket: launches from bottom, leaves a trail, bursts at top
  const launchRocket = (xPct: number) => {
    if (!fireworksLayer.current) return;
    const layer = fireworksLayer.current;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const startX = w * xPct;
    const targetY = h * (0.15 + Math.random() * 0.15);

    const rocket = document.createElement("span");
    rocket.style.cssText = `position:absolute;left:${startX}px;top:${h - 20}px;width:6px;height:18px;border-radius:3px;background:linear-gradient(to top, oklch(0.78 0.14 80), oklch(0.55 0.18 30));box-shadow:0 0 12px oklch(0.78 0.14 80);transform:translate(-50%,0);will-change:transform,top;`;
    layer.appendChild(rocket);

    // Trail sparks
    const trailInterval = window.setInterval(() => {
      const r = rocket.getBoundingClientRect();
      const s = document.createElement("span");
      s.style.cssText = `position:absolute;left:${r.left + r.width / 2}px;top:${r.top + r.height}px;width:4px;height:4px;border-radius:50%;background:oklch(0.88 0.12 80);box-shadow:0 0 8px oklch(0.78 0.14 80);transform:translate(-50%,-50%);pointer-events:none;`;
      layer.appendChild(s);
      gsap.to(s, { opacity: 0, scale: 0.2, duration: 0.6, ease: "power1.out", onComplete: () => s.remove() });
    }, 40);

    gsap.to(rocket, {
      top: targetY,
      duration: 0.9,
      ease: "power2.out",
      onComplete: () => {
        clearInterval(trailInterval);
        rocket.remove();
        launchFirework(startX, targetY);
      },
    });
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

      // Cracker rockets launching from bottom periodically
      const rocketTl = gsap.timeline({ delay: 1.2, repeat: -1, repeatDelay: 1.8 });
      rocketTl
        .call(() => launchRocket(0.15 + Math.random() * 0.15))
        .call(() => launchRocket(0.7 + Math.random() * 0.15), [], "+=0.6")
        .call(() => launchRocket(0.4 + Math.random() * 0.2), [], "+=0.7");

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


      {/* Welcome / start gate */}
      {!started && (
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[oklch(0.55_0.16_60)] mb-3">
            Toddlers Town
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-gold mb-2">
            You're Cordially Invited
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            A special celebration awaits. Tap below to open your invitation.
          </p>
          {personalized ? (
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
              <img
                src={faceUrl || chibiBody}
                alt={childName}
                referrerPolicy="no-referrer"
                className="h-40 sm:h-48 w-40 sm:w-48 rounded-xl aspect-square object-cover object-top [mask-image:radial-gradient(circle,black_60%,transparent_100%)] drop-shadow-[0_6px_10px_rgba(80,30,10,0.25)] animate-[fade-in_0.6s_ease-out]"
              />
              <button
                onClick={begin}
                className="btn-elegant rounded-full bg-primary px-6 sm:px-8 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground mb-4"
              >
                Open Invitation
              </button>
            </div>
          ) : (
            <button
              onClick={begin}
              className="btn-elegant rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground"
            >
              Open Invitation
            </button>
          )}
          {!personalized && (
            <img
              src={kidsFooter}
              alt="Toddlers Town kids holding hands"
              className="pointer-events-none absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md object-contain drop-shadow-[0_-4px_12px_rgba(80,30,10,0.18)] animate-[fade-in_0.8s_ease-out]"
            />
          )}
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
              <Row label="Date" value="Sunday, 17 May" />
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
                  {["Dance", "Fancy Dress", "Music", "Cultural Activity", "Honouring", "Prize Distribution", "Book Inauguration"].map((t) => (
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
                href="tel:+916360583553"
                className="btn-elegant rounded-full border border-primary bg-transparent py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-primary"
              >
                Contact School
              </a>
            </div>
          </div>

          {personalized ? (
            <div
              ref={avatarRef}
              className="relative mt-2 flex w-full flex-col items-center justify-center gap-3"
            >
              <img
                src={faceUrl || chibiBody}
                alt={childName}
                referrerPolicy="no-referrer"
                className="h-40 sm:h-48 w-40 sm:w-48 rounded-xl aspect-square object-cover object-top [mask-image:radial-gradient(circle,black_60%,transparent_100%)] drop-shadow-[0_6px_10px_rgba(80,30,10,0.25)] animate-[fade-in_0.6s_ease-out]"
              />

              <div
                ref={bubbleRef}
                className="bubble max-w-[92%] text-center text-sm sm:text-base leading-relaxed text-foreground"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  A note from
                </p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-[oklch(0.55_0.16_60)] mb-2">
                  {childName}
                </p>
                <p className="font-display italic">
                  "Dear Amma &amp; Appa, please come — I've been practicing just for you. ♥"
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={avatarRef}
              className="relative mt-3 flex w-full flex-col items-center"
            >
              <div
                ref={bubbleRef}
                className="bubble max-w-[88%] text-center text-[12.5px] leading-snug text-foreground"
              >
                <p className="font-display italic text-[oklch(0.55_0.16_60)] text-[11px] mb-0.5">
                  A message from the little stars of TTPS
                </p>
                "Please come and cheer for us! We've been practicing
                with all our hearts to make this day magical for you. ♥"
              </div>
              <img
                src={kidsFooter}
                alt="Toddlers Town kids holding hands"
                className="mt-3 w-full max-w-sm object-contain drop-shadow-[0_6px_10px_rgba(80,30,10,0.18)]"
              />
            </div>
          )}
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
