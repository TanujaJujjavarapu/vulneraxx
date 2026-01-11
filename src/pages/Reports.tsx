/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../components/store/store";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import {
  WarningAmber,
  Security,
  CheckCircle,
  AccessTime,
  TrendingUp,
  Description,
  BarChart,
} from "@mui/icons-material";

type StatCardProps = {
  title: string;
  value: number | string | React.ReactNode;
  icon: React.ReactElement;
  bg?: string;
  iconColor?: string;
};

interface Vulnerability {
  id?: string;
  severity?: string;
  status?: string;
  category?: string;
}

type SeverityBucket = { name: string; value: number };

const StatCard = ({ title, value, icon, bg, iconColor }: StatCardProps) => (
  <Card
    sx={{
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.04)",
    }}
  >
    <CardContent>
      <Box className="flex items-center justify-between">
        <Box>
          <Typography className="text-slate-400 text-sm">{title}</Typography>
          <Typography className="text-3xl font-bold mt-2 text-white">
            {value}
          </Typography>
        </Box>
        <Box className="p-3 rounded" sx={{ background: bg }}>
          {React.cloneElement(icon, { sx: { color: iconColor } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Reports() {
  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const isAdmin = userRole === "admin";

  const vulnerabilities = useSelector(
    (state: RootState) => state.vulnerabilities.items
  ) as Vulnerability[];

  const uploadedVulnerabilities = vulnerabilities;

  const totalVulns = uploadedVulnerabilities.length;
  const criticalHigh = uploadedVulnerabilities.filter((v: Vulnerability) =>
    ["critical", "high"].includes((v.severity || "").toLowerCase())
  ).length;
  const resolvedCount = uploadedVulnerabilities.filter((v: Vulnerability) =>
    ["resolved", "closed", "fixed"].includes((v.status || "").toLowerCase())
  ).length;
  const resolutionRate =
    totalVulns > 0 ? Math.round((resolvedCount / totalVulns) * 100) : 0;
  const stillOpen = totalVulns - resolvedCount;

  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleName, setScheduleName] = React.useState("");
  const [scheduleFrequency, setScheduleFrequency] = React.useState("weekly");
  const [scheduleTemplate, setScheduleTemplate] =
    React.useState("comprehensive");
  const [scheduleRecipients, setScheduleRecipients] = React.useState("");
  const [scheduledReports, setScheduledReports] = React.useState<
    Array<{
      id: string;
      name: string;
      template: string;
      frequency: string;
      recipients: string;
      lastRun: string;
      status: string;
    }>
  >([]);
  const [selectedTab, setSelectedTab] = React.useState<
    "overview" | "domain-reports" | "scheduled"
  >("overview");
  const [selectedDomain, setSelectedDomain] = React.useState<string>("");

  const severityBuckets = React.useMemo<SeverityBucket[]>(() => {
    const keys = ["critical", "high", "medium", "low"];
    return keys.map((k) => ({
      name: k,
      value: uploadedVulnerabilities.filter(
        (v: Vulnerability) => (v.severity || "").toLowerCase() === k
      ).length,
    }));
  }, [uploadedVulnerabilities]);

  const escapeCsv = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const handleExportReport = (reportName: string = "Vulnerability Report") => {
    const now = new Date();

    const rows: string[] = [];
    rows.push(
      [
        "Risk id",
        "Title",
        "Severity",
        "Cvss Score",
        "Status",
        "Sensitivity",
        "Exploitability",
        "Url",
        "Evidence type",
        "Description",
        "Impact Description",
        "Recommendation",
      ]
        .map(escapeCsv)
        .join(",")
    );

    for (const v of uploadedVulnerabilities) {
      const line = [
        (v as any).id || "",
        (v as any).title || "",
        (v as any).severity || "",
        (v as any).cvss_score || (v as any).cvss || "",
        (v as any).status || "",
        (v as any).sensitivity || "",
        (v as any).exploitability || "",
        (v as any).url || "",
        (v as any).evidence_type || "",
        (v as any).description || "",
        (v as any).impact_description || "",
        (v as any).recommendation || "",
      ]
        .map(escapeCsv)
        .join(",");
      rows.push(line);
    }

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `vulnerability-report-${now
      .toISOString()
      .replace(/[:.]/g, "-")}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const newReport = {
      id: `report-${Date.now()}`,
      name: reportName,
      frequency: "One-time",
      template: "comprehensive",
      recipients: "Downloaded",
      lastRun: now.toLocaleString(),
      status: "Completed",
    };
    setScheduledReports([...scheduledReports, newReport]);
  };

  const handleAddSchedule = () => {
    setScheduleOpen(true);
  };

  const handleCloseSchedule = () => {
    setScheduleOpen(false);
    setScheduleName("");
    setScheduleFrequency("weekly");
    setScheduleTemplate("comprehensive");
    setScheduleRecipients("");
  };

  const handleSaveSchedule = () => {
    if (!scheduleName.trim() || !scheduleRecipients.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newSchedule = {
      id: `schedule-${Date.now()}`,
      name: scheduleName,
      frequency: scheduleFrequency,
      template: scheduleTemplate,
      recipients: scheduleRecipients,
      lastRun: "Never",
      status: "Active",
    };

    setScheduledReports([...scheduledReports, newSchedule]);
    alert("Schedule created successfully!");
    handleCloseSchedule();
  };

  return (
    <Box className="space-y-6">
      <Box className="flex items-start justify-between">
        <Box>
          <Typography variant="h4" className="font-bold text-white">
            Reports & Export
          </Typography>
          <Typography className="text-slate-400">
            Generate security reports and export vulnerability data
          </Typography>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Vulnerabilities"
          value={totalVulns}
          icon={<WarningAmber />}
          bg={"linear-gradient(90deg,#0ea5a4,#0369a1)"}
          iconColor="#60a5fa"
        />
        <StatCard
          title="Critical/High"
          value={criticalHigh}
          icon={<Security />}
          bg={"linear-gradient(90deg,#ef4444,#b91c1c)"}
          iconColor="#ef4444"
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          icon={<CheckCircle />}
          bg={"linear-gradient(90deg,#10b981,#059669)"}
          iconColor="#10b981"
        />
        <StatCard
          title="Still Open"
          value={stillOpen}
          icon={<AccessTime />}
          bg={"linear-gradient(90deg,#f59e0b,#d97706)"}
          iconColor="#f59e0b"
        />
      </Box>

      {/* Tabs Navigation */}
      <Box className="flex items-center justify-between mb-4">
        <Tabs
          value={selectedTab}
          onChange={(_, v) => setSelectedTab(v)}
          sx={{
            flex: 1,
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
              label="Domain Reports"
              value="domain-reports"
              icon={<BarChart />}
              iconPosition="start"
            />
          )}
          <Tab
            label="Scheduled Reports"
            value="scheduled"
            icon={<Description />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <Box className="space-y-6">
          <Box className="flex justify-center">
            <Card
              sx={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.04)",
                width: "100%",
                maxWidth: "600px",
              }}
            >
              <CardContent>
                <Typography className="font-semibold mb-3 text-white text-center">
                  Severity Distribution (Jar)
                </Typography>
                <Box className="flex justify-center py-8">
                  <Box sx={{ position: "relative", width: 280, height: 420 }}>
                    {/* Jar lid */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -15,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 220,
                        height: 20,
                        background:
                          "linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)",
                        borderRadius: "8px 8px 4px 4px",
                        border: "2px solid #9ca3af",
                        boxShadow:
                          "0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
                      }}
                    />

                    {/* Jar screw cap */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 260,
                        height: 16,
                        background:
                          "linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)",
                        borderRadius: "50% 50% 0 0",
                        border: "2px solid #9ca3af",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        zIndex: 10,
                      }}
                    />

                    {/* Jar container */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 280,
                        height: 300,
                        background:
                          "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)",
                        border: "3px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px 12px 30px 30px",
                        overflow: "hidden",
                        boxShadow:
                          "0 0 40px rgba(255, 255, 255, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Empty space at top */}
                      {(() => {
                        const maxFillPercentage = 80;
                        const emptySpacePercentage = 100 - maxFillPercentage;
                        return (
                          <Box
                            sx={{
                              width: "100%",
                              height: `${emptySpacePercentage}%`,
                              background:
                                "linear-gradient(180deg, rgba(20, 20, 40, 0.8) 0%, rgba(20, 20, 40, 0.4) 100%)",
                            }}
                          />
                        );
                      })()}

                      {/* Jar contents - stacked severity levels */}
                      {(() => {
                        const total = severityBuckets.reduce(
                          (sum, item) => sum + item.value,
                          0
                        );
                        const maxFillPercentage = 80; // Fill 80% at bottom
                        const severities = [
                          {
                            name: "critical",
                            color: "#ef4444",
                            label: "Critical",
                          },
                          { name: "high", color: "#f97316", label: "High" },
                          { name: "medium", color: "#eab308", label: "Medium" },
                          { name: "low", color: "#3b82f6", label: "Low" },
                        ];

                        return severities.map((severity) => {
                          const count =
                            severityBuckets.find(
                              (s) => s.name === severity.name
                            )?.value || 0;
                          const percentage =
                            total > 0 ? (count / total) * maxFillPercentage : 0;
                          const height = (percentage / 100) * 320;

                          return (
                            <Box
                              key={severity.name}
                              sx={{
                                width: "100%",
                                height: `${percentage}%`,
                                background: `linear-gradient(180deg, ${severity.color} 0%, ${severity.color}dd 100%)`,
                                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                                position: "relative",
                                transition: "all 0.3s ease-in-out",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {height > 40 && (
                                <Typography
                                  sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                                  }}
                                >
                                  {count}
                                </Typography>
                              )}
                            </Box>
                          );
                        });
                      })()}
                    </Box>

                    {/* Jar shine/reflection */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 50,
                        height: 300,
                        background:
                          "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)",
                        borderRadius: "12px 0 0 30px",
                        pointerEvents: "none",
                      }}
                    />
                  </Box>
                </Box>

                {/* Legend with severity levels */}
                <Box className="mt-8 space-y-3">
                  {[
                    {
                      label: "Critical",
                      count:
                        severityBuckets.find((s) => s.name === "critical")
                          ?.value || 0,
                      color: "#ef4444",
                    },
                    {
                      label: "High",
                      count:
                        severityBuckets.find((s) => s.name === "high")?.value ||
                        0,
                      color: "#f97316",
                    },
                    {
                      label: "Medium",
                      count:
                        severityBuckets.find((s) => s.name === "medium")
                          ?.value || 0,
                      color: "#eab308",
                    },
                    {
                      label: "Low",
                      count:
                        severityBuckets.find((s) => s.name === "low")?.value ||
                        0,
                      color: "#3b82f6",
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      className="flex items-center justify-between px-4 py-2 bg-slate-800/30 rounded-lg"
                    >
                      <Box className="flex items-center gap-3">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "2px",
                            backgroundColor: item.color,
                          }}
                        />
                        <Typography className="text-slate-300">
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography className="text-white font-bold">
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box className="mt-8">
            <Typography className="font-semibold text-white mb-4 text-lg">
              Report Templates
            </Typography>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                sx={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    border: "1px solid rgba(52, 211, 153, 0.5)",
                    background: "rgba(52, 211, 153, 0.03)",
                  },
                }}
                onClick={() => handleExportReport("Executive Summary")}
              >
                <CardContent>
                  <Box className="flex items-start justify-between mb-4">
                    <TrendingUp
                      sx={{ fontSize: 40, color: "rgba(52, 211, 153, 0.7)" }}
                    />
                    <Box
                      sx={{
                        backgroundColor: "rgba(52, 211, 153, 0.15)",
                        color: "#34d399",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      executive
                    </Box>
                  </Box>
                  <Typography className="font-semibold text-white text-lg mb-2">
                    Executive Summary
                  </Typography>
                  <Typography className="text-slate-400 text-sm mb-4">
                    High-level security posture overview for leadership
                  </Typography>
                  <Box className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <Box className="flex items-center gap-2">
                      <Box className="text-slate-400 text-sm">📄 PDF</Box>
                    </Box>
                    <Box className="flex items-center gap-1 text-slate-400 text-sm">
                      <AccessTime sx={{ fontSize: 16 }} />
                      2-3 min
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    border: "1px solid rgba(34, 197, 94, 0.5)",
                    background: "rgba(34, 197, 94, 0.03)",
                  },
                }}
                onClick={() =>
                  handleExportReport("Technical Vulnerability Report")
                }
              >
                <CardContent>
                  <Box className="flex items-start justify-between mb-4">
                    <Security
                      sx={{ fontSize: 40, color: "rgba(34, 197, 94, 0.7)" }}
                    />
                    <Box
                      sx={{
                        backgroundColor: "rgba(34, 197, 94, 0.15)",
                        color: "#22c55e",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      technical
                    </Box>
                  </Box>
                  <Typography className="font-semibold text-white text-lg mb-2">
                    Technical Vulnerability Report
                  </Typography>
                  <Typography className="text-slate-400 text-sm mb-4">
                    Detailed technical findings for security teams
                  </Typography>
                  <Box className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <Box className="flex items-center gap-2">
                      <Box className="text-slate-400 text-sm">📄 PDF</Box>
                    </Box>
                    <Box className="flex items-center gap-1 text-slate-400 text-sm">
                      <AccessTime sx={{ fontSize: 16 }} />
                      5-7 min
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {/* Domain Reports Tab */}
      {isAdmin && selectedTab === "domain-reports" && (
        <Box className="space-y-6">
          <Card
            sx={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <CardContent>
              <Box className="flex items-center justify-between mb-6">
                <Box>
                  <Typography className="font-semibold text-white text-lg flex items-center gap-2">
                    <Security sx={{ fontSize: 24 }} />
                    Domain-wise Vulnerability Report
                  </Typography>
                  <Typography className="text-slate-400 text-sm mt-1">
                    Export vulnerability data organized by domain
                  </Typography>
                </Box>
              </Box>

              {/* Domain Selection Dropdown */}
              <Box className="mb-6">
                <FormControl fullWidth sx={{ maxWidth: "300px" }}>
                  <InputLabel
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&.Mui-focused": { color: "#ffffff" },
                    }}
                  >
                    Select Domain
                  </InputLabel>
                  <Select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    label="Select Domain"
                    sx={{
                      color: "#ffffff",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.4)",
                      },
                      "& .MuiSvgIcon-root": { color: "#ffffff" },
                    }}
                  >
                    <MenuItem value="">
                      <em>All Domains</em>
                    </MenuItem>
                    {(() => {
                      const domainGroups: { [key: string]: any[] } = {};
                      uploadedVulnerabilities.forEach((v: any) => {
                        const domain =
                          v.domain || v.company_name || "Unassigned";
                        if (!domainGroups[domain]) {
                          domainGroups[domain] = [];
                        }
                        domainGroups[domain].push(v);
                      });
                      return Object.keys(domainGroups).map((domain) => (
                        <MenuItem key={domain} value={domain}>
                          {domain}
                        </MenuItem>
                      ));
                    })()}
                  </Select>
                </FormControl>
              </Box>

              <Box className="overflow-auto">
                <Table sx={{ "& .MuiTableCell-root": { color: "#ffffff" } }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Domain
                      </TableCell>
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Total Vulnerabilities
                      </TableCell>
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Critical/High
                      </TableCell>
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Open
                      </TableCell>
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Resolved
                      </TableCell>
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Resolution %
                      </TableCell>
                      <TableCell
                        sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                      >
                        Download
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const domainGroups: { [key: string]: any[] } = {};
                      uploadedVulnerabilities.forEach((v: any) => {
                        const domain =
                          v.domain || v.company_name || "Unassigned";
                        if (!domainGroups[domain]) {
                          domainGroups[domain] = [];
                        }
                        domainGroups[domain].push(v);
                      });

                      // Filter domains based on selected domain
                      const filteredDomains = selectedDomain
                        ? Object.entries(domainGroups).filter(
                            ([domain]) => domain === selectedDomain
                          )
                        : Object.entries(domainGroups);

                      return filteredDomains.map(
                        ([domain, vulns]: [string, any[]]) => {
                          const total = vulns.length;
                          const criticalHigh = vulns.filter((v) =>
                            ["critical", "high"].includes(
                              (v.severity || "").toLowerCase()
                            )
                          ).length;
                          const open = vulns.filter(
                            (v) =>
                              v.status === "open" || v.status === "in_progress"
                          ).length;
                          const resolved = vulns.filter((v) =>
                            ["resolved", "fixed", "closed"].includes(
                              (v.status || "").toLowerCase()
                            )
                          ).length;
                          const resRate =
                            total > 0
                              ? Math.round((resolved / total) * 100)
                              : 0;

                          const handleDownloadDomainReport = () => {
                            const headers = [
                              "ID",
                              "Title",
                              "Category",
                              "Severity",
                              "Status",
                              "CVSS",
                              "Date Found",
                              "SLA Due",
                            ];
                            const rows = vulns.map((v: any) => [
                              v.id || "-",
                              v.title || "-",
                              v.category || "-",
                              v.severity || "-",
                              v.status || "-",
                              v.cvss || "-",
                              v.date_found
                                ? new Date(v.date_found).toLocaleDateString()
                                : "-",
                              v.sla_due
                                ? new Date(v.sla_due).toLocaleDateString()
                                : "-",
                            ]);

                            const csvContent =
                              "data:text/csv;charset=utf-8," +
                              [
                                headers.join(","),
                                ...rows.map((r: any[]) =>
                                  r
                                    .map((cell: any) => {
                                      const str = String(cell);
                                      return str.includes(",") ||
                                        str.includes('"') ||
                                        str.includes("\n")
                                        ? `"${str.replace(/"/g, '""')}"`
                                        : str;
                                    })
                                    .join(",")
                                ),
                              ].join("\n");

                            const link = document.createElement("a");
                            link.setAttribute("href", encodeURI(csvContent));
                            link.setAttribute(
                              "download",
                              `domain-report-${domain.replace(/\s+/g, "_")}-${
                                new Date().toISOString().split("T")[0]
                              }.csv`
                            );
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          };

                          return (
                            <TableRow
                              key={domain}
                              sx={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.05)",
                                "&:hover": {
                                  backgroundColor: "rgba(255,255,255,0.02)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{ fontWeight: 600, color: "#ffffff" }}
                              >
                                {domain}
                              </TableCell>
                              <TableCell sx={{ color: "#ffffff" }}>
                                {total}
                              </TableCell>
                              <TableCell sx={{ color: "#ef4444" }}>
                                {criticalHigh}
                              </TableCell>
                              <TableCell sx={{ color: "#f59e0b" }}>
                                {open}
                              </TableCell>
                              <TableCell sx={{ color: "#10b981" }}>
                                {resolved}
                              </TableCell>
                              <TableCell sx={{ color: "#ffffff" }}>
                                {resRate}%
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={handleDownloadDomainReport}
                                  sx={{
                                    borderColor: "rgba(34, 211, 238, 0.5)",
                                    color: "#22d3ee",
                                    fontSize: "12px",
                                    "&:hover": {
                                      borderColor: "#22d3ee",
                                      backgroundColor:
                                        "rgba(34, 211, 238, 0.1)",
                                    },
                                  }}
                                >
                                  📥 CSV
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      );
                    })()}
                  </TableBody>
                </Table>
              </Box>

              {uploadedVulnerabilities.length === 0 && (
                <Box className="text-center py-12">
                  <Typography className="text-slate-400">
                    No vulnerabilities to display. Upload vulnerability data to
                    generate domain-wise reports.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Scheduled Reports Tab */}
      {selectedTab === "scheduled" && (
        <Box className="space-y-6">
          <Card
            sx={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <CardContent>
              <Box className="flex items-center justify-between mb-4">
                <Typography className="font-semibold text-white text-lg">
                  Scheduled Reports
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddSchedule}
                  sx={{
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.4)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                    },
                  }}
                >
                  ⚙ Add Schedule
                </Button>
              </Box>

              <Table sx={{ "& .MuiTableCell-root": { color: "#ffffff" } }}>
                <TableHead>
                  <TableRow
                    sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Report Name
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Template
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Frequency
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Recipients
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Last Run
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledReports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{
                          textAlign: "center",
                          padding: "32px",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        No scheduled reports yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduledReports.map((report) => (
                      <TableRow
                        key={report.id}
                        sx={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.template}</TableCell>
                        <TableCell>{report.frequency}</TableCell>
                        <TableCell>{report.recipients}</TableCell>
                        <TableCell>{report.lastRun}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: "4px",
                              backgroundColor:
                                report.status === "Active"
                                  ? "rgba(34, 197, 94, 0.1)"
                                  : report.status === "Completed"
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(107, 114, 128, 0.1)",
                              color:
                                report.status === "Active"
                                  ? "#22c55e"
                                  : report.status === "Completed"
                                  ? "#3b82f6"
                                  : "#6b7280",
                              fontSize: "0.875rem",
                            }}
                          >
                            {report.status}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            sx={{
                              color: "#ef4444",
                              "&:hover": { color: "#dc2626" },
                            }}
                            onClick={() => {
                              setScheduledReports(
                                scheduledReports.filter(
                                  (r) => r.id !== report.id
                                )
                              );
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Add Schedule Dialog */}
      <Dialog
        open={scheduleOpen}
        onClose={handleCloseSchedule}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(7, 20, 39, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff", fontWeight: "bold" }}>
          Create New Schedule
        </DialogTitle>
        <DialogContent sx={{ color: "#ffffff" }}>
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Schedule Name"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g., Weekly Vulnerability Report"
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": { color: "#ffffff" },
                }}
              >
                Frequency
              </InputLabel>
              <Select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value)}
                label="Frequency"
                sx={{
                  color: "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": { color: "#ffffff" },
                }}
              >
                Template
              </InputLabel>
              <Select
                value={scheduleTemplate}
                onChange={(e) => setScheduleTemplate(e.target.value)}
                label="Template"
                sx={{
                  color: "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                }}
              >
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="detailed">Detailed</MenuItem>
                <MenuItem value="comprehensive">Comprehensive</MenuItem>
                <MenuItem value="executive">Executive</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Recipients (comma-separated emails)"
              value={scheduleRecipients}
              onChange={(e) => setScheduleRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              multiline
              rows={2}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={handleCloseSchedule}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSchedule}
            variant="contained"
            sx={{
              backgroundColor: "#ef4444",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            Create Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
