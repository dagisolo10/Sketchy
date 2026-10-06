// import { gsap } from "gsap";
// import { useRef } from "react";
// import { useGSAP } from "@gsap/react";
// import type { Role } from "@package/types";

// gsap.registerPlugin(useGSAP);

// /* ────────────────────────────────────────────────────────────────
//  *  DEV CONFIG
//  *  The `role` prop on <IntroPage /> picks the cinematic — flip it
//  *  in game-canvas.tsx between "civilian" and "imposter" to watch
//  *  the other sequence. Later both values come from the server —
//  *  nothing else in this file needs to change.
//  * ──────────────────────────────────────────────────────────────── */

// /* barely floating dust — deterministic positions so the room is the same every run */
// const DUST = [
//     { x: 7, y: 22, s: 2, o: 0.34, dx: 28, dy: -74 },
//     { x: 15, y: 58, s: 1, o: 0.22, dx: -20, dy: -96 },
//     { x: 23, y: 34, s: 2, o: 0.18, dx: 16, dy: -62 },
//     { x: 31, y: 71, s: 1, o: 0.3, dx: -14, dy: -110 },
//     { x: 38, y: 16, s: 2, o: 0.26, dx: 34, dy: -48 },
//     { x: 45, y: 47, s: 1, o: 0.16, dx: -26, dy: -84 },
//     { x: 52, y: 66, s: 2, o: 0.32, dx: 12, dy: -102 },
//     { x: 58, y: 28, s: 1, o: 0.2, dx: -18, dy: -66 },
//     { x: 64, y: 54, s: 2, o: 0.28, dx: 24, dy: -88 },
//     { x: 71, y: 12, s: 1, o: 0.24, dx: -30, dy: -54 },
//     { x: 77, y: 63, s: 2, o: 0.18, dx: 18, dy: -98 },
//     { x: 84, y: 38, s: 1, o: 0.3, dx: -16, dy: -72 },
//     { x: 90, y: 74, s: 2, o: 0.22, dx: 22, dy: -108 },
//     { x: 12, y: 84, s: 1, o: 0.14, dx: -12, dy: -120 },
//     { x: 48, y: 88, s: 2, o: 0.2, dx: 30, dy: -116 },
//     { x: 68, y: 82, s: 1, o: 0.26, dx: -22, dy: -92 },
// ];

// const introCss = `
// .ig-root {
//     position: fixed;
//     inset: 0;
//     overflow: hidden;
//     background: #000;
//     color: var(--foreground);
//     font-family: var(--font-sans);
//     user-select: none;
//     -webkit-font-smoothing: antialiased;
// }
// .ig-env { position: absolute; inset: 0; }
// .ig-camera { position: absolute; inset: -6%; will-change: transform; }

// .ig-wall {
//     position: absolute; inset: 0;
//     background: radial-gradient(120% 90% at 50% 38%, #101318 0%, #0a0c10 40%, #06070a 68%, #020203 100%);
// }
// .ig-floor {
//     position: absolute; left: -6%; right: -6%; bottom: 0; height: 34%;
//     background: linear-gradient(to top, #07080a 0%, #0b0d11 55%, rgba(9, 11, 14, 0) 100%);
//     box-shadow: inset 0 70px 90px -70px color-mix(in srgb, var(--foreground) 8%, transparent);
// }
// .ig-seam {
//     position: absolute; left: 0; right: 0; top: 66%; height: 1px;
//     background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--foreground) 6%, transparent) 28%, color-mix(in srgb, var(--foreground) 10%, transparent) 56%, transparent 100%);
// }
// .ig-edge { position: absolute; top: 6%; bottom: 10%; width: 1px; }
// .ig-edge--l { left: 13%; background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--foreground) 8%, transparent) 45%, transparent); }
// .ig-edge--r { right: 16%; background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--foreground) 6%, transparent) 52%, transparent); }

