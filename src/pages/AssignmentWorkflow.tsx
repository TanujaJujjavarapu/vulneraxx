import { useEffect, useState } from "react";

// Placeholder type for VAPT steps
type VATPStep =
  | "configuration"
  | "discovery"
  | "analysis"
  | "penetration"
  | "validation"
  | "reporting"
  | "risk_scoring";

type VATPStepStatus = {
  name: VATPStep;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  duration: string;
};

// Empty assignments array - will be populated when assignment workflow features are implemented
// const mockAssignments: Assignment[] = [];

const VAPT_STEPS: VATPStepStatus[] = [
  {
    name: "configuration",
    label: "Configuration",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
  {
    name: "discovery",
    label: "Discovery",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
  {
    name: "analysis",
    label: "Analysis",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
  {
    name: "penetration",
    label: "Penetration Testing",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
  {
    name: "validation",
    label: "Validation",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
  {
    name: "reporting",
    label: "Report Generation",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
  {
    name: "risk_scoring",
    label: "Risk Scoring",
    status: "pending",
    progress: 0,
    duration: "0:00",
  },
];

// Note: The following helper functions are prepared for future assignment workflow features
// They will be utilized when the assignment system is fully implemented in the UI

export default function AssignmentWorkflow() {
  // Assignment state - currently empty but prepared for future assignment features
  // const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("All Assignees");
  const [workflowStatus, setWorkflowStatus] = useState<
    "idle" | "running" | "paused"
  >("idle");
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [vaptSteps, setVaptSteps] = useState<VATPStepStatus[]>(VAPT_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    filesScanned: 0,
    vulnerabilities: 0,
    testsExecuted: 0,
    timeElapsed: "0:00",
  });

  // Unused for now - will be used when assignment features are expanded
  // const groups = useMemo(() => {
  //   return createAssignmentGroups(assignments);
  // }, [assignments]);

  // Simulate VAPT workflow execution
  useEffect(() => {
    if (workflowStatus !== "running") return;

    const interval = setInterval(() => {
      setVaptSteps((prev) => {
        const newSteps = [...prev];
        let activeStep = newSteps.findIndex((s) => s.status === "running");

        // If no running step, start the first pending one
        if (activeStep === -1) {
          activeStep = newSteps.findIndex((s) => s.status === "pending");
          if (activeStep !== -1) {
            newSteps[activeStep].status = "running";
            newSteps[activeStep].progress = 10;
            setCurrentStepIndex(activeStep);
          }
        } else {
          // Progress current step
          if (newSteps[activeStep].progress < 100) {
            newSteps[activeStep].progress += Math.random() * 15 + 5;
            if (newSteps[activeStep].progress > 100) {
              newSteps[activeStep].progress = 100;
            }
          }

          // If step is complete, mark it as completed and move to next
          if (newSteps[activeStep].progress >= 100) {
            newSteps[activeStep].status = "completed";
            const completedCount = newSteps.filter(
              (s) => s.status === "completed"
            ).length;
            setWorkflowProgress(completedCount);

            const nextPending = newSteps.findIndex(
              (s) => s.status === "pending"
            );
            if (nextPending === -1) {
              // All steps completed
              setWorkflowStatus("idle");
              setWorkflowProgress(7);
            } else {
              setCurrentStepIndex(nextPending);
            }
          }
        }

        return newSteps;
      });

      setWorkflowMetrics((prev) => ({
        ...prev,
        filesScanned: Math.floor(Math.random() * 100),
        vulnerabilities: Math.floor(Math.random() * 30),
        testsExecuted: Math.floor(Math.random() * 50),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [workflowStatus]);

  // Unused for now - will be used when assignment features are expanded
  // function assignTo(id: string, user: string) {
  //   setAssignments((prev) => assignWorkToUser(prev, id, user));
  // }

  function resetWorkflow() {
    setWorkflowStatus("idle");
    setWorkflowProgress(0);
    setCurrentStepIndex(-1);
    setVaptSteps(
      VAPT_STEPS.map((step) => ({
        ...step,
        status: "pending",
        progress: 0,
        duration: "0:00",
      }))
    );
    setWorkflowMetrics({
      filesScanned: 0,
      vulnerabilities: 0,
      testsExecuted: 0,
      timeElapsed: "0:00",
    });
  }

  return (
    <div className="p-6 text-slate-100 bg-slate-900 min-h-screen">
      {/* Assignment Workflow Header and Stats - TOP */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Assignment Workflow</h1>
          <p className="text-slate-400">
            Assign and track vulnerability remediation tasks
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-800 text-slate-100 p-2 rounded border border-slate-700"
          >
            <option>All Assignees</option>
            <option>alice@example.com</option>
            <option>bob@example.com</option>
            <option>carol@example.com</option>
          </select>
        </div>
      </div>

      {/* Workflow Control Section */}
      <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Workflow Control</h2>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-slate-400">
                Target: app.company.com
              </div>
              <div
                className={`text-sm font-semibold ${
                  workflowStatus === "paused"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {workflowStatus === "idle"
                  ? "Ready"
                  : workflowStatus === "paused"
                  ? "Paused"
                  : "Running"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Progress</div>
              <div className="text-2xl font-bold">{workflowProgress}/7</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() =>
              setWorkflowStatus(
                workflowStatus === "running" ? "paused" : "running"
              )
            }
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 rounded-lg font-semibold border border-slate-700"
          >
            <span className="text-lg">▶</span>{" "}
            {workflowStatus === "running" ? "Pause Workflow" : "Start Workflow"}
          </button>
          <button
            onClick={resetWorkflow}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded border border-slate-600"
          >
            <span>↻</span> Reset
          </button>
        </div>

        <div className="text-sm text-slate-400 mb-4">
          <span className="text-blue-400">
            Step {currentStepIndex + 1}:{" "}
            {currentStepIndex >= 0
              ? vaptSteps[currentStepIndex]?.label
              : "Ready"}
          </span>{" "}
          — {workflowProgress * (100 / 7)}% Complete
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-600">
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <span>📁</span> Files Scanned
            </div>
            <div className="text-3xl font-bold">
              {workflowMetrics.filesScanned}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-600">
            <div className="flex items-center gap-2 text-orange-400 text-sm mb-2">
              <span>⚠</span> Vulnerabilities
            </div>
            <div className="text-3xl font-bold">
              {workflowMetrics.vulnerabilities}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-600">
            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
              <span>✓</span> Tests Executed
            </div>
            <div className="text-3xl font-bold">
              {workflowMetrics.testsExecuted}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-600">
            <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
              <span>⏱</span> Time Elapsed
            </div>
            <div className="text-3xl font-bold">
              {workflowMetrics.timeElapsed}
            </div>
          </div>
        </div>
      </div>

      {/* VAPT Process Flow Section */}
      <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-blue-400">🛡</span>
          <h3 className="text-lg font-bold">
            VAPT Process Flow - Interactive Visualization
          </h3>
        </div>

        <div className="space-y-4">
          {vaptSteps.map((step, index) => (
            <div
              key={step.name}
              className={`bg-slate-900 rounded-lg p-6 border transition-all ${
                step.status === "completed"
                  ? "border-emerald-500 bg-slate-900/50"
                  : step.status === "running"
                  ? "border-blue-500"
                  : "border-slate-600"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`text-3xl ${
                    step.status === "completed"
                      ? "opacity-100"
                      : step.status === "running"
                      ? "animate-pulse"
                      : "opacity-50"
                  }`}
                >
                  {step.status === "completed"
                    ? "✅"
                    : step.status === "running"
                    ? "⚡"
                    : index === 0
                    ? "⚙"
                    : index === 1
                    ? "🔍"
                    : index === 2
                    ? "🛡"
                    : index === 3
                    ? "🎯"
                    : index === 4
                    ? "✓"
                    : index === 5
                    ? "📄"
                    : "📊"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold">
                      {step.label}
                      <span
                        className={`ml-3 text-xs px-2 py-1 rounded ${
                          step.status === "pending"
                            ? "bg-slate-700 text-slate-300"
                            : step.status === "running"
                            ? "bg-blue-900 text-blue-200"
                            : step.status === "completed"
                            ? "bg-emerald-900 text-emerald-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {step.status.charAt(0).toUpperCase() +
                          step.status.slice(1)}
                      </span>
                    </h4>
                    {step.status !== "pending" && (
                      <span className="text-xs text-slate-400">
                        {step.duration}
                      </span>
                    )}
                  </div>

                  {step.status !== "pending" && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Progress</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {Math.floor(step.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            step.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800 rounded p-3 text-xs text-slate-300">
                    <div className="font-semibold mb-1">Technical Details:</div>
                    <div>
                      {index === 0 &&
                        "Domain validation, scope definition, scan profile selection"}
                      {index === 1 &&
                        "Port scanning, service detection, technology identification"}
                      {index === 2 &&
                        "Static analysis, dynamic testing, configuration review"}
                      {index === 3 &&
                        "Payload execution, privilege escalation, lateral movement"}
                      {index === 4 &&
                        "False positive filtering, CVSS scoring, impact assessment"}
                      {index === 5 &&
                        "Executive summary, technical details, remediation guidance"}
                      {index === 6 &&
                        "Risk calculation, SLA deadline assignment, priority ranking"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
