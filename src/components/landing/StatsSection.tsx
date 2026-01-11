export default function StatsSection() {
  const stats = [
    {
      icon: "📊",
      label: "CVEs Analyzed",
      value: "150K+",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: "⚡",
      label: "Detection Speed",
      value: "Real-time",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: "🔐",
      label: "Security Score",
      value: "A+ Average",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: "✅",
      label: "Risk Reduced",
      value: "87% Avg",
      color: "from-pink-500 to-red-500",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-transparent to-cyan-500/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Trusted by Security Teams Worldwide
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Our platform delivers measurable results with comprehensive
          vulnerability management
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group p-6 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 bg-linear-to-br from-cyan-500/5 to-blue-500/5 hover:from-cyan-500/10 hover:to-blue-500/10"
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300`}
              ></div>

              <div className="relative z-10">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