// .ig-wash {
//     position: absolute; right: 8%; top: 26%; width: 46%; height: 52%;
//     background: radial-gradient(closest-side, rgba(255, 240, 220, 0.15), rgba(255, 240, 220, 0.04) 55%, transparent 80%);
//     filter: blur(18px);
// }
// .ig-light {
//     position: absolute; top: -18%; left: 54%; width: 34%; height: 98%;
//     transform: rotate(9deg);
//     clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
//     background: linear-gradient(to bottom, rgba(255, 243, 225, 0.14), rgba(255, 243, 225, 0.05) 45%, rgba(255, 243, 225, 0) 88%);
//     filter: blur(22px);
// }
// .ig-chair { position: absolute; left: 57%; bottom: 6%; width: 20%; height: 30%; }
// .ig-chair > div { position: absolute; background: #040405; }
// .ig-chair .back { left: 4%; top: 0; width: 34%; height: 58%; }
// .ig-chair .seat { left: 4%; top: 56%; width: 44%; height: 7%; }
// .ig-chair .leg-a { left: 8%; top: 62%; width: 5%; height: 38%; }
// .ig-chair .leg-b { left: 42%; top: 62%; width: 5%; height: 38%; }
// .ig-chair .edge {
//     background: linear-gradient(90deg, color-mix(in srgb, var(--accent-amber) 55%, transparent), color-mix(in srgb, var(--accent-amber) 8%, transparent));
//     height: 1px; width: 34%; left: 4%; top: 0;
// }

// .ig-fog { position: absolute; border-radius: 50%; filter: blur(42px); will-change: transform, opacity; }
// .ig-fog--a { left: -12%; bottom: -18%; width: 65%; height: 55%; background: radial-gradient(closest-side, color-mix(in srgb, var(--foreground) 12%, transparent), transparent 72%); }
// .ig-fog--b { right: -14%; top: -20%; width: 70%; height: 60%; background: radial-gradient(closest-side, color-mix(in srgb, var(--foreground) 9%, transparent), transparent 70%); }

// .ig-dust span {
//     position: absolute; display: block; border-radius: 50%;
//     background: color-mix(in srgb, var(--foreground) 75%, transparent);
//     filter: blur(0.6px);
// }

// .ig-vignette {
//     position: absolute; inset: 0; pointer-events: none;
//     background: radial-gradient(ellipse at 50% 48%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.42) 64%, rgba(0, 0, 0, 0.9) 100%);
// }
// .ig-tone { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
// .ig-deep {
//     position: absolute; inset: 0; opacity: 0; pointer-events: none;
//     background: radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0) 8%, rgba(0, 0, 0, 0.72) 72%, rgba(0, 0, 0, 0.95) 100%);
// }
// .ig-glow {
//     position: absolute; left: 50%; top: 45%;
//     width: min(74vw, 820px); height: min(44vh, 420px);
//     transform: translate(-50%, -50%);
//     border-radius: 50%; filter: blur(70px); opacity: 0;
//     pointer-events: none;
// }

// .ig-layer {
//     position: absolute; inset: 0;
//     display: flex; align-items: center; justify-content: center;
//     padding-left: 6vw; padding-right: 6vw;
//     text-align: center; pointer-events: none;
// }
// .ig-layer--role { padding-bottom: 13vh; }
// .ig-layer--detail { padding-top: 17vh; }

