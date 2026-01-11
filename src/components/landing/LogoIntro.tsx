import { useEffect, useState } from "react";

interface LogoIntroProps {
  onComplete: () => void;
}

export default function LogoIntro({ onComplete }: LogoIntroProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div
        className={`text-center transition-all duration-1000 ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        <div className="text-6xl font-bold mb-4">
          <span className="bg-linear-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent animate-pulse">
            VulneraX
          </span>
        </div>
        <div className="text-xl text-gray-300">
          Security Vulnerability Management
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
