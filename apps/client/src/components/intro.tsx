import { useGSAP } from "@gsap/react";
import type { Role } from "@package/types";
import { cn } from "cn";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function IntroPage({ onComplete, secretWord, fellowImposters, role }: { onComplete: () => void; secretWord: string | null; fellowImposters: string[]; role: Role }) {
    const isImposter = role === "imposter";

    const NARRATIVE = "LET THE GAMES BEGIN.";
    const DETAIL_A = isImposter ? null : "Your word";
    const DETAIL_B = isImposter ? "Find the word before they find you." : secretWord;
    const DETAIL_C = isImposter && fellowImposters.length > 0;
    const fellowLabel = fellowImposters.length > 1 ? "Your fellow imposters" : "Your fellow imposter";

    const envRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const finalRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<HTMLDivElement>(null);
    const detailCRef = useRef<HTMLDivElement>(null);
    const roleRef = useRef<HTMLHeadingElement>(null);
    const detailARef = useRef<HTMLSpanElement>(null);
    const detailBRef = useRef<HTMLSpanElement>(null);
    const yourRoleRef = useRef<HTMLHeadingElement>(null);
    const narrativeRef = useRef<HTMLParagraphElement>(null);

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useGSAP(
        () => {
            gsap.set("#ig-wall", { opacity: 0 });
            gsap.set("#ig-detail-rule", { opacity: 0, scaleX: 0 });
            gsap.set("#ig-deep", { opacity: 0 });
            gsap.set([narrativeRef.current, yourRoleRef.current, roleRef.current, detailARef.current, detailBRef.current, detailCRef.current], { opacity: 0 });

            gsap.set(narrativeRef.current, { filter: "blur(9px)", y: 10 });
            gsap.set(yourRoleRef.current, { filter: "blur(16px)" });
            gsap.set(roleRef.current, { filter: "blur(22px)", scale: 1.05 });
            gsap.set(detailARef.current, { filter: "blur(6px)", y: 8 });
            gsap.set(detailBRef.current, { filter: "blur(14px)", y: 6 });
            gsap.set(detailCRef.current, { filter: "blur(10px)", y: 6 });

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.addLabel("intro-room", 0.15).to("#ig-wall", { opacity: 1, duration: 1, ease: "sine.inOut" }, "intro-room").to(cameraRef.current, { scale: 1.25, duration: 12, ease: "none" }, "intro-room");

            tl.addLabel("intro-narrative", 1.5)
                .to(narrativeRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power2.out" }, "intro-narrative")
                .to(narrativeRef.current, { opacity: 0, filter: "blur(7px)", y: -8, duration: 1, ease: "power1.in" }, "intro-narrative+=2");

            tl.addLabel("intro-silence", 4).to(envRef.current, { opacity: 0.05, duration: 0.5, ease: "power2.inOut" }, "intro-silence");

            tl.addLabel("intro-blackout", 4.5).to(envRef.current, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "intro-blackout");

            tl.addLabel("intro-yourRole", 5)
                .fromTo(yourRoleRef.current, { letterSpacing: "0.55em", marginRight: "-0.55em" }, { letterSpacing: "0.24em", marginRight: "-0.24em", opacity: 1, filter: "blur(0px)", duration: 2, ease: "power2.out" }, "intro-yourRole")
                .to(yourRoleRef.current, { letterSpacing: "0.65em", opacity: 0, filter: "blur(11px)", duration: 1, ease: "power1.in" }, "intro-yourRole+=2.6");

            tl.addLabel("intro-reveal", 8.5)
                .to(envRef.current, { opacity: 0.4, duration: 2.2, ease: "power2.inOut" }, "intro-reveal+=0.3")
                .to(roleRef.current, { opacity: 0.5, duration: 0.06, ease: "none" }, "intro-reveal+=0.3")
                .to(roleRef.current, { opacity: 0.08, duration: 0.08, ease: "none" }, "intro-reveal+=0.38")
                .to(roleRef.current, { opacity: 1, duration: 0.1, ease: "none" }, "intro-reveal+=0.5")
                .fromTo(roleRef.current, { letterSpacing: "0.5em", marginRight: "-0.5em" }, { letterSpacing: "0.16em", marginRight: "-0.16em", filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" }, "intro-reveal+=0.32")
                .to(cameraRef.current, { scale: 1.078, x: -23, duration: 4.0, ease: "power1.out" }, "intro-yourRole+=0.7");

            tl.addLabel("intro-roleSpecific", 10.5)
                .to("#ig-detail-rule", { opacity: 1, scaleX: 1, duration: 1.2, ease: "power2.out" }, "intro-roleSpecific")
                .to(roleRef.current, { y: -46, duration: 1.4, ease: "power2.out" }, "intro-roleSpecific")
                .to(detailARef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power2.out" }, "intro-roleSpecific");

            if (isImposter) {
                tl.to(envRef.current, { opacity: 0.1, duration: 2.8, ease: "power2.inOut" }, "intro-roleSpecific+=0.2")
                    .to("#ig-deep", { opacity: 0.85, duration: 3.2, ease: "power2.inOut" }, "intro-roleSpecific+=0.2")
                    .fromTo(
                        detailBRef.current,
                        { letterSpacing: "0.3em", marginRight: "-0.3em" },
                        { letterSpacing: "0.16em", marginRight: "-0.16em", opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" },
                        "intro-roleSpecific+=0.75",
                    );

                if (DETAIL_C) {
                    tl.fromTo(detailCRef.current, { y: 10, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power2.out" }, "intro-roleSpecific+=1.1");
                }
            } else {
                tl.to(envRef.current, { opacity: 0.9, duration: 2.8, ease: "power2.inOut" }, "intro-roleSpecific+=0.2").fromTo(
                    detailBRef.current,
                    { letterSpacing: "0.5em", marginRight: "-0.5em" },
                    { letterSpacing: "0.3em", marginRight: "-0.3em", opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" },
                    "intro-roleSpecific+=0.75",
                );
            }

            tl.addLabel("intro-ending", 13)
                .to([roleRef.current, detailARef.current, detailBRef.current, detailCRef.current, yourRoleRef.current, narrativeRef.current], { opacity: 0, duration: 1.4, ease: "power1.in" }, "intro-ending")
                .to(["#ig-deep", "#ig-detail-rule"], { opacity: 0, duration: 1.6, ease: "power1.in" }, "intro-ending")
                .to(envRef.current, { opacity: 0, duration: 1.8, ease: "power2.inOut" }, "intro-ending")
                .to(finalRef.current, { opacity: 1, duration: 1.8, ease: "power2.inOut" }, "intro-ending+=0.2")
                .addLabel("intro-end");

            tl.eventCallback("onComplete", () => onCompleteRef.current?.());

            return () => {
                tl.kill();
            };
        },
        { scope: rootRef, dependencies: [] },
    );

    return (
        <div id="ig-root" ref={rootRef} className="fixed inset-0 overflow-hidden select-none">
            <div id="ig-env" ref={envRef} className="absolute inset-0">
                <div id="ig-camera" ref={cameraRef} className="absolute inset-[-6%] will-change-transform">
                    <div id="ig-wall" className="cinema-wall absolute inset-0" />
                </div>
            </div>

            <div id="ig-deep" className="cinema-deep pointer-events-none absolute inset-0 opacity-0" />
            <div id="ig-vignette" className="cinema-vignette pointer-events-none absolute inset-0" />

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                <p id="ig-narrative" ref={narrativeRef} className="text-foreground/70 font-display m-0 mr-[-0.2em] text-xl font-light tracking-[0.3em] whitespace-nowrap uppercase opacity-0 sm:text-5xl">
                    {NARRATIVE}
                </p>
            </div>

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                <h2 id="ig-your-role" ref={yourRoleRef} className="text-foreground/90 font-display m-0 mr-[-0.55em] text-4xl font-bold tracking-[0.5em] whitespace-nowrap uppercase opacity-0 will-change-[opacity,filter,transform] sm:text-7xl">
                    Your Role
                </h2>
            </div>

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pb-24 text-center">
                <h1
                    id="ig-role"
                    ref={roleRef}
                    className={cn(
                        "font-display m-0 mr-[-0.3em] text-5xl leading-none font-medium tracking-[0.3em] whitespace-nowrap uppercase opacity-0 will-change-[opacity,filter,transform] sm:mr-[-0.5em] sm:text-7xl sm:tracking-[0.5em] lg:text-8xl",
                        isImposter ? "text-danger glow-red-lg-text" : "text-success text-glow-green-lg",
                    )}
                >
                    {role}
                </h1>
            </div>

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pt-40 text-center">
                <div id="ig-detail" className="flex flex-col items-center gap-6 text-center">
                    <div id="ig-detail-rule" className="cinema-rule h-px w-37.5 opacity-0" />
                    {DETAIL_A && (
                        <span
                            id="ig-detail-a"
                            ref={detailARef}
                            className={cn(isImposter ? "mr-[-0.28em] font-light tracking-[0.2em]" : "mr-[-0.55em] font-normal tracking-[0.55em]", "text-foreground/70 m-0 text-sm whitespace-nowrap uppercase opacity-0 sm:text-xl")}
                        >
                            {DETAIL_A}
                        </span>
                    )}
                    <span
                        id="ig-detail-b"
                        ref={detailBRef}
                        className={cn(
                            isImposter ? "mr-[-0.2em] tracking-[0.2em]" : "mr-[-0.3em] text-4xl tracking-[0.3em]",
                            "inline-block leading-tight select-none",
                            "text-foreground font-display m-0 mx-auto max-w-96 leading-none font-medium uppercase opacity-0 will-change-[opacity,filter,transform] sm:max-w-max sm:text-5xl",
                        )}
                    >
                        {DETAIL_B}
                    </span>

                    {DETAIL_C && (
                        <div id="ig-detail-c" ref={detailCRef} className="flex flex-col items-center gap-4 opacity-0 will-change-[opacity,filter,transform]">
                            <span className="text-foreground/90 mr-[-0.2em] text-sm font-light tracking-[0.2em] whitespace-nowrap uppercase sm:mr-[-0.28em] sm:text-lg sm:tracking-[0.28em]">{fellowLabel}</span>

                            <div className="flex flex-wrap justify-center gap-4 sm:gap-16">
                                {fellowImposters.map((name, i) => (
                                    <div
                                        key={`${name}-${i}`}
                                        className="text-danger/90 font-display m-0 mr-[-0.16em] flex items-center text-3xl leading-none font-medium tracking-[0.16em] whitespace-nowrap uppercase sm:mr-[-0.24em] sm:text-5xl sm:tracking-[0.24em]"
                                    >
                                        <span>{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div id="ig-final" ref={finalRef} className="pointer-events-none absolute inset-0 opacity-0" />
        </div>
    );
}