// .ig-narrative {
//     margin: 0 -0.4em 0 0;
//     font-size: clamp(11px, 2.8vw, 16px);
//     font-weight: 300;
//     letter-spacing: 0.4em;
//     text-transform: uppercase;
//     white-space: nowrap;
//     color: color-mix(in srgb, var(--foreground) 74%, transparent);
//     opacity: 0;
// }
// .ig-yourrole {
//     margin: 0 -0.55em 0 0;
//     font-family: "Cinzel", serif;
//     font-weight: 400;
//     font-size: clamp(26px, 5.6vw, 64px);
//     letter-spacing: 0.55em;
//     text-transform: uppercase;
//     white-space: nowrap;
//     color: color-mix(in srgb, var(--foreground) 94%, transparent);
//     opacity: 0;
//     will-change: opacity, filter, transform;
// }
// .ig-role {
//     margin: 0 -0.5em 0 0;
//     font-family: "Cinzel", serif;
//     font-weight: 500;
//     font-size: clamp(30px, 9vw, 112px);
//     line-height: 1;
//     letter-spacing: 0.5em;
//     text-transform: uppercase;
//     white-space: nowrap;
//     opacity: 0;
//     will-change: opacity, filter, transform;
// }
// .ig-detail {
//     display: flex; flex-direction: column; align-items: center;
//     gap: clamp(14px, 2.4vh, 28px);
//     text-align: center;
// }
// .ig-detail-rule {
//     width: clamp(64px, 12vw, 150px); height: 1px;
//     background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--foreground) 45%, transparent), transparent);
//     opacity: 0;
// }
// .ig-detail-a {
//     margin: 0 -0.55em 0 0;
//     font-size: clamp(10px, 1.5vw, 13px);
//     font-weight: 400;
//     letter-spacing: 0.55em;
//     text-transform: uppercase;
//     white-space: nowrap;
//     color: color-mix(in srgb, var(--foreground) 66%, transparent);
//     opacity: 0;
// }
// .ig-detail-a--imp {
//     margin: 0 -0.28em 0 0;
//     font-size: clamp(10px, 1.6vw, 14px);
//     font-weight: 300;
//     letter-spacing: 0.28em;
//     color: color-mix(in srgb, var(--foreground) 70%, transparent);
// }
// .ig-detail-b {
//     margin: 0 -0.5em 0 0;
//     font-family: "Cinzel", serif;
//     font-weight: 500;
//     font-size: clamp(30px, 6.5vw, 84px);
//     line-height: 1;
//     letter-spacing: 0.5em;
//     text-transform: uppercase;
//     white-space: nowrap;
//     color: var(--foreground);
//     text-shadow: 0 0 34px var(--accent-amber-glow);
//     opacity: 0;
//     will-change: opacity, filter, transform;
// }
// .ig-detail-b--imp {
//     margin: 0 -0.3em 0 0;
//     font-size: clamp(13px, 2.6vw, 22px);
//     letter-spacing: 0.3em;
//     color: color-mix(in srgb, var(--foreground) 92%, transparent);
//     text-shadow: 0 0 30px var(--accent-red-glow);
// }

// .ig-final { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
// `;

// export default function OpenCodeIntroPage({ onComplete, secretWord, role }: { onComplete: () => void; secretWord: string | null; role: Role }) {
//     const isImposter = role === "imposter";

//     /* role accents straight from the app theme: red = imposter, green = civilian */
//     const ACCENT = isImposter ? "var(--accent-red)" : "var(--accent-green)";
//     const ACCENT_GLOW = isImposter ? "var(--accent-red-glow)" : "var(--accent-green-glow)";
//     const ACCENT_RGB = isImposter ? "255, 42, 109" : "5, 255, 161";

//     const NARRATIVE = "EVERYONE HERE HAS A ROLE.";
//     const DETAIL_A = isImposter ? "You were not given the word." : "The Word";
//     const DETAIL_B = isImposter ? "Find it before they find you." : secretWord;

//     const ROLE_LOOK = {
//         color: ACCENT,
//         textShadow: `0 0 40px ${ACCENT_GLOW}, 0 0 130px rgba(${ACCENT_RGB}, 0.24)`,
//     };

//     const GLOW_BG = `radial-gradient(closest-side, color-mix(in srgb, ${ACCENT} ${isImposter ? 34 : 24}%, transparent), transparent 76%)`;

//     const TONE_BG = isImposter
//         ? `radial-gradient(78% 68% at 50% 52%, color-mix(in srgb, ${ACCENT} 15%, transparent), transparent 74%)`
//         : `radial-gradient(78% 68% at 50% 44%, color-mix(in srgb, ${ACCENT} 11%, transparent), transparent 78%)`;

//     const envRef = useRef<HTMLDivElement>(null);
//     const glowRef = useRef<HTMLDivElement>(null);
//     const rootRef = useRef<HTMLDivElement>(null);
//     const finalRef = useRef<HTMLDivElement>(null);
//     const cameraRef = useRef<HTMLDivElement>(null);
//     const roleRef = useRef<HTMLHeadingElement>(null);
//     const detailARef = useRef<HTMLSpanElement>(null);
//     const detailBRef = useRef<HTMLSpanElement>(null);
//     const yourRoleRef = useRef<HTMLHeadingElement>(null);
//     const narrativeRef = useRef<HTMLParagraphElement>(null);

