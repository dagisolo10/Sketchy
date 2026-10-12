import ErrorState from "@/components/error-state";

export default function NotFound() {
    return (
        <ErrorState
            code="404"
            title="Page not found"
            tone="danger"
            message="The room or page you're trying to reach doesn't exist, was deleted, or the imposter erased it before you arrived."
        />
    );
}
