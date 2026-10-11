import { useGSAP } from "@gsap/react";
import { cn } from "cn";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function VotingIntro({ onComplete }: { onComplete: () => void }) {
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const envRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const ruleRef = useRef<HTMLDivElement>(null);
    const finalRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLSpanElement>(null);
    const cameraRef = useRef<HTMLDivElement>(null);
    const revealRef = useRef<HTMLHeadingElement>(null);
    const highlightRef = useRef<HTMLHeadingElement>(null);
    const narrativeRef = useRef<HTMLParagraphElement>(null);

    useGSAP(
        () => {
            gsap.set("#vi-wall", { opacity: 0 });
            gsap.set("#vi-vignette", { opacity: 0 });
            gsap.set("#vi-deep", { opacity: 0 });
            gsap.set([narrativeRef.current, revealRef.current, highlightRef.current, hintRef.current, ruleRef.current], { opacity: 0 });

            gsap.set(narrativeRef.current, { filter: "blur(9px)", y: 10 });
            gsap.set(revealRef.current, { filter: "blur(22px)", scale: 1.05 });
            gsap.set(highlightRef.current, { filter: "blur(22px)", scale: 1.05 });
            gsap.set(hintRef.current, { filter: "blur(8px)", y: 8 });
            gsap.set(ruleRef.current, { scaleX: 0 });

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            // tl.timeScale(3);

            tl.addLabel("vote-room", 0.15).to("#vi-wall", { opacity: 1, duration: 1, ease: "sine.inOut" }, "vote-room").to(cameraRef.current, { scale: 1.22, duration: 12, ease: "none" }, "vote-room");

            tl.addLabel("vote-narrative", 1.5)
                .to(narrativeRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power2.out" }, "vote-narrative")
                .to(narrativeRef.current, { opacity: 0, filter: "blur(7px)", y: -8, duration: 1, ease: "power1.in" }, "vote-narrative+=2");

            tl.addLabel("vote-blackout", 4.5).to(envRef.current, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "vote-blackout");

            tl.addLabel("vote-reveal", 5.5)
                .to(envRef.current, { opacity: 0.45, duration: 2.0, ease: "power2.inOut" }, "vote-reveal")
                .to(revealRef.current, { opacity: 0.5, duration: 0.06, ease: "none" }, "vote-reveal+=0.15")
                .to(revealRef.current, { opacity: 0.08, duration: 0.08, ease: "none" }, "vote-reveal+=0.23")
                .to(revealRef.current, { opacity: 1, duration: 0.1, ease: "none" }, "vote-reveal+=0.35")
                .fromTo(revealRef.current, { letterSpacing: "0.5em", marginRight: "-0.5em" }, { letterSpacing: "0.2em", marginRight: "-0.2em", filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" }, "vote-reveal+=0.2")
                .fromTo(highlightRef.current, { letterSpacing: "0.5em", marginRight: "-0.5em" }, { letterSpacing: "0.2em", marginRight: "-0.2em", opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" }, "vote-reveal+=0.45");

            tl.addLabel("vote-hint", 6.5).to("#vi-rule", { opacity: 1, scaleX: 1, duration: 1.2, ease: "power2.out" }, "vote-hint").to(hintRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power2.out" }, "vote-hint+=0.3");

            tl.addLabel("ending", 8)
                .to([narrativeRef.current, revealRef.current, highlightRef.current, hintRef.current, ruleRef.current], { opacity: 0, duration: 1.4, ease: "power1.in" }, "ending")
                .to(envRef.current, { opacity: 0, duration: 1.5, ease: "power2.inOut" }, "ending")
                .to(finalRef.current, { opacity: 1, duration: 1.5, ease: "power2.inOut" }, "ending+=0.2")
                .addLabel("end");

            tl.eventCallback("onComplete", () => onCompleteRef.current?.());

            return () => {
                tl.kill();
            };
        },
        { scope: rootRef, dependencies: [] },
    );

    return (
        <div id="vi-root" ref={rootRef} className="fixed inset-0 z-90 overflow-hidden select-none">
            <div id="vi-env" ref={envRef} className="absolute inset-0">
                <div id="vi-camera" ref={cameraRef} className="absolute inset-[-6%] will-change-transform">
                    <div id="vi-wall" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_38%,#101318_0%,#0a0c10_20%,#06070a_48%,#020203_70%)]" />
                </div>
            </div>

            <div id="vi-deep" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0)_8%,rgba(0,0,0,0.72)_72%,rgba(0,0,0,0.95)_100%)] opacity-0" />
            <div id="vi-vignette" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(0,0,0,0)_30%,rgba(0,0,0,0.42)_64%,rgba(0,0,0,0.9)_100%)]" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                <p ref={narrativeRef} className="m-0 text-2xl font-light tracking-[0.3em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_74%,transparent)] uppercase opacity-0">
                    Every stroke was a clue.
                </p>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pb-36 text-center">
                <div className="flex flex-col items-center">
                    <h1
                        ref={revealRef}
                        className="m-0 mr-[-0.2em] text-7xl leading-none font-medium tracking-[0.2em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_96%,transparent)] uppercase opacity-0 will-change-[opacity,filter,transform]"
                    >
                        Vote out the
                    </h1>
                    <h1
                        ref={highlightRef}
                        className="text-accent-red m-0 mt-2 mr-[-0.2em] text-7xl leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase opacity-0 will-change-[opacity,filter,transform] text-shadow-[0_0_40px_var(--accent-red-glow)]"
                    >
                        Imposter
                    </h1>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pt-24 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div id="vi-rule" ref={ruleRef} className="h-px w-37.5 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--foreground)_45%,transparent),transparent)] opacity-0" />
                    <span ref={hintRef} className={cn("m-0 mr-[-0.28em] text-sm font-light tracking-[0.28em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] uppercase opacity-0")}>
                        Someone was guessing.
                    </span>
                </div>
            </div>

            <div id="vi-final" ref={finalRef} className="pointer-events-none absolute inset-0 opacity-0" />
        </div>
    );
}