//     useGSAP(
//         () => {
//             gsap.set(".ig-wall, .ig-floor, .ig-seam, .ig-edge, .ig-chair, .ig-chair .edge, .ig-light, .ig-wash, .ig-fog", { opacity: 0 });
//             gsap.set(".ig-detail-rule", { opacity: 0, scaleX: 0 });
//             gsap.set(".ig-dust span", { opacity: 0 });
//             gsap.set(".ig-tone, .ig-deep", { opacity: 0 });
//             gsap.set([narrativeRef.current, yourRoleRef.current, roleRef.current, detailARef.current, detailBRef.current, glowRef.current], { opacity: 0 });

//             gsap.set(narrativeRef.current, { filter: "blur(9px)", y: 10 });
//             gsap.set(yourRoleRef.current, { filter: "blur(16px)" });
//             gsap.set(roleRef.current, { filter: "blur(22px)", scale: 1.05 });
//             gsap.set(detailARef.current, { filter: "blur(6px)", y: 8 });
//             gsap.set(detailBRef.current, { filter: "blur(14px)", y: 6 });

//             const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete });

//             /* ── opening: pure black, then a room that is barely there ── */
//             tl.addLabel("opening", 0)
//                 .addLabel("room", 0.5)
//                 .to(".ig-wall", { opacity: 1, duration: 2.6, ease: "sine.inOut" }, "room")
//                 .to(".ig-floor", { opacity: 1, duration: 2.4, ease: "sine.inOut" }, "room+=0.4")
//                 .to(".ig-edge", { opacity: 1, duration: 2.2, stagger: 0.45, ease: "sine.inOut" }, "room+=0.9")
//                 .to(".ig-seam", { opacity: 1, duration: 2.2, ease: "sine.inOut" }, "room+=1.3")
//                 .to(".ig-chair", { opacity: 1, duration: 2.4, ease: "sine.inOut" }, "room+=1.5")
//                 /* slow camera push — phase 1 */
//                 .to(cameraRef.current, { scale: 1.034, x: -9, y: 4, rotation: -0.2, duration: 9.4, ease: "none" }, "room")
//                 /* drifting fog + dust */
//                 .to(".ig-fog", { opacity: 1, duration: 4, stagger: 0.8, ease: "sine.out" }, "room")
//                 .to(".ig-fog--a", { x: 46, duration: 27, ease: "none" }, "room")
//                 .to(".ig-fog--b", { x: -54, duration: 27, ease: "none" }, "room")
//                 .to(".ig-dust span", { opacity: (i: number) => DUST[i].o, duration: 2.2, stagger: 0.14, ease: "sine.out" }, "room+=1")
//                 .to(".ig-dust span", { x: (i: number) => DUST[i].dx, y: (i: number) => DUST[i].dy, duration: 26, ease: "none" }, "room+=1");

//             /* ── atmosphere: a wash of light, two tiny stutters ── */
//             tl.addLabel("atmosphere", 3.2)
//                 .to(".ig-wash", { opacity: 0.45, duration: 2.2, ease: "sine.inOut" }, "atmosphere")
//                 .to(envRef.current, { opacity: 0.84, duration: 0.07, yoyo: true, repeat: 1, ease: "none" }, "atmosphere+=0.8")
//                 .to(envRef.current, { opacity: 0.9, duration: 0.05, yoyo: true, repeat: 1, ease: "none" }, "atmosphere+=1.8");

//             /* ── first narrative beat: a title card resolving out of blur ── */
//             tl.addLabel("narrative", 4.6)
//                 .to(narrativeRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.5, ease: "power2.out" }, "narrative")
//                 .to(narrativeRef.current, { opacity: 0, filter: "blur(7px)", y: -8, duration: 1.1, ease: "power1.in" }, "narrative+=2.5");

//             /* ── silence: almost nothing happens here, on purpose ── */
//             tl.addLabel("silence", 8.2).to(envRef.current, { opacity: 0.05, duration: 1.3, ease: "power2.inOut" }, "silence");

//             /* ── suspense: the room returns, one light, one empty chair ── */
//             tl.addLabel("suspense", 9.9)
//                 .to(envRef.current, { opacity: 1, duration: 2.2, ease: "power2.inOut" }, "suspense")
//                 .to(".ig-light", { opacity: 0.85, duration: 2.4, ease: "sine.inOut" }, "suspense+=0.4")
//                 .to(".ig-wash", { opacity: 0.95, duration: 2.2, ease: "sine.inOut" }, "suspense+=0.4")
//                 .to(".ig-chair .edge", { opacity: 0.85, duration: 2.0, ease: "sine.inOut" }, "suspense+=1.0")
//                 /* camera push — phase 2 */
//                 .to(cameraRef.current, { scale: 1.058, x: -18, y: 7.5, rotation: -0.4, duration: 6.0, ease: "sine.inOut" }, "suspense")
//                 .to(".ig-light", { opacity: 0.3, duration: 0.06, yoyo: true, repeat: 1, ease: "none" }, "suspense+=3.3");

