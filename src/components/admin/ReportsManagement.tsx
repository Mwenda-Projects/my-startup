import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  listing_id: string | null;
  listing_type: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter?: { full_name: string | null; email: string };
  reported_user?: { full_name: string | null; email: string };
}

interface ReportsManagementProps {
  reports: Report[];
  onRefresh: () => void;
}

const ReportsManagement = ({ reports, onRefresh }: ReportsManagementProps) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleResolve = async (reportId: string, status: "resolved" | "dismissed") => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Report updated",
        description: `Report has been ${status}`,
      });
      setSelectedReport(null);
      setResolutionNotes("");
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="outline">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reported By</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {report.reporter?.full_name || report.reporter?.email || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {report.reported_user?.full_name || report.reported_user?.email || "Unknown"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {report.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.listing_type || "User"}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason</label>
                <p className="mt-1">{selectedReport.reason}</p>
              </div>
              {selectedReport.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.listing_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedReport.listing_id}</p>
                </div>
              )}
              {selectedReport.status === "pending" && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resolution Notes</label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add notes about the resolution..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedReport?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleResolve(selectedReport.id, "dismissed")}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
                <Button
                  onClick={() => handleResolve(selectedReport.id, "resolved")}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement;
