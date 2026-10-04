import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen flex-col justify-between bg-[#05070a] px-6 py-10 text-slate-300 lg:px-16">
            <div className="flex items-center justify-between gap-4">
                <Link to="/" className="group flex items-center gap-2">
                    <span className="text-glow group-hover:text-primary text-2xl font-black tracking-wider transition-colors">
                        SKETCHY<span className="text-accent-red">.</span>
                    </span>
                </Link>
            </div>

            <div className="my-auto max-w-4xl space-y-6 py-12">
                <div className="text-glow-red text-primary text-6xl font-black tracking-tighter sm:text-9xl">404</div>

                <h1 className="text-3xl font-black tracking-tight uppercase sm:text-6xl">PAGE NOT FOUND</h1>

                <p className="max-w-xl text-base text-slate-400 sm:text-lg">The room or page you're trying to reach doesn't exist, was deleted, or the imposter erased it before you arrived.</p>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <Link to="/">
                        <Button className="glow-primary group bg-primary text-background hover:border-primary hover:text-foreground h-14 w-full gap-3 rounded-none border border-transparent px-8 text-base font-bold tracking-wider uppercase hover:bg-transparent sm:w-auto">
                            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
                            <span>RETURN HOME</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
