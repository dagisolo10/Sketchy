import ErrorState from "@/components/error-state";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Unhandled UI error", error, info);
    }

    private readonly reset = () => {
        this.setState({ error: null });
    };

    override render() {
        if (this.state.error) {
            return (
                <ErrorState
                    code="ERROR"
                    title="Something broke"
                    tone="danger"
                    message={this.state.error.message || "An unexpected error occurred while rendering this page. Please try again."}
                    onRetry={this.reset}
                />
            );
        }

        return this.props.children;
    }
}
