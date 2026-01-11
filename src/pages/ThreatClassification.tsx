import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@mui/material";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Security from "@mui/icons-material/Security";
import CheckCircle from "@mui/icons-material/CheckCircle";
import AccessTime from "@mui/icons-material/AccessTime";
import CloudUpload from "@mui/icons-material/CloudUpload";
import {
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import type { RootState } from "../components/store/store";

interface Vulnerability {
  id: string;
  title?: string;
  severity?: string;
  status?: string;
  category?: string;
  company?: string; // company id
  company_id?: string;
}

interface Company {
  id: string;
  name?: string;
}

interface EmailThread {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  riskLevel?: "high" | "medium" | "low";
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  bg?: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  bg,
  icon,
  iconColor,
}) => (
  <Card
    sx={{
      background: bg || "transparent",
      border: "1px solid rgba(255,255,255,0.04)",
      p: 1,
      color: "white",
    }}
  >
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: "#ffffff",
              marginTop: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        {icon ? (
          <Box
            sx={{
              ml: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 1,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement, {
                  sx: { color: iconColor || "#fff", fontSize: 40 },
                })
              : icon}
          </Box>
        ) : null}
      </Box>
    </CardContent>
  </Card>
);

export default function ThreatClassification(): JSX.Element {
  const [selectedTab, setSelectedTab] = React.useState<"threat" | "threads">(
    "threat"
  );
  const vulnerabilities: Vulnerability[] = useSelector(
    (s: RootState) => (s.vulnerabilities && s.vulnerabilities.items) || []
  );
  const companies: Company[] = useSelector(
    (s: RootState) => (s.companies && s.companies.items) || []
  );
  const emails: EmailThread[] = useSelector(
    (s: RootState) => (s.emails && s.emails.items) || []
  );

  // Debug: log emails when they change
  React.useEffect(() => {
    console.log("ThreatClassification - Emails from Redux:", emails);
    console.log("ThreatClassification - Total emails:", emails.length);
  }, [emails]);

  // Use all vulnerabilities, not just those matching companies
  // This allows viewing imported vulnerability data regardless of company associations
  const uploadedVulnerabilities = vulnerabilities;

  const totalVulns = uploadedVulnerabilities.length;
  // legacy: single critical count (not used by current stat cards)
  // const criticalCount = vulnerabilities.filter(
  //   (v) => ((v.severity || "") as string).toLowerCase() === "critical"
  // ).length;

  // additional stats used by stat cards
  const criticalHigh = uploadedVulnerabilities.filter((v) => {
    const s = ((v.severity || "") as string).toLowerCase();
    return s === "critical" || s === "high";
  }).length;

  const OWASP_TOP10 = React.useMemo(
    () => [
      {
        id: "A01",
        title: "Broken Access",
        keywords: ["access", "broken access"],
      },
      {
        id: "A02",
        title: "Crypto Failures",
        keywords: ["crypto", "encryption", "crypto failure"],
      },
      { id: "A03", title: "Injection", keywords: ["injection", "sql", "xss"] },
      {
        id: "A04",
        title: "Insecure Design",
        keywords: ["design", "insecure design"],
      },
      {
        id: "A05",
        title: "Misconfig",
        keywords: ["config", "misconfig", "configuration"],
      },
      {
        id: "A06",
        title: "Vulnerable Comp.",
        keywords: ["component", "dependency", "library"],
      },
      {
        id: "A07",
        title: "Auth Failures",
        keywords: ["auth", "authentication", "authorization"],
      },
      {
        id: "A08",
        title: "Data Integrity",
        keywords: ["integrity", "data integrity"],
      },
      { id: "A09", title: "Logging Failures", keywords: ["log", "logging"] },
      {
        id: "A10",
        title: "SSRF",
        keywords: ["ssrf", "server side request forgery"],
      },
    ],
    []
  );

  // OWASP match count (not used directly here; use `countForOwasp` per OWASP tile)

  const detectedOwasp = React.useMemo(() => {
    return OWASP_TOP10.filter((o) => {
      const kws = o.keywords.map((k) => k.toLowerCase());
      return uploadedVulnerabilities.some((v) => {
        const c = (v.category || "").toLowerCase();
        const t = (v.title || "").toLowerCase();
        return kws.some((k) => c.includes(k) || t.includes(k));
      });
    });
  }, [OWASP_TOP10, uploadedVulnerabilities]);

  const detectedOwaspCount = detectedOwasp.length;

  const avgPerCompany = React.useMemo(() => {
    const companyCount = companies.length || 1;
    return (
      Math.round((uploadedVulnerabilities.length / companyCount) * 100) / 100
    );
  }, [uploadedVulnerabilities, companies]);

  const countForOwaspFiltered = React.useCallback(
    (item: (typeof OWASP_TOP10)[number], companyId?: string) => {
      const kws = item.keywords.map((k) => k.toLowerCase());
      return uploadedVulnerabilities.filter((v) => {
        if (
          companyId &&
          !(v.company === companyId || v.company_id === companyId)
        )
          return false;
        const c = (v.category || "").toLowerCase();
        const t = (v.title || "").toLowerCase();
        return kws.some((k) => c.includes(k) || t.includes(k));
      }).length;
    },
    [uploadedVulnerabilities]
  );

  // Prepare data for OWASP pie chart
  const owaspChartData = React.useMemo(() => {
    return OWASP_TOP10.map((item) => ({
      name: item.title,
      value: countForOwaspFiltered(item, undefined),
      id: item.id,
    }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [OWASP_TOP10, countForOwaspFiltered]);

  // Color palette for the pie chart (matching OWASP colors)
  const OWASP_COLORS = [
    "#ef4444", // Red for A01
    "#f97316", // Orange for A02
    "#eab308", // Yellow for A03
    "#ec4899", // Pink for A04
    "#8b5cf6", // Purple for A05
    "#06b6d4", // Cyan for A06
    "#10b981", // Green for A07
    "#3b82f6", // Blue for A08
    "#6366f1", // Indigo for A09
    "#14b8a6", // Teal for A10
  ];

  // Category breakdown
  interface CategoryCount {
    category: string;
    count: number;
  }

  const categoryCounts = React.useMemo<CategoryCount[]>(() => {
    const map: Record<string, number> = {};
    for (const v of uploadedVulnerabilities) {
      const c = v.category || "Uncategorized";
      map[c] = (map[c] || 0) + 1;
    }
    return Object.keys(map)
      .map((k) => ({ category: k, count: map[k] }))
      .sort((a: CategoryCount, b: CategoryCount) => b.count - a.count);
  }, [uploadedVulnerabilities]);

  // Show upload prompt if no vulnerabilities have been uploaded
  if (totalVulns === 0 && emails.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "600px",
          color: "white",
        }}
      >
        <Typography variant="h4" className="font-bold text-white mb-4">
          Threat Classification
        </Typography>
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 2,
          }}
        >
          <CloudUpload
            sx={{
              fontSize: 60,
              color: "rgba(255,255,255,0.3)",
              mb: 2,
            }}
          />
          <Typography variant="h5" className="mb-2">
            No Data
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              mb: 4,
              maxWidth: 400,
            }}
          >
            Upload a CSV file with vulnerability data to view threat
            classification, OWASP risk analysis, and company risk summaries.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            href="/vulnerability-explorer"
            sx={{
              background: "linear-gradient(90deg,#0ea5a4,#0369a1)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(90deg,#06b5af,#0556b6)",
              },
            }}
          >
            Go to Upload Page
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" className="font-bold text-white mb-6">
        Threat Classification
      </Typography>

      {/* Tabs Navigation */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 4,
            borderBottom: "2px solid rgba(255,255,255,0.05)",
          }}
        >
          <Box
            onClick={() => setSelectedTab("threat")}
            sx={{
              pb: 2,
              cursor: "pointer",
              borderBottom:
                selectedTab === "threat" ? "3px solid #0ea5a4" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <Typography
              className="flex items-center gap-2 font-semibold"
              sx={{
                color:
                  selectedTab === "threat"
                    ? "#0ea5a4"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              THREAT CLASSIFICATION
            </Typography>
          </Box>
          <Box
            onClick={() => setSelectedTab("threads")}
            sx={{
              pb: 2,
              cursor: "pointer",
              borderBottom:
                selectedTab === "threads" ? "3px solid #0ea5a4" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <Typography
              className="flex items-center gap-2 font-semibold"
              sx={{
                color:
                  selectedTab === "threads"
                    ? "#0ea5a4"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              THREAT THREADS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Threat Classification Tab Content */}
      {selectedTab === "threat" && (
        <Box>
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
              title="OWASP Categories"
              value={
                <Box>
                  <Typography
                    sx={{ fontSize: 22, fontWeight: 700, color: "#fff" }}
                  >
                    {detectedOwaspCount}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}
                  >
                    {detectedOwasp.map((o) => o.id).join(", ") || "—"}
                  </Typography>
                </Box>
              }
              icon={<CheckCircle />}
              bg={"linear-gradient(90deg,#8b5cf6,#6366f1)"}
              iconColor="#a78bfa"
            />
            <StatCard
              title="Avg / Company"
              value={avgPerCompany}
              icon={<AccessTime />}
              bg={"linear-gradient(90deg,#06b6d4,#0284c7)"}
              iconColor="#06b6d4"
            />
          </Box>

          <Card
            sx={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
              mb: 2,
            }}
          >
            <CardContent>
              <Typography className="font-semibold mb-6 text-white text-center">
                OWASP Top 10 Distribution
              </Typography>
              {owaspChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                  <PieChart>
                    <Pie
                      data={owaspChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {owaspChartData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={OWASP_COLORS[index % OWASP_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        borderRadius: 8,
                        color: "black",
                      }}
                      formatter={(value) => [
                        `${value} vulnerabilities`,
                        "Count",
                      ]}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: 20,
                        color: "rgba(255, 255, 255, 0.8)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography
                  sx={{
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                    py: 4,
                  }}
                >
                  No OWASP vulnerabilities detected in the selected company
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card
            sx={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
              mb: 2,
            }}
          >
            <CardContent>
              <Typography className="font-semibold text-white mb-4">
                Category Breakdown
              </Typography>
              {categoryCounts.length > 0 ? (
                <Box className="space-y-4">
                  {categoryCounts.map((c: CategoryCount) => (
                    <Box
                      key={c.category}
                      className="flex items-center justify-between"
                    >
                      <Box className="w-3/4">
                        <Typography className="text-slate-300 text-sm mb-1">
                          {c.category}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (c.count / (categoryCounts[0]?.count || 1)) * 100
                          }
                          sx={{
                            height: 8,
                            borderRadius: 2,
                            backgroundColor: "rgba(255,255,255,0.04)",
                          }}
                        />
                      </Box>
                      <Box className="w-1/12 text-right">
                        <Typography className="text-slate-300">
                          {c.count}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  sx={{
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                    py: 4,
                  }}
                >
                  No vulnerability data available
                </Typography>
              )}

              {/* Email Section in Category Breakdown */}
              {emails.length > 0 && (
                <Box
                  sx={{
                    mt: 6,
                    pt: 4,
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Box className="flex items-center justify-between mb-4">
                    <Typography className="font-semibold text-white text-lg flex items-center gap-2">
                      <span>📧</span> Emails from CSV
                    </Typography>
                    <Chip
                      label={`${emails.length} emails`}
                      sx={{
                        background: "rgba(14, 165, 164, 0.2)",
                        color: "#0ea5a4",
                        border: "1px solid #0ea5a4",
                      }}
                    />
                  </Box>

                  <Table sx={{ color: "white" }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 600,
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 600,
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          Subject
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 600,
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          From
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 600,
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 600,
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          Attachment
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emails.map((email) => (
                        <TableRow
                          key={email.id}
                          sx={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            "&:hover": {
                              background: "rgba(14, 165, 164, 0.1)",
                            },
                          }}
                        >
                          <TableCell sx={{ color: "white" }}>
                            <Chip
                              label={email.isRead ? "Read" : "Unread"}
                              size="small"
                              sx={{
                                background: email.isRead
                                  ? "rgba(107, 114, 128, 0.3)"
                                  : "rgba(14, 165, 164, 0.3)",
                                color: email.isRead ? "#9ca3af" : "#0ea5a4",
                                border: `1px solid ${
                                  email.isRead ? "#4b5563" : "#0ea5a4"
                                }`,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            <Typography className="font-semibold text-sm">
                              {email.subject}
                            </Typography>
                            <Typography className="text-xs text-slate-400 mt-1">
                              {email.preview}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                            {email.from}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            {email.date}
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", textAlign: "center" }}
                          >
                            {email.hasAttachment ? (
                              <span className="text-lg">📎</span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Threat Threads Tab Content */}
      {selectedTab === "threads" && (
        <Box>
          <Card
            sx={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <CardContent>
              <Typography className="font-semibold mb-4 text-white">
                Email Threat Threads
              </Typography>
              {emails.length > 0 ? (
                <Box>
                  <Typography variant="body2" className="text-slate-400 mb-4">
                    Total Email Threads: {emails.length}
                  </Typography>
                  <Box className="overflow-x-auto">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 600,
                            }}
                          >
                            Risk Level
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 600,
                            }}
                          >
                            Subject
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 600,
                            }}
                          >
                            From
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 600,
                            }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 600,
                            }}
                          >
                            Attachment
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {emails.map((email) => (
                          <TableRow
                            key={email.id}
                            sx={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.02)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "white",
                                backgroundColor:
                                  email.riskLevel === "high"
                                    ? `rgba(239, 68, 68, 0.1)`
                                    : email.riskLevel === "medium"
                                    ? `rgba(245, 158, 11, 0.1)`
                                    : `rgba(34, 197, 94, 0.1)`,
                              }}
                            >
                              <Chip
                                label={email.riskLevel?.toUpperCase() || "LOW"}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    email.riskLevel === "high"
                                      ? "rgba(239, 68, 68, 0.3)"
                                      : email.riskLevel === "medium"
                                      ? "rgba(245, 158, 11, 0.3)"
                                      : "rgba(34, 197, 94, 0.3)",
                                  color:
                                    email.riskLevel === "high"
                                      ? "#ef4444"
                                      : email.riskLevel === "medium"
                                      ? "#f59e0b"
                                      : "#22c55e",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              <Typography className="font-semibold text-sm">
                                {email.subject}
                              </Typography>
                              <Typography className="text-xs text-slate-400 mt-1">
                                {email.preview}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                              {email.from}
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                              {email.date}
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", textAlign: "center" }}
                            >
                              {email.hasAttachment ? (
                                <span className="text-lg">📎</span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              ) : (
                <Typography
                  sx={{
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                    py: 4,
                  }}
                >
                  No email threat threads available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