//             /* ── blackout ── */
//             tl.addLabel("blackout", 13.6)
//                 .to(envRef.current, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "blackout")
//                 .to(".ig-light, .ig-wash, .ig-chair .edge", { opacity: 0, duration: 0.9, ease: "power2.inOut" }, "blackout");

//             /* ── YOUR ROLE ── */
//             tl.addLabel("yourRole", 15.2)
//                 .fromTo(
//                     yourRoleRef.current,
//                     { letterSpacing: "0.55em", marginRight: "-0.55em" },
//                     { letterSpacing: "0.24em", marginRight: "-0.24em", opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power2.out" },
//                     "yourRole",
//                 )
//                 .to(yourRoleRef.current, { opacity: 0, filter: "blur(11px)", duration: 1.0, ease: "power1.in" }, "yourRole+=2.6");

//             /* ── role reveal: flicker, glow, blur cutting into focus ── */
//             tl.addLabel("reveal", 19.3)
//                 .to(envRef.current, { opacity: 0.4, duration: 2.2, ease: "power2.inOut" }, "reveal")
//                 .to(glowRef.current, { opacity: 0.5, duration: 0.07, ease: "none" }, "reveal+=0.05")
//                 .to(glowRef.current, { opacity: 0.06, duration: 0.09, ease: "none" }, "reveal+=0.18")
//                 .to(glowRef.current, { opacity: 0.62, duration: 0.06, ease: "none" }, "reveal+=0.32")
//                 .to(glowRef.current, { opacity: 0.3, duration: 1.0, ease: "power2.out" }, "reveal+=0.42")
//                 .to(roleRef.current, { opacity: 0.5, duration: 0.06, ease: "none" }, "reveal+=0.3")
//                 .to(roleRef.current, { opacity: 0.08, duration: 0.08, ease: "none" }, "reveal+=0.38")
//                 .to(roleRef.current, { opacity: 1, duration: 0.1, ease: "none" }, "reveal+=0.5")
//                 .fromTo(
//                     roleRef.current,
//                     { letterSpacing: "0.5em", marginRight: "-0.5em" },
//                     { letterSpacing: "0.16em", marginRight: "-0.16em", filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" },
//                     "reveal+=0.32",
//                 )
//                 /* camera push — phase 3 */
//                 .to(cameraRef.current, { scale: 1.078, x: -23, duration: 4.0, ease: "power1.out" }, "yourRole+=0.7");

//             /* ── role specific: informed light vs. something much worse ── */
//             tl.addLabel("roleSpecific", 22.1)
//                 .to(".ig-detail-rule", { opacity: 1, scaleX: 1, duration: 1.2, ease: "power2.out" }, "roleSpecific+=0.2")
//                 .to(roleRef.current, { y: -46, duration: 1.4, ease: "power2.out" }, "roleSpecific+=0.2")
//                 .to(detailARef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.1, ease: "power2.out" }, "roleSpecific+=0.5");

//             if (isImposter) {
//                 tl.to(envRef.current, { opacity: 0.1, duration: 2.8, ease: "power2.inOut" }, "roleSpecific+=0.2")
//                     .to(".ig-tone", { opacity: 1, duration: 3.0, ease: "power2.inOut" }, "roleSpecific+=0.2")
//                     .to(".ig-deep", { opacity: 0.85, duration: 3.2, ease: "power2.inOut" }, "roleSpecific+=0.2")
//                     .to(glowRef.current, { opacity: 0.14, duration: 2.4, ease: "power2.inOut" }, "roleSpecific+=0.4")
//                     .fromTo(
//                         detailBRef.current,
//                         { letterSpacing: "0.3em", marginRight: "-0.3em" },
//                         { letterSpacing: "0.16em", marginRight: "-0.16em", opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" },
//                         "roleSpecific+=1.3",
//                     );
//             } else {
//                 tl.to(envRef.current, { opacity: 0.9, duration: 2.8, ease: "power2.inOut" }, "roleSpecific+=0.2")
//                     .to(".ig-light", { opacity: 0.4, duration: 2.8, ease: "power2.inOut" }, "roleSpecific+=0.4")
//                     .to(".ig-wash", { opacity: 0.7, duration: 2.8, ease: "power2.inOut" }, "roleSpecific+=0.4")
//                     .to(".ig-tone", { opacity: 1, duration: 3.0, ease: "power2.inOut" }, "roleSpecific+=0.2")
//                     .to(glowRef.current, { opacity: 0.22, duration: 2.4, ease: "power2.inOut" }, "roleSpecific+=0.4")
//                     .fromTo(
//                         detailBRef.current,
//                         { letterSpacing: "0.5em", marginRight: "-0.5em" },
//                         { letterSpacing: "0.3em", marginRight: "-0.3em", opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" },
//                         "roleSpecific+=1.3",
//                     );
//             }

