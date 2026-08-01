import { healthStatus } from "@/lib/api";

export default async function Health() {
    const health = await healthStatus();


    return (
        <div className="bg-slate-900 text-slate-200 w-screen min-h-screen flex gap-2 flex-col items-center justify-center">
            <h1>Health: <span className="text-green-500">{health.message}</span></h1>
            <h2>Success: <span className="text-green-500">{health.success.toString()}</span></h2>
        </div>
    );
}
