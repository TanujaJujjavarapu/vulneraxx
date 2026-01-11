/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { importCompanies } from "../components/store/slices/companiesSlice";
import { importVulnerabilities } from "../components/store/slices/vulnerabilitiesSlice";
import { createScan } from "../components/store/slices/scansSlice";
// base44 client removed; using local simulation for file import
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Security,
  TrendingUp,
  Warning,
  Language,
  Speed,
  Description,
  CloudUpload,
  Search,
  CheckCircle,
  Timer,
  BarChart,
  Timeline,
  Error,
  OpenInNew,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, parseUnifiedCsvData } from "../utils";
import RecentScansTable from "../components/dashboard/RecentScansTable";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { items: companies } = useSelector((state: any) => state.companies);
  const { items: vulnerabilities } = useSelector(
    (state: any) => state.vulnerabilities
  );
  const { items: scans } = useSelector((state: any) => state.scans);

  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const isAdmin = userRole === "admin";

  // Get selected sector from localStorage
  const selectedSector = localStorage.getItem("selectedSector");

  const [selectedView, setSelectedView] = useState("overview");
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSingleCompanyUploadDialog, setShowSingleCompanyUploadDialog] =
    useState(false);
  const [singleCompanyUploadFile, setSingleCompanyUploadFile] = useState<
    any | null
  >(null);
  const [isSingleCompanyUploading, setIsSingleCompanyUploading] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    /*dispatch(fetchCompanies);
    dispatch(fetchVulnerabilities());
    dispatch(fetchScans());*/
  }, [dispatch]);

  const handleScan = async () => {
    if (companies.length === 0) {
      alert("Please add a company first");
      return;
    }
    try {
      for (const company of companies) {
        await dispatch(
          createScan({
            company_id: company.id,
            scan_date: new Date().toISOString(),
            status: "running",
            duration: 0,
          }) as any
        );
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  const escapeCsv = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const handleGenerateReport = () => {
    // Build an overview CSV: summary + vulnerabilities table
    const now = new Date();
    const header = [
      ["Report Type", "Total Overview"],
      ["Generated At", now.toISOString()],
      ["Total Vulnerabilities", String(totalVulns)],
      ["Critical/High", String(criticalVulns)],
      ["Resolved", String(resolvedCount || 0)],
      ["SLA Compliance (%)", String(slaCompliance)],
      ["MTTD (hours)", String(mttd)],
      ["MTTR (hours)", String(mttr)],
      ["Avg Risk Score", String(avgRiskScore)],
    ];

    const rows: string[] = [];
    for (const r of header) {
      rows.push(`${escapeCsv(r[0])},${escapeCsv(r[1])}`);
    }
    rows.push("");
    rows.push(
      [
        "Vuln ID",
        "Title",
        "Severity",
        "Status",
        "Category",
        "Company ID",
        "Company Name",
        "TimeToDetectHours",
        "TimeToResolveHours",
      ]
        .map(escapeCsv)
        .join(",")
    );

    for (const v of vulnerabilities) {
      const company = companies.find(
        (d: any) => d.id === (v.company_id || v.company)
      );
      const line = [
        v.id || "",
        v.title || "",
        v.severity || "",
        v.status || "",
        v.category || "",
        v.company_id || v.company || "",
        company ? company.name : "",
        typeof v.time_to_detect_hours === "number"
          ? v.time_to_detect_hours
          : "",
        typeof v.time_to_resolve_hours === "number"
          ? v.time_to_resolve_hours
          : "",
      ]
        .map(escapeCsv)
        .join(",");
      rows.push(line);
    }

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    {
      /* Top 10 Vulnerable Companies */
    }
    <Card
      sx={{
        mt: 4,
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
        border: "1px solid rgba(51, 65, 85, 0.5)",
      }}
    >
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center gap-3">
            <Security />
            <Typography variant="h6" className="text-white font-bold">
              Top 10 Vulnerable Companies
            </Typography>
          </Box>
          <Box className="flex items-center gap-4">
            <Typography variant="caption" className="text-slate-400">
              {topVulnerableCompanies.length} items
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowSingleCompanyUploadDialog(true)}
              sx={{
                bgcolor: "#0891b2",
                "&:hover": { bgcolor: "#0e7490" },
                fontSize: "0.875rem",
                padding: "6px 12px",
              }}
            >
              <CloudUpload className="mr-2" style={{ fontSize: "18px" }} />
              Import CSV
            </Button>
          </Box>
        </Box>

        <Box>
          {topVulnerableCompanies.map((d: any, idx: number) => (
            <Box
              key={d.id}
              className="p-3 mb-2 rounded-lg flex items-center justify-between"
              sx={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.02)",
              }}
            >
              <Box className="flex items-center gap-4">
                <Box className="text-slate-400 font-bold w-8">#{idx + 1}</Box>
                <Box>
                  <Typography className="text-white font-semibold">
                    {d.name}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-center gap-6">
                <Box>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor:
                        d.risk_score >= 8
                          ? "#fca5a5"
                          : d.risk_score >= 6
                          ? "#fdba74"
                          : "#bbf7d0",
                      textAlign: "center",
                      minWidth: 48,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {(d.risk_score || 0).toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <Box className="text-right">
                  <Typography className="text-slate-400 text-xs">
                    SLA Compliance
                  </Typography>
                  <Typography className="text-white font-bold">
                    {d.sla}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overview-report-${now
      .toISOString()
      .replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Helper function to parse CSV line properly (handles quoted fields)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const fileType = uploadFile.type || uploadFile.name.split(".").pop();

      if (fileType === "csv" || uploadFile.name.endsWith(".csv")) {
        // Parse unified CSV file with both company and vulnerability data
        const text = await uploadFile.text();
        const {
          companies: importedCompanies,
          vulnerabilities: importedVulnerabilities,
        } = parseUnifiedCsvData(text);

        if (importedCompanies.length === 0) {
          alert("No valid companies found in CSV");
          setIsUploading(false);
          return;
        }

        // Dispatch actions to import both companies and vulnerabilities
        dispatch(importCompanies(importedCompanies));

        if (importedVulnerabilities.length > 0) {
          dispatch(importVulnerabilities(importedVulnerabilities));
        }

        setShowUploadDialog(false);
        setUploadFile(null);
        alert(
          `Successfully imported ${importedCompanies.length} company(s) and ${importedVulnerabilities.length} vulnerability(ies) from CSV`
        );
      } else {
        alert(
          "Only CSV files are currently supported. Please upload a .csv file"
        );
      }
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      let errorMsg = "Unknown error";
      if (error instanceof Error) {
        errorMsg = (error as Error).message;
      } else if (typeof error === "string") {
        errorMsg = error;
      } else if (error) {
        errorMsg = String(error);
      }
      alert("Failed to upload file: " + errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSingleCompanyFileUpload = async () => {
    if (!singleCompanyUploadFile) return;

    setIsSingleCompanyUploading(true);
    try {
      const fileType =
        singleCompanyUploadFile.type ||
        singleCompanyUploadFile.name.split(".").pop();

      if (fileType === "csv" || singleCompanyUploadFile.name.endsWith(".csv")) {
        // Parse CSV file for single company - User role detailed format
        const text = await singleCompanyUploadFile.text();
        const lines = text.split("\n").filter((line: string) => line.trim());

        if (lines.length < 2) {
          alert("CSV file must contain headers and at least one data row");
          setIsSingleCompanyUploading(false);
          return;
        }

        // Parse header - case insensitive and more flexible
        const headers = parseCSVLine(lines[0]).map((h: string) =>
          h.toLowerCase().trim()
        );

        // Helper function to find column index with flexible matching
        const findColumnIndex = (headers: string[], ...names: string[]) => {
          for (const name of names) {
            const idx = headers.indexOf(name.toLowerCase().trim());
            if (idx !== -1) return idx;
          }
          return -1;
        };

        // Find all column indices (user role detailed format) with flexible matching
        const riskIdIdx = findColumnIndex(
          headers,
          "risk id",
          "risk_id",
          "risk id",
          "id"
        );
        const titleIdx = findColumnIndex(headers, "title", "name");
        const severityIdx = findColumnIndex(headers, "severity", "level");
        const cvssScoreIdx = findColumnIndex(
          headers,
          "cvss score",
          "cvss_score",
          "cvss"
        );
        const statusIdx = findColumnIndex(headers, "status", "state");
        const sensitivityIdx = findColumnIndex(headers, "sensitivity");
        const exploitabilityIdx = findColumnIndex(headers, "exploitability");
        const urlIdx = findColumnIndex(headers, "url");
        const evidenceTypeIdx = findColumnIndex(
          headers,
          "evidence type",
          "evidence_type",
          "evidence"
        );
        const descriptionIdx = findColumnIndex(headers, "description", "desc");
        const impactDescriptionIdx = findColumnIndex(
          headers,
          "impact description",
          "impact_description",
          "impact"
        );
        const recommendationIdx = findColumnIndex(
          headers,
          "recommendation",
          "recommend"
        );

        if (titleIdx === -1 || severityIdx === -1) {
          alert("CSV must contain 'Title' and 'Severity' columns");
          setIsSingleCompanyUploading(false);
          return;
        }

        // Parse data rows as vulnerabilities
        const importedVulnerabilities = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length > titleIdx && values[titleIdx]) {
            const cvssValue =
              cvssScoreIdx !== -1 ? parseFloat(values[cvssScoreIdx]) : 0;
            const severityValue =
              severityIdx !== -1 ? values[severityIdx].toLowerCase() : "medium";

            importedVulnerabilities.push({
              id:
                riskIdIdx !== -1 && values[riskIdIdx]
                  ? values[riskIdIdx]
                  : `vuln_${selectedCompany?.id || "imported"}_${i}`,
              risk_id: riskIdIdx !== -1 ? values[riskIdIdx] : undefined,
              title: values[titleIdx],
              category: "vulnerability",
              severity: (severityValue === "critical" ||
              severityValue === "high" ||
              severityValue === "medium" ||
              severityValue === "low"
                ? severityValue
                : "medium") as any,
              status: (statusIdx !== -1
                ? values[statusIdx].toLowerCase()
                : "open") as any,
              cvss: cvssValue,
              cvss_score: cvssValue,
              date_found: new Date().toISOString(),
              sla_due: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              company_id: selectedCompany?.id || "",
              company_name: selectedCompany?.name || values[titleIdx],
              risk_score: cvssValue,
              time_to_detect_hours: 24,
              time_to_resolve_hours: 72,
              // User role detailed fields
              sensitivity:
                sensitivityIdx !== -1 ? values[sensitivityIdx] : undefined,
              exploitability:
                exploitabilityIdx !== -1
                  ? values[exploitabilityIdx]
                  : undefined,
              url: urlIdx !== -1 ? values[urlIdx] : undefined,
              evidence_type:
                evidenceTypeIdx !== -1 ? values[evidenceTypeIdx] : undefined,
              description:
                descriptionIdx !== -1 ? values[descriptionIdx] : undefined,
              impact_description:
                impactDescriptionIdx !== -1
                  ? values[impactDescriptionIdx]
                  : undefined,
              recommendation:
                recommendationIdx !== -1
                  ? values[recommendationIdx]
                  : undefined,
            });
          }
        }

        if (importedVulnerabilities.length === 0) {
          alert("No valid vulnerabilities found in CSV");
          setIsSingleCompanyUploading(false);
          return;
        }

        // Dispatch action to import vulnerabilities to Redux store
        dispatch(importVulnerabilities(importedVulnerabilities));

        // Reset state after successful import
        setTimeout(() => {
          setShowSingleCompanyUploadDialog(false);
          setSingleCompanyUploadFile(null);
        }, 100);

        alert(
          `Successfully imported ${
            importedVulnerabilities.length
          } vulnerability(ies)${
            selectedCompany ? ` for ${selectedCompany.name}` : ""
          }`
        );
      } else {
        alert(
          "Only CSV files are currently supported. Please upload a .csv file"
        );
      }
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      let errorMsg = "Unknown error";
      if (error instanceof Error) {
        errorMsg = (error as Error).message;
      } else if (typeof error === "string") {
        errorMsg = error;
      } else if (error) {
        errorMsg = String(error);
      }
      alert("Failed to upload file: " + errorMsg);
    } finally {
      setIsSingleCompanyUploading(false);
    }
  };

  const activeScans =
    scans.filter((s: any) => s.status === "running").length || 12;
  const totalVulns = vulnerabilities.length || 284;
  const criticalVulns =
    vulnerabilities.filter(
      (v: any) => v.severity === "critical" && v.status === "open"
    ).length || 23;

  const avgRiskScore =
    companies.length > 0
      ? (
          companies.reduce(
            (sum: number, d: any) => sum + (d.risk_score || 0),
            0
          ) / companies.length
        ).toFixed(1)
      : "7.8";

  // Top vulnerable companies: compute counts, criticals and SLA per company
  const topVulnerableCompanies = [...companies]
    .map((d: any) => {
      const companyVulns = vulnerabilities.filter(
        (v: any) => v.company_id === d.id || v.company === d.id
      );
      const total = companyVulns.length;
      const critical = companyVulns.filter(
        (v: any) => (v.severity || "").toLowerCase() === "critical"
      ).length;
      const resolved = companyVulns.filter((v: any) =>
        ["resolved", "closed", "fixed"].includes((v.status || "").toLowerCase())
      ).length;
      const sla = total > 0 ? Math.round((resolved / total) * 100) : 100;
      return {
        id: d.id,
        name: d.name || d.id,
        url: d.url,
        total,
        critical,
        sla,
        risk_score:
          typeof d.risk_score === "number"
            ? d.risk_score
            : d.risk_score
            ? Number(d.risk_score)
            : 0,
      };
    })
    .sort((a: any, b: any) => b.risk_score - a.risk_score)
    .slice(0, 10);

  const getRiskGradient = (score: number) => {
    if (score >= 8)
      return "linear-gradient(to right, #ef4444, #f97316, #ef4444)";
    if (score >= 6)
      return "linear-gradient(to right, #f97316, #fbbf24, #f97316)";
    if (score >= 4)
      return "linear-gradient(to right, #fbbf24, #facc15, #fbbf24)";
    return "linear-gradient(to right, #10b981, #22c55e, #10b981)";
  };

  // --- Derived metrics for SLA / MTTD / MTTR / Risk Trend ---
  const resolvedCount = vulnerabilities.filter((v: any) =>
    ["resolved", "closed", "fixed"].includes((v.status || "").toLowerCase())
  ).length;

  const slaCompliance =
    totalVulns > 0 ? Math.round((resolvedCount / totalVulns) * 100) : 100;

  const computeHalfDelta = (arr: any[], predicate: (x: any) => boolean) => {
    if (!arr || arr.length < 2) return 0;
    const half = Math.floor(arr.length / 2);
    const prev = arr.slice(0, half);
    const recent = arr.slice(half);
    const prevRate = prev.length
      ? prev.filter(predicate).length / prev.length
      : 0;
    const recentRate = recent.length
      ? recent.filter(predicate).length / recent.length
      : 0;
    return Math.round((recentRate - prevRate) * 1000) / 10; // one decimal
  };

  const slaDelta = computeHalfDelta(vulnerabilities, (v: any) =>
    ["resolved", "closed", "fixed"].includes((v.status || "").toLowerCase())
  );

  const mttdHoursArr = vulnerabilities
    .map((v: any) => v.time_to_detect_hours)
    .filter((n: any) => typeof n === "number" && !isNaN(n));
  const mttd = mttdHoursArr.length
    ? Math.round(
        (mttdHoursArr.reduce((s: number, n: number) => s + n, 0) /
          mttdHoursArr.length) *
          10
      ) / 10
    : 2.4;
  const mttdDelta = computeHalfDelta(
    vulnerabilities,
    (v: any) =>
      (typeof v.time_to_detect_hours === "number"
        ? v.time_to_detect_hours
        : mttd) > mttd
  );

  const mttrHoursArr = vulnerabilities
    .map((v: any) => v.time_to_resolve_hours)
    .filter((n: any) => typeof n === "number" && !isNaN(n));
  const mttr = mttrHoursArr.length
    ? Math.round(
        (mttrHoursArr.reduce((s: number, n: number) => s + n, 0) /
          mttrHoursArr.length) *
          10
      ) / 10
    : 18.7;
  const mttrDelta = computeHalfDelta(
    vulnerabilities,
    (v: any) =>
      (typeof v.time_to_resolve_hours === "number"
        ? v.time_to_resolve_hours
        : mttr) > mttr
  );

  const SEVERITY_WEIGHT: Record<string, number> = {
    critical: 5,
    high: 4,
    medium: 2,
    low: 1,
  };
  const severityAvg = (arr: any[]) => {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce(
      (s: number, v: any) =>
        s + (SEVERITY_WEIGHT[(v.severity || "").toLowerCase()] || 0),
      0
    );
    return sum / arr.length;
  };
  const riskDelta = (() => {
    if (vulnerabilities.length < 2) return 0;
    const half = Math.floor(vulnerabilities.length / 2);
    const prev = vulnerabilities.slice(0, half);
    const recent = vulnerabilities.slice(half);
    return Math.round((severityAvg(recent) - severityAvg(prev)) * 10) / 10;
  })();
  const riskTrendLabel =
    riskDelta > 0.05 ? "Rising" : riskDelta < -0.05 ? "Falling" : "Stable";

  const CompanyCard = ({ company }: { company: any }) => {
    return (
      <Card
        onClick={() => setSelectedCompany(company)}
        className="cursor-pointer transition-all hover:scale-105"
        sx={{
          background:
            selectedCompany?.id === company.id
              ? "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))"
              : "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
          border:
            selectedCompany?.id === company.id
              ? "1px solid rgba(6, 182, 212, 0.3)"
              : "1px solid rgba(51, 65, 85, 0.5)",
          boxShadow:
            selectedCompany?.id === company.id
              ? "0 10px 40px rgba(6, 182, 212, 0.1)"
              : "none",
        }}
      >
        <CardContent className="p-5">
          <Box className="flex items-start justify-between mb-4">
            <Box className="flex items-center gap-3">
              <Box className="p-2.5 rounded-xl bg-cyan-500/20">
                <Language className="w-5 h-5 text-cyan-400" />
              </Box>
              <Box>
                <Typography className="font-semibold text-white text-base mb-1">
                  {company.name}
                </Typography>
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {company.url}
                  <OpenInNew sx={{ fontSize: "0.75rem" }} />
                </a>
              </Box>
            </Box>
            <Chip
              label={company.environment}
              size="small"
              sx={{
                bgcolor:
                  company.environment === "production"
                    ? "rgba(59, 130, 246, 0.1)"
                    : company.environment === "staging"
                    ? "rgba(168, 85, 247, 0.1)"
                    : "rgba(100, 116, 139, 0.1)",
                color:
                  company.environment === "production"
                    ? "#93c5fd"
                    : company.environment === "staging"
                    ? "#c4b5fd"
                    : "#cbd5e1",
                border: `1px solid ${
                  company.environment === "production"
                    ? "rgba(59, 130, 246, 0.2)"
                    : company.environment === "staging"
                    ? "rgba(168, 85, 247, 0.2)"
                    : "rgba(100, 116, 139, 0.2)"
                }`,
              }}
            />
          </Box>

          <Box className="mb-4">
            <Box className="flex items-end justify-between mb-2">
              <Typography
                variant="caption"
                className="text-slate-500 font-medium uppercase tracking-wider"
              >
                Risk Score
              </Typography>
              <Typography
                variant="h4"
                className="font-bold"
                sx={{
                  background: getRiskGradient(company.risk_score || 0),
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {(company.risk_score || 0).toFixed(1)}
              </Typography>
            </Box>
            <Box className="h-2 rounded-full bg-slate-800/50 overflow-hidden">
              <Box
                className="h-full rounded-full transition-all duration-500"
                sx={{
                  width: `${(company.risk_score || 0) * 10}%`,
                  background: getRiskGradient(company.risk_score || 0),
                }}
              ></Box>
            </Box>
          </Box>

          <Box className="mt-4 pt-4 border-t border-slate-700/50">
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowSingleCompanyUploadDialog(true);
              }}
              sx={{
                borderColor: "rgba(34, 211, 238, 0.3)",
                color: "#22d3ee",
                "&:hover": {
                  borderColor: "rgba(34, 211, 238, 0.6)",
                  bgcolor: "rgba(34, 211, 238, 0.05)",
                },
              }}
            >
              <CloudUpload sx={{ fontSize: "0.875rem", mr: 0.5 }} />
              Import Data
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="min-h-screen p-6 lg:p-8 space-y-8 bg-[#0a0a0f]">
      {/* Hero Header */}
      <Box className="relative">
        <Box className="flex items-center justify-between gap-3 mb-3">
          <Box className="flex items-center gap-3">
            <Box className="p-2 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20">
              <Security className="w-6 h-6 text-cyan-400" />
            </Box>
            <Box>
              <Typography variant="h3" className="font-bold text-white">
                Security Dashboard{" "}
                {selectedSector && `- ${selectedSector.toUpperCase()}`}
              </Typography>
              <Typography className="text-slate-400 mt-1">
                Real-time vulnerability intelligence across your infrastructure
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem("selectedSector");
              navigate("/sector-selection");
            }}
            sx={{
              color: "#94a3b8",
              borderColor: "#475569",
              "&:hover": {
                borderColor: "#64748b",
                backgroundColor: "rgba(71, 85, 105, 0.1)",
              },
            }}
          >
            ← Back to Sectors
          </Button>
        </Box>
      </Box>

      {/* Critical Alert */}
      {criticalVulns > 0 && (
        <Card
          sx={{
            background:
              "linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1), rgba(239, 68, 68, 0.1))",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <CardContent className="p-4">
            <Box className="flex items-center gap-4">
              <Box className="p-2 rounded-lg bg-red-500/20">
                <Warning className="w-5 h-5 text-red-400 animate-pulse" />
              </Box>
              <Box className="flex-1">
                <Typography
                  variant="subtitle2"
                  className="font-semibold text-red-400"
                >
                  Critical Security Alert
                </Typography>
                <Typography
                  variant="caption"
                  className="text-slate-400 mt-0.5 block"
                >
                  {criticalVulns} critical vulnerabilities require immediate
                  attention
                </Typography>
              </Box>
              <Link
                to={
                  createPageUrl("VulnerabilityExplorer") + "?severity=critical"
                }
              >
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                  }}
                >
                  View Details
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Scan Actions */}
      <Card
        sx={{
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        }}
      >
        <CardContent className="pt-6">
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Monitored Companies",
                value: companies.length || 48,
                icon: Language,
                color: "cyan",
              },
              {
                label: "Active Scans",
                value: activeScans,
                icon: Speed,
                color: "blue",
              },
              {
                label: "Total Threats",
                value: totalVulns,
                icon: Warning,
                color: "amber",
              },
              {
                label: "Avg Risk Score",
                value: avgRiskScore,
                icon: TrendingUp,
                color: "red",
              },
            ].map((metric) => {
              const Icon = metric.icon;
              const colorMap: any = {
                cyan: { bg: "rgba(6, 182, 212, 0.2)", text: "#22d3ee" },
                blue: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
                amber: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
                red: { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
              };
              return (
                <Box
                  key={metric.label}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50"
                >
                  <Box className="flex items-center gap-3">
                    <Box
                      className="p-2 rounded-lg"
                      sx={{ bgcolor: colorMap[metric.color].bg }}
                    >
                      <Icon
                        sx={{
                          fontSize: "1rem",
                          color: colorMap[metric.color].text,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" className="text-slate-400">
                      {metric.label}
                    </Typography>
                  </Box>
                  <Typography variant="h6" className="font-bold text-white">
                    {metric.value}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "SLA Compliance",
                type: "sla_compliance",
                color: "darkGreen",
              },
              { label: "MTTD", type: "mttd", color: "amber" },
              { label: "MTTR", type: "mttr", color: "orange" },
              { label: "Risk Trend", type: "risk_trend", color: "pink" },
            ].map((scan) => {
              const scanColorMap: any = {
                darkGreen: { rgb: "20, 83, 45", text: "#22c55e" },
                emerald: { rgb: "16, 185, 129", text: "#6ee7b7" },
                amber: { rgb: "245, 158, 11", text: "#fbbf24" },
                orange: { rgb: "249, 115, 22", text: "#fdba74" },
                pink: { rgb: "236, 72, 153", text: "#f9a8d4" },
              };
              const colors = scanColorMap[scan.color];

              // determine display values per card
              let mainValue: React.ReactNode = "—";
              let caption = "";
              let delta: number | null = null;
              let deltaPositive = true;

              if (scan.type === "sla_compliance") {
                mainValue = `${slaCompliance}%`;
                caption = "SLA Compliance";
                delta = slaDelta;
                deltaPositive = (delta || 0) >= 0;
              } else if (scan.type === "mttd") {
                mainValue = `${mttd}h`;
                caption = "MTTD";
                delta = mttdDelta;
                deltaPositive = (delta || 0) <= 0 ? false : true;
              } else if (scan.type === "mttr") {
                mainValue = `${mttr}h`;
                caption = "MTTR";
                delta = mttrDelta;
                deltaPositive = (delta || 0) <= 0 ? false : true;
              } else if (scan.type === "risk_trend") {
                mainValue = (
                  <Box className="flex items-center gap-2">
                    <TrendingUp sx={{ color: colors.text }} />
                    <Typography sx={{ fontWeight: 800, color: "#ef4444" }}>
                      {riskTrendLabel}
                    </Typography>
                  </Box>
                );
                caption = "Overall trajectory";
                delta = Math.round(riskDelta * 10) / 10;
                deltaPositive = (delta || 0) > 0;
              }

              return (
                <Card
                  key={scan.type}
                  className="cursor-pointer hover:scale-105 transition-all"
                  sx={{
                    background: `linear-gradient(135deg, rgba(${colors.rgb}, 0.12), rgba(${colors.rgb}, 0.04))`,
                    border: `1px solid rgba(${colors.rgb}, 0.14)`,
                    borderRadius: 2,
                  }}
                  onClick={() => handleScan()}
                >
                  <CardContent className="p-4">
                    <Box className="flex items-start justify-between">
                      <Box>
                        <Typography sx={{ color: "#b91c1c00", fontSize: 13 }}>
                          {scan.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "#ffffff",
                          }}
                        >
                          {mainValue}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          {caption}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckCircle
                          sx={{ fontSize: "1.25rem", color: colors.text }}
                        />
                      </Box>
                    </Box>

                    <Box className="mt-3 flex items-center gap-2">
                      {delta !== null && (
                        <Box
                          sx={{
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 8,
                            bgcolor: deltaPositive
                              ? "rgba(16, 185, 129, 0.08)"
                              : "rgba(239,68,68,0.06)",
                            border: deltaPositive
                              ? "1px solid rgba(16,185,129,0.12)"
                              : "1px solid rgba(239,68,68,0.12)",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: deltaPositive ? "#10b981" : "#ef4444",
                              fontWeight: 700,
                            }}
                          >
                            {delta > 0 ? `+${delta}%` : `${delta}%`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box>
        <Tabs
          value={selectedView}
          onChange={(_, v) => setSelectedView(v)}
          sx={{
            mb: 4,
            "& .MuiTab-root": { color: "#94a3b8" },
            "& .Mui-selected": { color: "#22d3ee !important" },
          }}
        >
          <Tab
            label="Overview"
            value="overview"
            icon={<Security />}
            iconPosition="start"
          />
          {isAdmin && (
            <Tab
              label={`Companies (${companies.length})`}
              value="companies"
              icon={<Language />}
              iconPosition="start"
            />
          )}
          <Tab
            label={isAdmin ? "OWASP Top 10" : "Top Vulnerabilities"}
            value="owasp"
            icon={<Timeline />}
            iconPosition="start"
          />
        </Tabs>

        <AnimatePresence mode="wait">
          {selectedView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Box className="flex justify-end gap-3 mb-6">
                {!isAdmin && companies.length > 0 && (
                  <Box className="flex gap-2 items-center">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel sx={{ color: "#cbd5e1" }}>
                        Select Company
                      </InputLabel>
                      <Select
                        value={selectedCompany?.id || ""}
                        label="Select Company"
                        onChange={(e: any) => {
                          const company = companies.find(
                            (c: any) => c.id === e.target.value
                          );
                          setSelectedCompany(company);
                        }}
                        sx={{
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#475569",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#64748b",
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#cbd5e1",
                          },
                        }}
                      >
                        {companies.map((company: any) => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      disabled={!selectedCompany}
                      onClick={() => setShowSingleCompanyUploadDialog(true)}
                      sx={{
                        borderColor: "rgba(34, 211, 238, 0.3)",
                        color: "#22d3ee",
                        "&:hover": {
                          borderColor: "rgba(34, 211, 238, 0.6)",
                          bgcolor: "rgba(34, 211, 238, 0.05)",
                        },
                        "&:disabled": {
                          borderColor: "rgba(100, 116, 139, 0.3)",
                          color: "rgba(100, 116, 139, 0.5)",
                        },
                      }}
                    >
                      <CloudUpload sx={{ fontSize: "0.875rem", mr: 0.5 }} />
                      Import Data
                    </Button>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  onClick={handleGenerateReport}
                  sx={{ borderColor: "#475569", color: "white" }}
                >
                  <Description className="mr-2" />
                  Generate Report
                </Button>
              </Box>

              <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card
                  className="lg:col-span-2"
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      className="text-white flex items-center gap-2 mb-4"
                    >
                      <BarChart />
                      Risk Distribution by Severity
                    </Typography>
                    <Box className="space-y-4">
                      {[
                        {
                          label: "Critical",
                          count: vulnerabilities.filter(
                            (v: any) => v.severity === "critical"
                          ).length,
                          color: "red",
                          total: totalVulns,
                        },
                        {
                          label: "High",
                          count: vulnerabilities.filter(
                            (v: any) => v.severity === "high"
                          ).length,
                          color: "orange",
                          total: totalVulns,
                        },
                        {
                          label: "Medium",
                          count: vulnerabilities.filter(
                            (v: any) => v.severity === "medium"
                          ).length,
                          color: "darkyellow",
                          total: totalVulns,
                        },
                        {
                          label: "Low",
                          count: vulnerabilities.filter(
                            (v: any) => v.severity === "low"
                          ).length,
                          color: "blue",
                          total: totalVulns,
                        },
                      ].map((item) => (
                        <Box key={item.label}>
                          <Box className="flex items-center justify-between mb-2">
                            <Typography
                              variant="body2"
                              className="text-slate-300 font-medium"
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-white font-bold"
                            >
                              {item.count}
                            </Typography>
                          </Box>
                          <Box className="h-3 rounded-full bg-slate-800/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  item.total === 0
                                    ? 0
                                    : (item.count / item.total) * 100
                                }%`,
                              }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{
                                background:
                                  item.color === "red"
                                    ? "linear-gradient(to right, #ef4444, #dc2626)"
                                    : item.color === "orange"
                                    ? "linear-gradient(to right, #f97316, #ea580c)"
                                    : item.color === "amber"
                                    ? "linear-gradient(to right, #f59e0b, #d97706)"
                                    : item.color === "darkyellow"
                                    ? "linear-gradient(to right, #b8860b, #8b6914)"
                                    : "linear-gradient(to right, #3b82f6, #2563eb)",
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      className="text-white flex items-center gap-2 mb-4"
                    >
                      <Speed />
                      Quick Stats
                    </Typography>
                    <Box className="space-y-4">
                      {[
                        {
                          label: "Open Vulnerabilities",
                          value: vulnerabilities.filter(
                            (v: any) => v.status === "open"
                          ).length,
                          icon: Error,
                          color: "red",
                        },
                        {
                          label: "In Progress",
                          value: vulnerabilities.filter(
                            (v: any) => v.status === "in_progress"
                          ).length,
                          icon: Timer,
                          color: "blue",
                        },
                        {
                          label: "Resolved",
                          value: vulnerabilities.filter(
                            (v: any) => v.status === "resolved"
                          ).length,
                          icon: CheckCircle,
                          color: "emerald",
                        },
                        {
                          label: "Resolution Rate",
                          value:
                            totalVulns > 0
                              ? `${Math.round(
                                  (vulnerabilities.filter(
                                    (v: any) => v.status === "resolved"
                                  ).length /
                                    totalVulns) *
                                    100
                                )}%`
                              : "0%",
                          icon: BarChart,
                          color: "cyan",
                        },
                      ].map((stat) => {
                        const Icon = stat.icon;
                        const statColorMap: any = {
                          red: {
                            bg: "rgba(239, 68, 68, 0.2)",
                            text: "#f87171",
                          },
                          blue: {
                            bg: "rgba(59, 130, 246, 0.2)",
                            text: "#60a5fa",
                          },
                          emerald: {
                            bg: "rgba(16, 185, 129, 0.2)",
                            text: "#6ee7b7",
                          },
                          cyan: {
                            bg: "rgba(6, 182, 212, 0.2)",
                            text: "#22d3ee",
                          },
                        };
                        return (
                          <Box
                            key={stat.label}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50"
                          >
                            <Box className="flex items-center gap-3">
                              <Box
                                className="p-2 rounded-lg"
                                sx={{ bgcolor: statColorMap[stat.color].bg }}
                              >
                                <Icon
                                  sx={{
                                    fontSize: "1rem",
                                    color: statColorMap[stat.color].text,
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="caption"
                                className="text-slate-400"
                              >
                                {stat.label}
                              </Typography>
                            </Box>
                            <Typography
                              variant="h6"
                              className="font-bold text-white"
                            >
                              {stat.value}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <RecentScansTable
                scans={scans.slice(0, 5).map((s: any) => ({
                  ...s,
                  company_name:
                    companies.find((d: any) => d.id === s.company_id)?.name ||
                    "Unknown",
                }))}
                onRefresh={() => {
                  dispatch(
                    createScan({
                      company_id: companies[0]?.id || "c1",
                      status: "running",
                      scan_date: new Date().toISOString(),
                      duration: 0,
                    }) as any
                  );
                }}
              />
            </motion.div>
          )}

          {selectedView === "companies" && (
            <motion.div
              key="companies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                  border: "1px solid rgba(51, 65, 85, 0.5)",
                }}
              >
                <CardContent className="p-4">
                  <Box className="flex items-center gap-3">
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search for specific company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <Search className="mr-2 text-slate-400" />
                        ),
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          bgcolor: "#1e293b",
                          color: "white",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#475569",
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => setShowUploadDialog(true)}
                      sx={{
                        borderColor: "rgba(6, 182, 212, 0.3)",
                        color: "#22d3ee",
                        minWidth: "200px",
                      }}
                    >
                      <CloudUpload className="mr-2" />
                      Import from File
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {companies
                  .filter((company: any) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      company.name?.toLowerCase().includes(query) ||
                      company.url?.toLowerCase().includes(query)
                    );
                  })
                  .map((company: any, idx: number) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <CompanyCard company={company} />
                    </motion.div>
                  ))}
              </Box>

              {companies.length === 0 && (
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                  }}
                >
                  <CardContent className="py-16 text-center">
                    <Language className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <Typography variant="h6" className="text-white mb-2">
                      No companies configured
                    </Typography>
                    <Typography variant="body2" className="text-slate-400 mb-6">
                      Start monitoring by adding your first company
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {selectedView === "owasp" && (
            <motion.div
              key="owasp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* For Admin: Top 10 Vulnerable Companies */}
              {isAdmin && (
                <Card
                  sx={{
                    mt: 4,
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                  }}
                >
                  <CardContent>
                    <Box className="flex items-center justify-between mb-4">
                      <Box className="flex items-center gap-3">
                        <Security />
                        <Typography
                          variant="h6"
                          className="text-white font-bold"
                        >
                          Top 10 Vulnerable Companies
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          className="text-slate-400"
                        >
                          Ranked by vulnerability count
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      {topVulnerableCompanies.map((d: any, idx: number) => (
                        <Box
                          key={d.id}
                          className="p-3 mb-2 rounded-lg flex items-center justify-between"
                          sx={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.02)",
                          }}
                        >
                          <Box className="flex items-center gap-4">
                            <Box className="text-slate-400 font-bold w-8">
                              #{idx + 1}
                            </Box>
                            <Box>
                              <Typography className="text-white font-semibold">
                                {d.name}
                              </Typography>
                            </Box>
                          </Box>

                          <Box className="flex items-center gap-6">
                            <Box>
                              <Box
                                sx={{
                                  px: 1.25,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor:
                                    d.risk_score >= 8
                                      ? "#fca5a5"
                                      : d.risk_score >= 6
                                      ? "#fdba74"
                                      : "#bbf7d0",
                                  textAlign: "center",
                                  minWidth: 48,
                                }}
                              >
                                <Typography sx={{ fontWeight: 700 }}>
                                  {(d.risk_score || 0).toFixed(1)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box className="text-right">
                              <Typography className="text-slate-400 text-xs">
                                SLA Compliance
                              </Typography>
                              <Typography className="text-white font-bold">
                                {d.sla}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* For Users: OWASP Top 10 Vulnerabilities */}
              {!isAdmin && (
                <Box className="space-y-4">
                  {vulnerabilities.length === 0 ? (
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                        border: "1px solid rgba(51, 65, 85, 0.5)",
                      }}
                    >
                      <CardContent>
                        <Box className="py-12 text-center">
                          <Security
                            sx={{ fontSize: 48, color: "#64748b", mb: 2 }}
                          />
                          <Typography variant="h6" className="text-white mb-2">
                            No vulnerabilities found
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-slate-400 mb-6"
                          >
                            Import vulnerability data to see OWASP Top 10
                            results
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() =>
                              setShowSingleCompanyUploadDialog(true)
                            }
                            sx={{
                              bgcolor: "#0891b2",
                              "&:hover": { bgcolor: "#0e7490" },
                            }}
                          >
                            <CloudUpload className="mr-2" />
                            Import Vulnerability Data
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    (() => {
                      // Group vulnerabilities by category
                      const grouped: Record<string, any[]> = {};
                      vulnerabilities.forEach((v: any) => {
                        const cat = v.category || "Other";
                        if (!grouped[cat]) grouped[cat] = [];
                        grouped[cat].push(v);
                      });

                      // Sort each category by risk_score and limit to 10 per category
                      Object.keys(grouped).forEach((cat) => {
                        grouped[cat].sort(
                          (a: any, b: any) =>
                            (b.risk_score || 0) - (a.risk_score || 0)
                        );
                      });

                      // Get all categories sorted by max risk score
                      const sortedCategories = Object.keys(grouped).sort(
                        (a, b) =>
                          (grouped[b][0]?.risk_score || 0) -
                          (grouped[a][0]?.risk_score || 0)
                      );

                      return sortedCategories.map((category) => (
                        <Card
                          key={category}
                          sx={{
                            background:
                              "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))",
                            border: "1px solid rgba(51, 65, 85, 0.5)",
                          }}
                        >
                          <CardContent>
                            <Box className="flex items-center justify-between mb-4">
                              <Box className="flex items-center gap-3">
                                <Security />
                                <Typography
                                  variant="h6"
                                  className="text-white font-bold"
                                >
                                  {category}
                                </Typography>
                                <Chip
                                  label={`${grouped[category].length} found`}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(251, 191, 36, 0.1)",
                                    color: "#fbbf24",
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box>
                              {grouped[category]
                                .slice(0, 10)
                                .map((v: any, idx: number) => (
                                  <Box
                                    key={v.id}
                                    className="p-3 mb-2 rounded-lg flex items-center justify-between"
                                    sx={{
                                      background: "rgba(255,255,255,0.02)",
                                      border:
                                        "1px solid rgba(255,255,255,0.02)",
                                    }}
                                  >
                                    <Box className="flex items-center gap-4">
                                      <Box className="text-slate-400 font-bold w-8">
                                        #{idx + 1}
                                      </Box>
                                      <Box>
                                        <Typography className="text-white font-semibold">
                                          {v.title}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box className="flex items-center gap-6">
                                      <Box className="text-right">
                                        <Typography className="text-slate-400 text-xs">
                                          CVSS Score
                                        </Typography>
                                        <Typography className="text-white font-bold">
                                          {v.cvss_score}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Box
                                          sx={{
                                            px: 1.25,
                                            py: 0.5,
                                            borderRadius: 1,
                                            bgcolor:
                                              v.severity === "critical"
                                                ? "#fca5a5"
                                                : v.severity === "high"
                                                ? "#fdba74"
                                                : v.severity === "medium"
                                                ? "#fbbf24"
                                                : "#bbf7d0",
                                            textAlign: "center",
                                            minWidth: 48,
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              fontWeight: 700,
                                              fontSize: "0.75rem",
                                            }}
                                          >
                                            {v.severity}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Box className="text-right">
                                        <Typography className="text-slate-400 text-xs">
                                          Status
                                        </Typography>
                                        <Typography className="text-white font-bold">
                                          {v.status}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                ))}
                            </Box>
                          </CardContent>
                        </Card>
                      ));
                    })()
                  )}
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Upload Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#0f172a", border: "1px solid #334155" } }}
      >
        <DialogTitle className="text-white flex items-center gap-2">
          <CloudUpload />
          Import Companies from File
        </DialogTitle>
        <DialogContent>
          <Box className="py-4">
            <Typography variant="body2" className="text-slate-300 mb-2">
              Upload File (CSV, Excel, PDF)
            </Typography>
            <TextField
              fullWidth
              type="file"
              inputProps={{ accept: ".csv,.xlsx,.xls,.pdf" }}
              onChange={(e: any) => setUploadFile(e.target.files[0])}
              sx={{
                "& .MuiInputBase-root": { bgcolor: "#1e293b", color: "white" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#475569",
                },
              }}
            />
            <Typography variant="caption" className="text-slate-500 mt-2 block">
              File should contain: name, url, environment, and risk_score
              columns
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowUploadDialog(false);
              setUploadFile(null);
            }}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFileUpload}
            disabled={!uploadFile || isUploading}
            variant="contained"
            sx={{ bgcolor: "#0891b2", "&:hover": { bgcolor: "#0e7490" } }}
          >
            {isUploading ? "Importing..." : "Import Companies"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single Company Import Dialog */}
      <Dialog
        open={showSingleCompanyUploadDialog}
        onClose={() => setShowSingleCompanyUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#0f172a", border: "1px solid #334155" } }}
      >
        <DialogTitle className="text-white flex items-center gap-2">
          <CloudUpload />
          Import Vulnerability Data
        </DialogTitle>
        <DialogContent>
          <Box className="py-4 space-y-4">
            {isAdmin && (
              <Box>
                <Typography variant="body2" className="text-slate-300 mb-2">
                  Select Company (Optional)
                </Typography>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Company</InputLabel>
                  <Select
                    value={selectedCompany?.id || ""}
                    label="Company"
                    onChange={(e: any) => {
                      const company = companies.find(
                        (c: any) => c.id === e.target.value
                      );
                      setSelectedCompany(company || null);
                    }}
                    sx={{
                      color: "white",
                      bgcolor: "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#475569",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#64748b",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#94a3b8",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Typography className="text-slate-500">
                        None (Generic Import)
                      </Typography>
                    </MenuItem>
                    {companies.map((company: any) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box>
              <Typography variant="body2" className="text-slate-300 mb-2">
                Upload CSV File with Vulnerability Data
              </Typography>
              <TextField
                fullWidth
                type="file"
                inputProps={{ accept: ".csv" }}
                onChange={(e: any) =>
                  setSingleCompanyUploadFile(e.target.files[0])
                }
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: "#1e293b",
                    color: "white",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#475569",
                  },
                }}
              />
              <Typography
                variant="caption"
                className="text-slate-500 mt-2 block"
              >
                CSV should contain: Risk id, Title, Severity, Cvss Score,
                Status, Sensitivity, Exploitability, URL, Evidence type,
                Description, Impact Description, Recommendation
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSingleCompanyUploadDialog(false);
              setSingleCompanyUploadFile(null);
            }}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSingleCompanyFileUpload}
            disabled={!singleCompanyUploadFile || isSingleCompanyUploading}
            variant="contained"
            sx={{ bgcolor: "#0891b2", "&:hover": { bgcolor: "#0e7490" } }}
          >
            {isSingleCompanyUploading ? "Importing..." : "Import Data"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
