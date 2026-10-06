import { useGSAP } from "@gsap/react";
import type { Role } from "@package/types";
import { cn } from "cn";
import { gsap } from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function IntroPage({ onComplete, secretWord, role }: { onComplete: () => void; secretWord: string | null; role: Role }) {
    const isImposter = role === "imposter";

    const NARRATIVE = "LET THE GAMES BEGIN.";
    const DETAIL_A = isImposter ? "You don't know the word." : "Your word";
    const DETAIL_B = isImposter ? "Find it before they find you." : secretWord;

    const envRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const finalRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<HTMLDivElement>(null);
    const roleRef = useRef<HTMLHeadingElement>(null);
    const detailARef = useRef<HTMLSpanElement>(null);
    const detailBRef = useRef<HTMLSpanElement>(null);
    const yourRoleRef = useRef<HTMLHeadingElement>(null);
    const narrativeRef = useRef<HTMLParagraphElement>(null);

    useGSAP(
        () => {
            gsap.set("#ig-wall, #ig-floor", { opacity: 0 });
            gsap.set("#ig-detail-rule", { opacity: 0, scaleX: 0 });
            gsap.set("#ig-deep", { opacity: 0 });
            gsap.set([narrativeRef.current, yourRoleRef.current, roleRef.current, detailARef.current, detailBRef.current], { opacity: 0 });

            gsap.set(narrativeRef.current, { filter: "blur(9px)", y: 10 });
            gsap.set(yourRoleRef.current, { filter: "blur(16px)" });
            gsap.set(roleRef.current, { filter: "blur(22px)", scale: 1.05 });
            gsap.set(detailARef.current, { filter: "blur(6px)", y: 8 });
            gsap.set(detailBRef.current, { filter: "blur(14px)", y: 6 });

            const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete });

            tl.addLabel("room", 0.15)
                .to("#ig-wall", { opacity: 1, duration: 1, ease: "sine.inOut" }, "room")
                .to("#ig-floor", { opacity: 1, duration: 1, ease: "sine.inOut" }, "room+=0.4")
                .to(cameraRef.current, { scale: 1.25, duration: 12, ease: "none" }, "room");

            tl.addLabel("narrative", 1.5)
                .to(narrativeRef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power2.out" }, "narrative")
                .to(narrativeRef.current, { opacity: 0, filter: "blur(7px)", y: -8, duration: 1, ease: "power1.in" }, "narrative+=2");

            tl.addLabel("silence", 4).to(envRef.current, { opacity: 0.05, duration: 0.5, ease: "power2.inOut" }, "silence");

            tl.addLabel("blackout", 4.5).to(envRef.current, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "blackout");

            tl.addLabel("yourRole", 5)
                .fromTo(
                    yourRoleRef.current,
                    { letterSpacing: "0.55em", marginRight: "-0.55em" },
                    { letterSpacing: "0.24em", marginRight: "-0.24em", opacity: 1, filter: "blur(0px)", duration: 2, ease: "power2.out" },
                    "yourRole",
                )
                .to(yourRoleRef.current, { letterSpacing: "0.65em", opacity: 0, filter: "blur(11px)", duration: 1, ease: "power1.in" }, "yourRole+=2.6");

            tl.addLabel("reveal", 8.5)
                .to(envRef.current, { opacity: 0.4, duration: 2.2, ease: "power2.inOut" }, "reveal+=0.3")
                .to(roleRef.current, { opacity: 0.5, duration: 0.06, ease: "none" }, "reveal+=0.3")
                .to(roleRef.current, { opacity: 0.08, duration: 0.08, ease: "none" }, "reveal+=0.38")
                .to(roleRef.current, { opacity: 1, duration: 0.1, ease: "none" }, "reveal+=0.5")
                .fromTo(
                    roleRef.current,
                    { letterSpacing: "0.5em", marginRight: "-0.5em" },
                    { letterSpacing: "0.16em", marginRight: "-0.16em", filter: "blur(0px)", scale: 1, duration: 1.6, ease: "power3.out" },
                    "reveal+=0.32",
                )
                .to(cameraRef.current, { scale: 1.078, x: -23, duration: 4.0, ease: "power1.out" }, "yourRole+=0.7");

            tl.addLabel("roleSpecific", 10.5)
                .to("#ig-detail-rule", { opacity: 1, scaleX: 1, duration: 1.2, ease: "power2.out" }, "roleSpecific")
                .to(roleRef.current, { y: -46, duration: 1.4, ease: "power2.out" }, "roleSpecific")
                .to(detailARef.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power2.out" }, "roleSpecific");

            if (isImposter) {
                tl.to(envRef.current, { opacity: 0.1, duration: 2.8, ease: "power2.inOut" }, "roleSpecific+=0.2")
                    .to("#ig-deep", { opacity: 0.85, duration: 3.2, ease: "power2.inOut" }, "roleSpecific+=0.2")
                    .fromTo(
                        detailBRef.current,
                        { letterSpacing: "0.3em", marginRight: "-0.3em" },
                        { letterSpacing: "0.16em", marginRight: "-0.16em", opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" },
                        "roleSpecific+=0.75",
                    );
            } else {
                tl.to(envRef.current, { opacity: 0.9, duration: 2.8, ease: "power2.inOut" }, "roleSpecific+=0.2").fromTo(
                    detailBRef.current,
                    { letterSpacing: "0.5em", marginRight: "-0.5em" },
                    { letterSpacing: "0.3em", marginRight: "-0.3em", opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" },
                    "roleSpecific+=0.75",
                );
            }

            tl.addLabel("ending", 13)
                .to([roleRef.current, detailARef.current, detailBRef.current, yourRoleRef.current, narrativeRef.current], { opacity: 0, duration: 1.4, ease: "power1.in" }, "ending")
                .to(["#ig-deep", "#ig-detail-rule"], { opacity: 0, duration: 1.6, ease: "power1.in" }, "ending")
                .to(envRef.current, { opacity: 0, duration: 1.8, ease: "power2.inOut" }, "ending")
                .to(finalRef.current, { opacity: 1, duration: 1.8, ease: "power2.inOut" }, "ending+=0.2")
                .addLabel("end");

            return () => {
                tl.kill();
            };
        },
        { scope: rootRef },
    );

    return (
        <div id="ig-root" ref={rootRef} className="fixed inset-0 overflow-hidden select-none">
            <div id="ig-env" ref={envRef} className="absolute inset-0">
                <div id="ig-camera" ref={cameraRef} className="absolute inset-[-6%] will-change-transform">
                    <div id="ig-wall" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_38%,#101318_0%,#0a0c10_20%,#06070a_48%,#020203_70%)]" />
                </div>
            </div>

            <div id="ig-deep" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0)_8%,rgba(0,0,0,0.72)_72%,rgba(0,0,0,0.95)_100%)] opacity-0" />
            <div id="ig-vignette" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(0,0,0,0)_30%,rgba(0,0,0,0.42)_64%,rgba(0,0,0,0.9)_100%)]" />

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-[6vw] text-center">
                <p
                    id="ig-narrative"
                    ref={narrativeRef}
                    className="m-0 mr-[-0.4em] text-[clamp(48px,2.8vw,16px)] font-light tracking-[0.3em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_74%,transparent)] uppercase opacity-0"
                >
                    {NARRATIVE}
                </p>
            </div>

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-[6vw] text-center">
                <h2
                    id="ig-your-role"
                    ref={yourRoleRef}
                    className="m-0 mr-[-0.55em] text-[clamp(26px,5.6vw,64px)] font-normal tracking-[0.55em] whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_94%,transparent)] uppercase opacity-0 will-change-[opacity,filter,transform]"
                >
                    Your Role
                </h2>
            </div>

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-[6vw] pb-[13vh] text-center">
                <h1
                    id="ig-role"
                    ref={roleRef}
                    className={cn(
                        isImposter ? "text-accent-red" : "text-accent-green",
                        isImposter ? "text-shadow-[0_0_40px_var(--accent-red-glow)]" : "text-shadow-[0_0_40px_var(--accent-green-glow)]",
                        isImposter ? "text-shadow-[0_0_130px_rgba(255,42,109,0.24)]" : "text-shadow-[0_0_40px_rgba(5,255,161,0.24)]",
                        "m-0 mr-[-0.5em] text-[clamp(30px,9vw,112px)] leading-none font-medium tracking-[0.5em] whitespace-nowrap uppercase opacity-0 will-change-[opacity,filter,transform]",
                    )}
                >
                    {role}
                </h1>
            </div>

            <div id="ig-layer" className="pointer-events-none absolute inset-0 flex items-center justify-center px-[6vw] pt-[17vh] text-center">
                <div id="ig-detail" className="flex flex-col items-center gap-[clamp(14px,2.4vh,28px)] text-center">
                    <div
                        id="ig-detail-rule"
                        className="h-px w-[clamp(64px,12vw,150px)] bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--foreground)_45%,transparent),transparent)] opacity-0"
                    />
                    <span
                        id="ig-detail-a"
                        ref={detailARef}
                        className={cn(
                            isImposter ? "mr-[-0.28em] text-[clamp(10px,1.6vw,14px)] font-light tracking-[0.28em]" : "mr-[-0.55em] text-[clamp(10px,1.5vw,13px)] font-normal tracking-[0.55em]",
                            "m-0whitespace-nowrap text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] uppercase opacity-0",
                        )}
                    >
                        {DETAIL_A}
                    </span>
                    <span
                        id="ig-detail-b"
                        ref={detailBRef}
                        className={cn(
                            isImposter ? "mr-[-0.3em] text-[clamp(13px,2.6vw,22px)] tracking-[0.3em]" : "mr-[-0.5em] text-[clamp(30px,6.5vw,84px)] tracking-[0.5em]",
                            "m-0 leading-none font-medium whitespace-nowrap uppercase opacity-0 will-change-[opacity,filter,transform]",
                        )}
                    >
                        {DETAIL_B}
                    </span>
                </div>
            </div>

            <div id="ig-final" ref={finalRef} className="pointer-events-none absolute inset-0 opacity-0" />
        </div>
    );
}
