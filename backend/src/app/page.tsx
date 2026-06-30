import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-lg shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-widest text-orange-500">FUZZY SERVER</h1>
          <p className="text-xs text-slate-400 mt-1.5 uppercase font-semibold">Backend API & Admin Portal</p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <h3 className="font-bold text-white text-sm">System Architecture</h3>
          <p>
            • <strong className="text-slate-100">Frontend (Vite):</strong> Mobile-first E-Commerce App running at <code className="text-orange-400 font-bold">http://localhost:5173</code> (or dev port).
          </p>
          <p>
            • <strong className="text-slate-100">Backend (Next.js):</strong> REST API routes and administrative operations running at <code className="text-orange-400 font-bold">http://localhost:3001</code>.
          </p>
          <p>
            • <strong className="text-slate-100">Database:</strong> SQLite database with automatic WAL mode and seed data.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Link
            href="/admin"
            className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10 text-center"
          >
            Go to Admin UI
          </Link>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-colors text-center"
          >
            Open React User App
          </a>
        </div>
      </div>
    </div>
  );
}
