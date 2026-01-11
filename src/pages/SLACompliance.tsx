import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../components/store/store";
import { fetchVulnerabilities } from "../components/store/slices/vulnerabilitiesSlice";
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
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Warning,
  ErrorOutlined,
} from "@mui/icons-material";

interface SLAMetric {
  id: string;
  company: string;
  title: string;
  severity: string;
  foundDate: string;
  dueDate: string;
  daysRemaining: number;
  status: "On Track" | "At Risk" | "Breached";
  compliance: number;
}

export default function SLACompliance() {
  const navigate = useNavigate();
  const vulnerabilities = useSelector(
    (state: RootState) => state.vulnerabilities.items
  );
  const companies = useSelector((state: RootState) => state.companies.items);

  // Fetch default vulnerabilities if none exist
  const dispatch = useDispatch();
  useEffect(() => {
    // Only fetch default vulnerabilities if store is empty
    // This allows uploaded data from Vulnerability Explorer to be preserved
    if (!vulnerabilities || vulnerabilities.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(fetchVulnerabilities() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate SLA metrics from uploaded vulnerabilities
  const slaData = useMemo(() => {
    if (!vulnerabilities || vulnerabilities.length === 0) {
      return {
        totalVulnerabilities: 0,
        compliant: 0,
        atRisk: 0,
        breached: 0,
        overallCompliance: 0,
        metrics: [],
      };
    }

    const metrics: SLAMetric[] = vulnerabilities.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (vuln: any, index: number) => {
        // Try to get company name from multiple sources in order of preference
        let companyName = "";

        // First try: if company_name is directly provided, use it
        if (vuln.company_name && String(vuln.company_name).trim() !== "") {
          companyName = String(vuln.company_name).trim();
        }

        // Second try: use domain field if available (primary source for domain info)
        if (!companyName && vuln.domain && String(vuln.domain).trim() !== "") {
          companyName = String(vuln.domain).trim();
        }

        // Third try: match by company_id in companies array
        if (!companyName && vuln.company_id) {
          const found = companies?.find(
            (c: { id: string | number; name?: string }) =>
              String(c.id).toLowerCase() ===
              String(vuln.company_id).toLowerCase()
          );
          if (found?.name) {
            companyName = found.name;
          }
        }

        // Fourth try: use company field if available
        if (
          !companyName &&
          vuln.company &&
          String(vuln.company).trim() !== ""
        ) {
          companyName = String(vuln.company).trim();
        }

        // Fifth try: use domain_id if available
        if (!companyName && vuln.domain_id) {
          companyName = `Domain-${vuln.domain_id}`;
        }

        // Sixth try: use company_id as fallback display name
        if (!companyName && vuln.company_id) {
          companyName = `Company-${vuln.company_id}`;
        }

        // Final fallback - use a generic placeholder
        if (!companyName || companyName.trim() === "") {
          companyName = "Unassigned Domain";
        }

        // Get SLA due date (from sla_due field or calculate from severity)
        let foundDate =
          vuln.date_found || vuln.date_discovered || new Date().toISOString();

        // Try to parse the date if it's a string
        try {
          new Date(foundDate);
        } catch {
          foundDate = new Date().toISOString();
        }

        const slaDueDays: Record<string, number> = {
          critical: 5,
          high: 14,
          medium: 30,
          low: 90,
        };

        let dueDate = vuln.sla_due || vuln.sla_compliance;
        if (!dueDate || dueDate === "") {
          const daysToAdd =
            slaDueDays[vuln.severity?.toLowerCase() || "low"] || 90;
          const foundDateObj = new Date(foundDate);
          const calculatedDue = new Date(foundDateObj);
          calculatedDue.setDate(calculatedDue.getDate() + daysToAdd);
          dueDate = calculatedDue.toISOString();
        } else {
          // Validate dueDate
          try {
            new Date(dueDate);
          } catch {
            const daysToAdd =
              slaDueDays[vuln.severity?.toLowerCase() || "low"] || 90;
            const foundDateObj = new Date(foundDate);
            const calculatedDue = new Date(foundDateObj);
            calculatedDue.setDate(calculatedDue.getDate() + daysToAdd);
            dueDate = calculatedDue.toISOString();
          }
        }

        // Calculate days remaining
        const dueDateObj = new Date(dueDate);
        const today = new Date();
        const daysRemaining = Math.ceil(
          (dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine status based on days remaining
        let status: "On Track" | "At Risk" | "Breached" = "On Track";
        let compliance = 100;

        if (daysRemaining < 0) {
          status = "Breached";
          compliance = 0;
        } else if (daysRemaining <= 3) {
          status = "At Risk";
          compliance = Math.max(0, Math.min(50, daysRemaining * 20));
        } else {
          status = "On Track";
          compliance =
            75 + (daysRemaining > 30 ? 25 : (daysRemaining / 30) * 25);
        }

        return {
          id: vuln.id || `vuln-${index}`,
          company: companyName,
          title: vuln.title || `Vulnerability ${index + 1}`,
          severity: vuln.severity || "Unknown",
          foundDate: new Date(foundDate).toLocaleDateString(),
          dueDate: new Date(dueDate).toLocaleDateString(),
          daysRemaining,
          status,
          compliance: Math.round(compliance),
        };
      }
    );

    // Calculate summary stats
    const compliant = metrics.filter((m) => m.status === "On Track").length;
    const atRisk = metrics.filter((m) => m.status === "At Risk").length;
    const breached = metrics.filter((m) => m.status === "Breached").length;
    const overallCompliance =
      metrics.length > 0
        ? Math.round(
            metrics.reduce((sum, m) => sum + m.compliance, 0) / metrics.length
          )
        : 0;

    return {
      totalVulnerabilities: metrics.length,
      compliant,
      atRisk,
      breached,
      overallCompliance,
      metrics,
    };
  }, [vulnerabilities, companies]);

  return (
    <Box className="space-y-6">
      {/* Header */}
      <Box className="flex items-center justify-between mb-6">
        <Box className="flex items-center gap-3">
          <Button
            variant="text"
            onClick={() => navigate("/vulnerabilities")}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": { color: "#ffffff" },
              minWidth: "auto",
              padding: "4px 8px",
            }}
          >
            <ArrowBack sx={{ fontSize: 20 }} />
          </Button>
          <Typography className="text-3xl font-bold text-white">
            SLA Compliance
          </Typography>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 3,
          mb: 3,
        }}
      >
        {/* Overall Compliance Card */}
        <Box>
          <Card
            sx={{
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Box className="flex items-center justify-between mb-3">
                <Typography
                  className="text-slate-400 text-sm font-medium"
                  variant="body2"
                >
                  Overall Compliance
                </Typography>
                <CheckCircle sx={{ fontSize: 20, color: "#22c55e" }} />
              </Box>
              <Typography
                className="text-3xl font-bold mb-3"
                sx={{ color: "#ffffff" }}
              >
                {slaData.overallCompliance}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={slaData.overallCompliance}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#22c55e",
                    borderRadius: 3,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* SLA Breaches Card */}
        <Box>
          <Card
            sx={{
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Box className="flex items-center justify-between mb-3">
                <Typography
                  className="text-slate-400 text-sm font-medium"
                  variant="body2"
                >
                  SLA Breaches
                </Typography>
                <ErrorOutlined sx={{ fontSize: 20, color: "#ef4444" }} />
              </Box>
              <Typography
                className="text-3xl font-bold mb-2"
                sx={{ color: "#ffffff" }}
              >
                {slaData.breached}
              </Typography>
              <Typography className="text-xs text-slate-400">
                Overdue vulnerabilities
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* At Risk Card */}
        <Box>
          <Card
            sx={{
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Box className="flex items-center justify-between mb-3">
                <Typography
                  className="text-slate-400 text-sm font-medium"
                  variant="body2"
                >
                  At Risk
                </Typography>
                <Warning sx={{ fontSize: 20, color: "#f59e0b" }} />
              </Box>
              <Typography
                className="text-3xl font-bold mb-2"
                sx={{ color: "#ffffff" }}
              >
                {slaData.atRisk}
              </Typography>
              <Typography className="text-xs text-slate-400">
                Due within 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* On Track Card */}
        <Box>
          <Card
            sx={{
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Box className="flex items-center justify-between mb-3">
                <Typography
                  className="text-slate-400 text-sm font-medium"
                  variant="body2"
                >
                  On Track
                </Typography>
                <CheckCircle sx={{ fontSize: 20, color: "#3b82f6" }} />
              </Box>
              <Typography
                className="text-3xl font-bold mb-2"
                sx={{ color: "#ffffff" }}
              >
                {slaData.compliant}
              </Typography>
              <Typography className="text-xs text-slate-400">
                Meeting deadlines
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Domain-wise SLA Compliance Table */}
      <Card
        sx={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <CardContent>
          <Box className="flex items-center justify-between mb-4">
            <Typography className="font-semibold text-white text-lg">
              Domain-wise SLA Compliance
            </Typography>
            <Box className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="small"
                startIcon={<span>⚙</span>}
                sx={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<span>↓</span>}
                sx={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Export
              </Button>
            </Box>
          </Box>

          {slaData.metrics.length === 0 ? (
            <Box className="py-12 text-center">
              <Typography className="text-slate-400 text-lg">
                No vulnerabilities uploaded yet
              </Typography>
              <Typography className="text-slate-500 text-sm mt-2">
                Upload vulnerability data from the Vulnerability Explorer to see
                domain-wise SLA compliance
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/vulnerabilities")}
                sx={{
                  marginTop: 3,
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Go to Vulnerability Explorer
              </Button>
            </Box>
          ) : (
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
                    Compliance Rate
                  </TableCell>
                  <TableCell
                    sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                  >
                    Total Vulnerabilities
                  </TableCell>
                  <TableCell
                    sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                  >
                    On Time
                  </TableCell>
                  <TableCell
                    sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slaData.metrics.map((metric) => {
                  const statusColor =
                    metric.status === "On Track"
                      ? "#22c55e"
                      : metric.status === "At Risk"
                      ? "#f59e0b"
                      : "#ef4444";

                  return (
                    <TableRow
                      key={metric.id}
                      sx={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.02)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#ffffff",
                          minWidth: 250,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                            {metric.company}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.6)",
                            }}
                          >
                            {metric.severity.toUpperCase()} • {metric.foundDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Box
                            sx={{
                              width: 100,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "rgba(255,255,255,0.1)",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${metric.compliance}%`,
                                height: "100%",
                                backgroundColor: statusColor,
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{ color: "#ffffff", fontWeight: 600 }}
                          >
                            {metric.compliance}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{ color: statusColor, fontWeight: 600 }}
                        >
                          1
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>
                          {metric.status === "On Track" ? "1" : "0"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={metric.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              metric.status === "On Track"
                                ? "rgba(34, 197, 94, 0.2)"
                                : metric.status === "At Risk"
                                ? "rgba(245, 158, 11, 0.2)"
                                : "rgba(239, 68, 68, 0.2)",
                            color: statusColor,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