//             /* ── ending: everything sinks back into black ── */
//             tl.addLabel("ending", 25.9)
//                 .to([roleRef.current, detailARef.current, detailBRef.current, yourRoleRef.current, narrativeRef.current], { opacity: 0, duration: 1.4, ease: "power1.in" }, "ending")
//                 .to(glowRef.current, { opacity: 0, duration: 1.6, ease: "power1.in" }, "ending")
//                 .to([".ig-tone", ".ig-deep", ".ig-detail-rule"], { opacity: 0, duration: 1.6, ease: "power1.in" }, "ending")
//                 .to(envRef.current, { opacity: 0, duration: 1.8, ease: "power2.inOut" }, "ending")
//                 .to(finalRef.current, { opacity: 1, duration: 1.8, ease: "power2.inOut" }, "ending+=0.2")
//                 .addLabel("end");

//             // tl.eventCallback("onComplete", onComplete);

//             return () => {
//                 tl.kill();
//             };
//         },
//         { scope: rootRef },
//     );

//     return (
//         <div ref={rootRef} className="ig-root">
//             <style>{introCss}</style>

//             <div className="ig-env" ref={envRef}>
//                 <div className="ig-camera" ref={cameraRef}>
//                     <div className="ig-wall" />
//                     <div className="ig-floor" />
//                     <div className="ig-seam" />
//                     <div className="ig-edge ig-edge--l" />
//                     <div className="ig-edge ig-edge--r" />
//                     <div className="ig-wash" />
//                     <div className="ig-light" />
//                     <div className="ig-chair">
//                         <div className="back" />
//                         <div className="seat" />
//                         <div className="leg-a" />
//                         <div className="leg-b" />
//                         <div className="edge" />
//                     </div>
//                     <div className="ig-fog ig-fog--a" />
//                     <div className="ig-fog ig-fog--b" />
//                     <div className="ig-dust">
//                         {DUST.map((d, i) => (
//                             <span key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.s}px`, height: `${d.s}px` }} />
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <div className="ig-vignette" />
//             <div className="ig-tone" style={{ background: TONE_BG }} />
//             <div className="ig-deep" />
//             <div className="ig-glow" ref={glowRef} style={{ background: GLOW_BG }} />

//             <div className="ig-layer">
//                 <p className="ig-narrative" ref={narrativeRef}>
//                     {NARRATIVE}
//                 </p>
//             </div>

//             <div className="ig-layer">
//                 <h2 className="ig-yourrole" ref={yourRoleRef}>
//                     Your Role
//                 </h2>
//             </div>

//             <div className="ig-layer ig-layer--role">
//                 <h1 className="ig-role" ref={roleRef} style={ROLE_LOOK}>
//                     {role}
//                 </h1>
//             </div>

//             <div className="ig-layer ig-layer--detail">
//                 <div className="ig-detail">
//                     <div className="ig-detail-rule" />
//                     <span className={isImposter ? "ig-detail-a ig-detail-a--imp" : "ig-detail-a"} ref={detailARef}>
//                         {DETAIL_A}
//                     </span>
//                     <span className={isImposter ? "ig-detail-b ig-detail-b--imp" : "ig-detail-b"} ref={detailBRef}>
//                         {DETAIL_B}
//                     </span>
//                 </div>
//             </div>

//             <div className="ig-final" ref={finalRef} />
//         </div>
//     );
// }
