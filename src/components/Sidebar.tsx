import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";

import logo from "../assets/vulnerax.png";
import Dashboard from "@mui/icons-material/Dashboard";
import Assignment from "@mui/icons-material/Assignment";
// Language icon removed (no domain link in sidebar)

import Description from "@mui/icons-material/Description";
import Warning from "@mui/icons-material/Warning";
import Search from "@mui/icons-material/Search";
import { Avatar, Chip, Typography } from "@mui/material";
import type { SvgIconProps } from "@mui/material";

const allLinks = [
  { to: "/", label: "Overview", icon: Dashboard, roles: ["admin", "user"] },
  {
    to: "/vulnerabilities",
    label: "Vulnerabilities",
    icon: Search,
    roles: ["admin", "user"],
  },
  {
    to: "/assignment",
    label: "Assignment",
    icon: Assignment,
    roles: ["admin"],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: Description,
    roles: ["admin", "user"],
  },
  { to: "/threats", label: "Threats", icon: Warning, roles: ["admin", "user"] },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "user";
  const userEmail = localStorage.getItem("userEmail") || "User";

  // Filter links based on user role
  const links = allLinks.filter((link) => link.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    // Dispatch custom event to notify App component of logout
    window.dispatchEvent(new Event("logoutSuccess"));
    navigate("/login");
  };
  return (
    <aside
      className={`relative transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Collapsed pill-style sidebar */}
      {open ? (
        <div className="h-full flex flex-col bg-[#0a0a0f] px-3">
          {/* Logo + powered chip */}
          <div className="pt-4 pb-3 px-1 relative">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
                className="p-1 rounded-md text-slate-300 hover:bg-slate-800/40"
              >
                <ChevronLeft />
              </button>
            </div>
            <div className="flex flex-col items-center mb-3">
              <Avatar sx={{ bgcolor: "transparent", p: 0 }}>
                <img src={logo} alt="VulneraX" className="h-12 w-auto" />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  color: "#22d3ee",
                  fontWeight: 700,
                  mt: 1,
                  textAlign: "center",
                }}
              >
                VulneraX
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#94a3b8", display: "block", textAlign: "center" }}
              >
                SECURITY INTELLIGENCE PLATFORM
              </Typography>
            </div>
            <div className="flex justify-center">
              <Chip
                label="Powered by DataEQ Consulting"
                size="small"
                sx={{
                  bgcolor: "rgba(30,41,59,0.6)",
                  color: "#94a3b8",
                  border: "1px solid rgba(51,65,85,0.5)",
                }}
              />
            </div>
          </div>

          {/* System status */}
          <div className="mt-4 px-1">
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", display: "block", mb: 2 }}
            >
              SYSTEM STATUS
            </Typography>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/40 text-center">
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Scans
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#fff", fontWeight: 700 }}
                >
                  Active
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/40 text-center">
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Uptime
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#10b981", fontWeight: 700 }}
                >
                  99.9%
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/40 text-center">
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Latency
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#22d3ee", fontWeight: 700 }}
                >
                  12ms
                </Typography>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-1">
            {links.map((l) => {
              const Icon = l.icon as React.ComponentType<SvgIconProps>;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-md mb-1 relative ${
                      isActive
                        ? "bg-linear-to-r from-cyan-700/30 to-transparent text-cyan-200"
                        : "text-slate-300 hover:bg-slate-800/40"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon sx={{ color: "inherit" }} />
                      <span className="flex-1">{l.label}</span>
                      <span
                        className="w-2 h-2 rounded-full bg-cyan-400 ml-2"
                        style={{ opacity: isActive ? 1 : 0 }}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User card */}
          <div className="p-3">
            <div className="flex items-center gap-3 bg-linear-to-r from-slate-900/60 to-slate-800/50 p-3 rounded-xl">
              <Avatar sx={{ bgcolor: "#0f172a" }}>
                {userEmail.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex-1">
                <Typography variant="body2" sx={{ color: "white" }}>
                  {userEmail.split("@")[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: "#34d399" }}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Typography>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800/40"
                title="Logout"
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="rounded-full h-[80vh] w-12 bg-linear-to-b from-[#071427] to-[#0b1220] flex flex-col items-center py-6 shadow-md">
            <img src={logo} alt="VulneraX" className="h-12 w-auto mb-3" />
            <button
              onClick={() => setOpen(!open)}
              className="p-1 rounded-md text-slate-300 hover:bg-slate-800/40"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
