const STORAGE_KEY = "sketchy-player-name";

export function getStoredPlayerName(): string | undefined {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        const trimmed = value?.trim();

        return trimmed && trimmed.length > 0 ? trimmed : undefined;
    } catch {
        return undefined;
    }
}

export function setStoredPlayerName(name: string) {
    try {
        const trimmed = name.trim();

        if (trimmed.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
        return;
    }
}
