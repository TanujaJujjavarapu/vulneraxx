export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20 pb-32"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 animate-fade-in">
          {/* Badge */}
          <div className="inline-block">
            <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
              🛡️ Advanced Vulnerability Management
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-white">Secure Your</span>
            <br />
            <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Digital Infrastructure
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Identify, assess, and manage vulnerabilities across your entire
            infrastructure with our AI-powered platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border border-cyan-500/50 text-cyan-400 rounded-lg font-medium hover:bg-cyan-500/10 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-cyan-400">10M+</div>
              <div className="text-gray-400">Vulnerabilities Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">5K+</div>
              <div className="text-gray-400">Enterprise Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Floating cards animation */}
        <div className="mt-20 relative h-64 hidden md:flex items-center justify-center gap-8">
          <div className="absolute w-72 h-40 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20 backdrop-blur-sm transform -rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer p-6">
            <div className="text-cyan-400 font-semibold mb-2">
              Real-time Detection
            </div>
            <div className="text-gray-300 text-sm">Monitor threats 24/7</div>
          </div>
          <div className="absolute w-72 h-40 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm transform rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer p-6">
            <div className="text-blue-400 font-semibold mb-2">
              AI-Powered Analysis
            </div>
            <div className="text-gray-300 text-sm">
              Intelligent threat assessment
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </section>
  );
}
