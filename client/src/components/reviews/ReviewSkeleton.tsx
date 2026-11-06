export default function ReviewSkeleton() {
    return (
        <div className="flex animate-pulse flex-col gap-5">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="flex flex-col gap-3 border-b py-5"
                >
                    <div className="flex justify-between">
                        <div className="h-4 w-28 rounded bg-muted" />
                        <div className="h-4 w-24 rounded bg-muted" />
                    </div>

                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}