import { cn } from "cn";
import React from "react";

interface NumberInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    defaultValue?: number;
    disabled?: boolean;
    label?: string;
    max?: number;
    min?: number;
    onChange?: (value: number) => void;
    step?: number;
    value?: number;
}

export function NumberInput({
    value: controlledValue,
    defaultValue = 0,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    onChange,
    label,
    disabled = false,
    className,
    ...props
}: NumberInputProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const current = controlledValue ?? internalValue;

    function update(v: number) {
        const clamped = Math.min(max, Math.max(min, v));
        if (controlledValue === undefined) {
            setInternalValue(clamped);
        }
        onChange?.(clamped);
    }

    return (
        <div data-slot="tron-number-input" className={cn("space-y-1", disabled && "opacity-40", className)} {...props}>
            {label ? <span className="text-foreground/40 block font-mono text-[9px] tracking-widest uppercase">{label}</span> : null}

            <div className="border-primary/20 bg-card/60 inline-flex items-stretch rounded border backdrop-blur-sm">
                <button
                    type="button"
                    disabled={disabled || current <= min}
                    onClick={() => update(current - step)}
                    className="border-primary/15 text-foreground/30 hover:bg-primary/10 hover:text-primary flex w-8 items-center justify-center border-r transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <svg aria-hidden="true" width="8" height="2" viewBox="0 0 8 2" fill="none">
                        <path d="M0 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                <input
                    type="text"
                    inputMode="numeric"
                    value={current}
                    disabled={disabled}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v)) {
                            update(v);
                        }
                    }}
                    className="text-foreground/70 w-12 bg-transparent py-1.5 text-center font-mono text-xs tabular-nums outline-none"
                />

                <button
                    type="button"
                    disabled={disabled || current >= max}
                    onClick={() => update(current + step)}
                    className="border-primary/15 text-foreground/30 hover:bg-primary/10 hover:text-primary flex w-8 items-center justify-center border-l transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M0 4h8M4 0v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
