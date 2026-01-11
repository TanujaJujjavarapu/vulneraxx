export default function ServicesSection() {
  const services = [
    {
      icon: "🔍",
      title: "Vulnerability Discovery",
      description:
        "Automated scanning and discovery of vulnerabilities across your entire infrastructure and assets.",
      features: [
        "Network Scanning",
        "Code Analysis",
        "Third-party Integration",
      ],
    },
    {
      icon: "📈",
      title: "Risk Assessment",
      description:
        "Intelligent prioritization based on threat severity, exploitability, and business impact.",
      features: ["CVSS Scoring", "Risk Metrics", "Priority Ranking"],
    },
    {
      icon: "🛡️",
      title: "Compliance Management",
      description:
        "Stay compliant with major standards and regulations with automated reporting.",
      features: ["PCI-DSS", "ISO 27001", "HIPAA", "SOC 2"],
    },
    {
      icon: "🤖",
      title: "AI-Powered Intelligence",
      description:
        "Machine learning-driven insights for predictive threat analysis and remediation.",
      features: ["Threat Prediction", "Anomaly Detection", "Smart Remediation"],
    },
    {
      icon: "📊",
      title: "Advanced Reporting",
      description:
        "Comprehensive dashboards and reports for executives and security teams.",
      features: ["Custom Reports", "Real-time Dashboard", "Export Options"],
    },
    {
      icon: "🔧",
      title: "Remediation Tracking",
      description:
        "Track and manage remediation efforts with automated workflows and SLA monitoring.",
      features: ["Workflow Automation", "SLA Tracking", "Team Collaboration"],
    },
  ];

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Comprehensive Security Solutions
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From discovery to remediation, our platform handles every aspect of
            vulnerability management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 bg-linear-to-br from-slate-900/50 to-slate-800/50 hover:from-slate-900 hover:to-slate-800 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-gray-400 mb-6">{service.description}</p>
              <div className="space-y-2">
                {service.features.map((feature, fIndex) => (
                  <div
                    key={fIndex}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
