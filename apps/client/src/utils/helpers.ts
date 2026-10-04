export function getInitials(name: string): string  {
    return name.split(" ").map(s => s[0].toUpperCase()).join("")
}