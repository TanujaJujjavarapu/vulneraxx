import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, Zap, Menu, X } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import vulneraxLogo from "../assets/vulnerax.png";
import vulnerax2 from "../assets/vulnerax2.png";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () =>
      setScrolled(window.scrollY > window.innerHeight - 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["Services", "Resources", "Blog", "Contact Us", "Careers"];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animated Canvas Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "opacity-100 bg-slate-950/95 backdrop-blur-lg border-b border-emerald-500/20"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-2 relative cursor-pointer"
              onClick={() => {
                navigate("/");
                window.scrollTo(0, 0);
              }}
            >
              <img
                src={vulneraxLogo}
                alt="Vulnerax Logo"
                className="h-16 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-linear-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-white rounded-lg font-medium transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-emerald-500/20 pt-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-gray-300 hover:text-emerald-400"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-emerald-500/20">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-center py-2 text-gray-300 hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-6 py-2 bg-linear-to-r from-emerald-500 to-lime-500 text-white rounded-lg font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Floating Icons */}
        <div
          className="absolute top-32 left-12 animate-bounce"
          style={{ animationDelay: "0s" }}
        >
          <div className="p-3 bg-slate-800/80 border border-emerald-500/30 rounded-lg">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div
          className="absolute top-40 right-16 animate-bounce"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="p-3 bg-slate-800/80 border border-emerald-500/30 rounded-lg">
            <Eye className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div
          className="absolute bottom-40 left-20 animate-bounce"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="p-3 bg-slate-800/80 border border-emerald-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Main Heading */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-white">Predict.</span>{" "}
            <span className="bg-linear-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
              Protect.
            </span>{" "}
            <span className="text-white">Prevent.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            VulneraX delivers cutting-edge vulnerability management and security
            monitoring to identify, assess, and remediate threats before they
            impact your business.
          </p>

          {/* Animated Shield Graphic */}
          <div
            className="mt-16 relative animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80">
              {/* Outer Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 animate-spin"
                style={{ animationDuration: "20s" }}
              />

              {/* Middle Ring */}
              <div
                className="absolute inset-4 rounded-full border border-emerald-400/40 animate-spin"
                style={{
                  animationDuration: "15s",
                  animationDirection: "reverse",
                }}
              />

              {/* Inner Glow */}
              <div className="absolute inset-8 rounded-full bg-linear-to-br from-emerald-500/20 to-lime-500/20 blur-xl" />

              {/* Center Shield */}
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <div className="bg-slate-800/80 p-8 rounded-2xl border border-emerald-500/50 animate-pulse">
                  <img
                    src={vulnerax2}
                    alt="Vulnerax"
                    className="w-32 h-32 object-contain"
                  />
                </div>
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
            animation: fadeIn 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6 border-t border-emerald-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Trusted by{" "}
            <span className="bg-linear-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
              Enterprises
            </span>
          </h2>
          <p className="text-center text-gray-400 text-lg max-w-2xl mx-auto mb-16">
            Real-time vulnerability management powering security teams worldwide
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "50K+", label: "Members Protected" },
              { value: "2.5K+", label: "Active Users" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "24/7", label: "Security Monitoring" },
            ].map((stat, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:-translate-y-2"
              >
                <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-400 font-medium">{stat.label}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 rounded-b-2xl transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              Why VulneraX
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
              Companies Trust Our{" "}
              <span className="bg-linear-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Enterprise-grade security solutions designed to protect your most
              valuable assets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Vulnerability Scanning",
                desc: "Continuous automated scanning to detect vulnerabilities across your entire infrastructure.",
                tags: ["Network Scanning", "Web App Testing", "API Security"],
              },
              {
                icon: "�",
                title: "Total Vulnerabilities",
                desc: "Comprehensive visibility into all detected vulnerabilities with priority scoring.",
                tags: ["CVE Database", "Zero-day Alerts", "Risk Scoring"],
              },
              {
                icon: "📊",
                title: "Average Risk Score",
                desc: "Real-time risk assessment and trending analysis for informed decision making.",
                tags: ["CVSS Scoring", "Trend Analysis", "Custom Metrics"],
              },
              {
                icon: "🛡️",
                title: "Compliance & SLA",
                desc: "Meet regulatory requirements with comprehensive reporting and SLA tracking.",
                tags: ["Compliance Reports", "SLA Tracking", "Audit Logs"],
              },
              {
                icon: "📦",
                title: "MTTD Monitoring",
                desc: "Rapid threat identification and detection with real-time monitoring capabilities.",
                tags: ["Real-time Alerts", "Threat Detection", "Analytics"],
              },
              {
                icon: "�",
                title: "MTTR Response",
                desc: "Accelerated incident response with automated remediation workflows.",
                tags: ["Auto Remediation", "Response Automation", "Reporting"],
              },
            ].map((service, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 transition-all"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-500/30 transition-colors">
                  <span className="text-2xl">{service.icon}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-5 text-sm leading-relaxed">
                  {service.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-medium text-cyan-400 bg-transparent border border-cyan-500/40 rounded-full hover:border-cyan-500/70 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 bg-linear-to-r from-emerald-600 to-lime-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Secure Your Infrastructure?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of enterprises that trust VulneraX for their security
            needs
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-emerald-500/20 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div
                className="flex items-center gap-2 mb-4 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <img
                  src={vulneraxLogo}
                  alt="Vulnerax Logo"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-sm text-gray-400">
                Enterprise vulnerability management platform
              </p>
            </div>
            {[
              { title: "Product", items: ["Features", "Pricing", "Security"] },
              { title: "Company", items: ["About", "Blog", "Careers"] },
              { title: "Legal", items: ["Privacy", "Terms", "Compliance"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2 text-sm">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-emerald-400 transition"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 VulneraX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
