import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";
import { Link } from "react-router";

type NavLinkProps = {
    to: string;
    title: string;
    icon: LucideIcon;
};

export default function NavLink({ icon: Icon, title, to }: NavLinkProps) {
    return (
        <Link to={to} className="inline-block">
            <Button size="lg" variant="default" className="gap-3 px-8 text-base font-black tracking-wider h-14 uppercase">
                <Icon className="size-5" />
                {title}
            </Button>
        </Link>
    );
}