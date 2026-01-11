import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent } from "@mui/material";
import logo from "../assets/vulnerax.png";

const sectors = [
  {
    id: "finance",
    name: "Finance",
    icon: "🏦",
    color: "#0ea5a4",
    description: "Banking, investment, and financial services",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    color: "#ef4444",
    description: "Hospitals, clinics, and medical services",
  },
  {
    id: "technology",
    name: "Technology",
    icon: "💻",
    color: "#8b5cf6",
    description: "Software, IT services, and tech companies",
  },
  {
    id: "retail",
    name: "Retail",
    icon: "🛒",
    color: "#f59e0b",
    description: "Stores, e-commerce, and retail operations",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: "🏭",
    color: "#6b7280",
    description: "Industrial, production, and factory operations",
  },
  {
    id: "energy",
    name: "Energy",
    icon: "⚡",
    color: "#eab308",
    description: "Power, oil, gas, and energy utilities",
  },
];

export default function SectorSelector() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized] = useState(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole") || "user";
    const isAdminRole = userRole === "admin";

    if (isLoggedIn !== "true") {
      navigate("/login");
      return false;
    }

    if (!isAdminRole) {
      navigate("/");
      return false;
    }

    return true;
  });

  // Perform navigation checks
  useEffect(() => {
    if (!isAuthorized) {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userRole = localStorage.getItem("userRole") || "user";

      if (isLoggedIn !== "true") {
        navigate("/login");
      } else if (userRole !== "admin") {
        navigate("/");
      }
    }
  }, [navigate, isAuthorized]);

  const handleSectorSelect = async (sectorId: string) => {
    setIsLoading(true);

    try {
      // Store selected sector in localStorage
      localStorage.setItem("selectedSector", sectorId);

      // Simulate a brief loading for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate to home page (overview/dashboard)
      navigate("/");
    } catch (error) {
      console.error("Error selecting sector:", error);
      setIsLoading(false);
    }
  };

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen text-slate-200 flex items-center justify-center p-4 relative overflow-hidden bg-[#0b1220]">
      {/* Blurred logo background */}
      <div
        className="fixed top-0 left-0 w-full h-screen -z-20 opacity-15"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.1)",
        }}
      ></div>

      {/* Dark overlay over blurred logo */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10 bg-linear-to-b from-[#071427] to-[#0b1220]"></div>

      <Box className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <Box className="text-center mb-12">
          <img src={logo} alt="Vulnerax" className="h-12 mx-auto mb-6" />
          <Typography variant="h3" className="font-bold text-white mb-2">
            Select Your Industry Sector
          </Typography>
          <Typography
            variant="body1"
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Choose a sector to view sector-specific vulnerabilities, domains,
            and security insights
          </Typography>
        </Box>

        {/* Sector Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 4,
            width: "100%",
          }}
        >
          {sectors.map((sector) => (
            <Card
              key={sector.id}
              onClick={() => !isLoading && handleSectorSelect(sector.id)}
              sx={{
                cursor: isLoading ? "not-allowed" : "pointer",
                background: "rgba(15, 23, 42, 0.8)",
                border: `2px solid rgba(${
                  sector.id === "finance"
                    ? "14, 165, 164"
                    : sector.id === "healthcare"
                    ? "239, 68, 68"
                    : sector.id === "technology"
                    ? "139, 92, 246"
                    : sector.id === "retail"
                    ? "245, 158, 11"
                    : sector.id === "manufacturing"
                    ? "107, 114, 139"
                    : "234, 179, 8"
                }, 0.2)`,
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.6 : 1,
                "&:hover": isLoading
                  ? {}
                  : {
                      border: `2px solid ${sector.color}`,
                      background: `rgba(${
                        sector.id === "finance"
                          ? "14, 165, 164"
                          : sector.id === "healthcare"
                          ? "239, 68, 68"
                          : sector.id === "technology"
                          ? "139, 92, 246"
                          : sector.id === "retail"
                          ? "245, 158, 11"
                          : sector.id === "manufacturing"
                          ? "107, 114, 139"
                          : "234, 179, 8"
                      }, 0.1)`,
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 24px rgba(${
                        sector.id === "finance"
                          ? "14, 165, 164"
                          : sector.id === "healthcare"
                          ? "239, 68, 68"
                          : sector.id === "technology"
                          ? "139, 92, 246"
                          : sector.id === "retail"
                          ? "245, 158, 11"
                          : sector.id === "manufacturing"
                          ? "107, 114, 139"
                          : "234, 179, 8"
                      }, 0.25)`,
                    },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 64,
                    mb: 3,
                    color: sector.color,
                  }}
                >
                  {sector.icon}
                </Typography>
                <Typography variant="h5" className="font-bold text-white mb-2">
                  {sector.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.5,
                  }}
                >
                  {sector.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Logout hint */}
        <Box className="text-center mt-12">
          <Typography className="text-slate-500 text-sm">
            Want to switch accounts?{" "}
            <button
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userRole");
                localStorage.removeItem("selectedSector");
                window.dispatchEvent(new Event("logoutSuccess"));
              }}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Logout
            </button>
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
