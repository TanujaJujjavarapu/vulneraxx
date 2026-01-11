import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { PlayArrow } from "@mui/icons-material";

interface Scan {
  id: string;
  company_name?: string;
  company_id: string;
  status: string;
  scan_date: string;
}

export default function RecentScansTable({
  scans,
  onRefresh,
}: {
  scans: Scan[];
  onRefresh?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">Recent Scans</h3>
        <Button
          variant="contained"
          onClick={onRefresh}
          sx={{ bgcolor: "#06b6d4", "&:hover": { bgcolor: "#0891b2" } }}
          size="small"
        >
          <PlayArrow className="mr-2" />
          Quick Scan
        </Button>
      </div>
      <Table size="small" sx={{ background: "transparent" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "#ffffff" }}>Scan ID</TableCell>
            <TableCell sx={{ color: "#ffffff" }}>Company</TableCell>
            <TableCell sx={{ color: "#ffffff" }}>Status</TableCell>
            <TableCell sx={{ color: "#ffffff" }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scans.map((s) => (
            <TableRow key={s.id} sx={{ "& td": { color: "white" } }}>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.company_name || s.company_id}</TableCell>
              <TableCell>{s.status}</TableCell>
              <TableCell>{new Date(s.scan_date).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
