import { type LucideIcon } from "lucide-react";
import { Link } from "react-router";

type NavLinkProps = {
    to: string;
    title: string;
    icon: LucideIcon;
};

export default function NavLink({ icon: Icon, title, to }: NavLinkProps) {
    return (
        <Link
            to={to}
            className="glow-primary bg-primary group text-background hover:text-foreground hover:border-primary flex h-14 w-fit items-center gap-3 border border-transparent px-8 text-base font-bold tracking-wider uppercase transition-[scale,color,background-color,border-color] duration-[300ms,500ms,500ms,500ms] hover:bg-transparent active:scale-98"
        >
            <Icon className="fill-background group-hover:fill-foreground size-5 transition-colors duration-500" />
            <span>{title}</span>
        </Link>
    );
}
