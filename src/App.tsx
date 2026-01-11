import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";

import AssignmentWorkflow from "./pages/AssignmentWorkflow";
import CompanyDetails from "./pages/DomainDetails";
import Reports from "./pages/Reports";
import ThreatClassification from "./pages/ThreatClassification";
import VulnerabilityExplorer from "./pages/VulnerabilityExplorer";
import SLACompliance from "./pages/SLACompliance";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import SectorSelector from "./pages/SectorSelector";
import { clearCompanies } from "./components/store/slices/companiesSlice";
import { clearScans } from "./components/store/slices/scansSlice";
import { clearVulnerabilities } from "./components/store/slices/vulnerabilitiesSlice";
import { clearUser } from "./components/store/slices/userSlice";
import { clearEmails } from "./components/store/slices/emailsSlice";

function App() {
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check login state on mount
  useEffect(() => {
    // For development: uncomment the line below to always start at login page
    localStorage.removeItem("isLoggedIn");

    // Check if user is logged in from localStorage
    const storedLoginState = localStorage.getItem("isLoggedIn");
    const loggedIn = storedLoginState === "true";

    // Clear data if NOT logged in
    if (!loggedIn) {
      dispatch(clearCompanies());
      dispatch(clearScans());
      dispatch(clearVulnerabilities());
      dispatch(clearUser());
      dispatch(clearEmails());
    }

    // Use a microtask to defer state updates and avoid cascading renders
    Promise.resolve().then(() => {
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
    });
  }, [dispatch]);

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      const storedLoginState = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(storedLoginState === "true");
    };

    const handleLogout = () => {
      dispatch(clearCompanies());
      dispatch(clearScans());
      dispatch(clearVulnerabilities());
      dispatch(clearUser());
      dispatch(clearEmails());
      setIsLoggedIn(false);
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Listen for login success event
    window.addEventListener("loginSuccess", handleStorageChange);

    // Listen for logout success event
    window.addEventListener("logoutSuccess", handleLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginSuccess", handleStorageChange);
      window.removeEventListener("logoutSuccess", handleLogout);
    };
  }, [dispatch]);

  if (isLoading) {
    return null;
  }

  // Show landing page if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#071427] to-[#0b1220] text-slate-200">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#071427] to-[#0b1220] text-slate-200">
      <Routes>
        {/* Sector Selection - No Sidebar */}
        <Route path="/sector-selection" element={<SectorSelector />} />

        {/* Main app with Sidebar */}
        <Route
          path="/*"
          element={
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/assignment" element={<AssignmentWorkflow />} />
                  <Route path="/company" element={<CompanyDetails />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/threats" element={<ThreatClassification />} />
                  <Route
                    path="/vulnerabilities"
                    element={<VulnerabilityExplorer />}
                  />
                  <Route path="/sla-compliance" element={<SLACompliance />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
