export default function Header() {
  return (
    <header className="bg-[#0a0a0f] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <div className="text-2xl font-bold text-cyan-300">Vulnerax</div>
        <div className="text-sm text-slate-400">
          Security insights dashboard
        </div>
      </div>
    </header>
  );
}
