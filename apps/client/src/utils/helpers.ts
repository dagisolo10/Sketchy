export function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((s) => s[0].toUpperCase())
        .join("");
}
