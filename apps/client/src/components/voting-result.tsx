import { useGSAP } from "@gsap/react";
import type { EliminatedPlayer } from "@package/types";
import { cn } from "cn";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function VotingResult({ result, onComplete }: { result: EliminatedPlayer | null; onComplete: () => void }) {
    const eliminated = result;

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const envRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const finalRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<HTMLDivElement>(null);
    const narrativeRef = useRef<HTMLParagraphElement>(null);
    const verdictRef = useRef<HTMLHeadingElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const ruleRef = useRef<HTMLDivElement>(null);
    const detailRef = useRef<HTMLSpanElement>(null);

    useGSAP(
        () => {
            gsap.set("#vr-wall", { opacity: 0 });
            gsap.set("#vr-vignette", { opacity: 0 });
            gsap.set("#vr-deep", { opacity: 0 });
            gsap.set([narrativeRef.current, verdictRef.current, nameRef.current, ruleRef.current, detailRef.current], { opacity: 0 });

            gsap.set(narrativeRef.current, { filter: "blur(9px)", y: 10 });
            gsap.set(verdictRef.current, { filter: "blur(18px)", scale: 1.05 });
            gsap.set(nameRef.current, { filter: "blur(22px)", scale: 1.05 });
            gsap.set(detailRef.current, { filter: "blur(10px)", y: 8 });
            gsap.set(ruleRef.current, { scaleX: 0 });

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.addLabel("vote-result-room", 0.15).to("#vr-wall", { opacity: 1, duration: 1, ease: "sine.inOut" }, "vote-result-room").to(cameraRef.current, { scale: 1.22, duration: 13, ease: "none" }, "vote-result-room");

            tl.addLabel("vote-result-narrative", 1.5)
                .to(narrativeRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power2.out" }, "vote-result-narrative")
                .to(narrativeRef.current, { opacity: 0, filter: "blur(7px)", y: -8, duration: 1, ease: "power1.in" }, "vote-result-narrative+=2");

            tl.addLabel("vote-result-blackout", 4.5).to(envRef.current, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "vote-result-blackout");

            tl.addLabel("vote-result-reveal", 5.5)
                .to(envRef.current, { opacity: eliminated ? 0.45 : 0.3, duration: 2.4, ease: "power2.inOut" }, "vote-result-reveal")
                .to(verdictRef.current, { opacity: 0.5, duration: 0.06, ease: "none" }, "vote-result-reveal+=0.15")
                .to(verdictRef.current, { opacity: 0.08, duration: 0.08, ease: "none" }, "vote-result-reveal+=0.23")
                .to(verdictRef.current, { opacity: 1, duration: 0.1, ease: "none" }, "vote-result-reveal+=0.35")
                .fromTo(verdictRef.current, { letterSpacing: "0.5em", marginRight: "-0.5em" }, { letterSpacing: "0.2em", marginRight: "-0.2em", filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" }, "vote-result-reveal+=0.2");

            if (eliminated) {
                tl.fromTo(
                    nameRef.current,
                    { letterSpacing: "0.5em", marginRight: "-0.5em" },
                    { letterSpacing: "0.2em", marginRight: "-0.2em", opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" },
                    "vote-result-reveal+=0.55",
                );
            }

            tl.addLabel("vote-result-detail", 7)
                .to("#vr-rule", { opacity: 1, scaleX: 1, duration: 1.2, ease: "power2.out" }, "vote-result-detail")
                .to(detailRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.2, ease: "power2.out" }, "vote-result-detail+=0.3");

            tl.addLabel("vote-result-ending", 9)
                .to([narrativeRef.current, verdictRef.current, nameRef.current, detailRef.current, ruleRef.current], { opacity: 0, duration: 1.4, ease: "power1.in" }, "vote-result-ending")
                .to(envRef.current, { opacity: 0, duration: 1.8, ease: "power2.inOut" }, "vote-result-ending")
                .to(finalRef.current, { opacity: 1, duration: 1.8, ease: "power2.inOut" }, "vote-result-ending+=0.2")
                .addLabel("vote-result-end");

            tl.eventCallback("onComplete", () => onCompleteRef.current?.());

            return () => {
                tl.kill();
            };
        },
        { scope: rootRef, dependencies: [!!eliminated] },
    );

    const verdict = eliminated ? eliminated.name : "No one was eliminated";
    const isRed = eliminated?.role === "imposter";
    const detail = eliminated ? `${eliminated.name} was an ${eliminated.role.toUpperCase()}` : "The imposter is still hiding among you. Stay sharp.";

    const verdictStyle = eliminated
        ? isRed
            ? "text-accent-red text-shadow-[0_0_40px_var(--accent-red-glow)]"
            : "text-accent-green text-shadow-[0_0_40px_var(--accent-green-glow)]"
        : "text-accent-amber text-shadow-[0_0_40px_var(--accent-amber-glow)]";

    return (
        <div id="vr-root" ref={rootRef} className="fixed inset-0 z-90 overflow-hidden select-none">
            <div id="vr-env" ref={envRef} className="absolute inset-0">
                <div id="vr-camera" ref={cameraRef} className="absolute inset-[-6%] will-change-transform">
                    <div id="vr-wall" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_38%,#101318_0%,#0a0c10_20%,#06070a_48%,#020203_70%)]" />
                </div>
            </div>

            <div id="vr-deep" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0)_8%,rgba(0,0,0,0.72)_72%,rgba(0,0,0,0.95)_100%)] opacity-0" />
            <div id="vr-vignette" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(0,0,0,0)_30%,rgba(0,0,0,0.42)_64%,rgba(0,0,0,0.9)_100%)]" />

            {eliminated ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                    <p ref={narrativeRef} className="m-0 mr-[-0.4em] text-2xl font-light tracking-[0.3em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_74%,transparent)] uppercase opacity-0">
                        The vote is in
                    </p>
                </div>
            ) : (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                    <p ref={narrativeRef} className="m-0 mr-[-0.3em] text-2xl font-light tracking-[0.3em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_74%,transparent)] uppercase opacity-0">
                        The vote is in
                    </p>
                </div>
            )}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pb-20 text-center">
                <div className="flex flex-col items-center">
                    <h1 ref={verdictRef} className={cn(verdictStyle, "m-0 mr-[-0.2em] text-7xl leading-none font-black tracking-[0.2em] whitespace-nowrap uppercase opacity-0 will-change-[opacity,filter,transform]")}>
                        {eliminated ? "Eliminated" : verdict}
                    </h1>

                    {eliminated ? (
                        <h2
                            ref={nameRef}
                            className="m-0 mt-4 mr-[-0.3em] text-[40px] leading-none font-bold tracking-[0.3em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_96%,transparent)] uppercase opacity-0 will-change-[opacity,filter,transform]"
                        >
                            {verdict}
                        </h2>
                    ) : null}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pt-40 text-center">
                <div className="flex flex-col items-center gap-7">
                    <div id="vr-rule" ref={ruleRef} className="h-px w-37.5 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--foreground)_45%,transparent),transparent)] opacity-0" />
                    <span ref={detailRef} className={cn("m-0 mr-[-0.28em] text-2xl font-light tracking-[0.28em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] uppercase opacity-0")}>
                        {detail}
                    </span>
                </div>
            </div>

            <div id="vr-final" ref={finalRef} className="pointer-events-none absolute inset-0 opacity-0" />
        </div>
    );
}
