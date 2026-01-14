import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  phone_number: string;
  status: string;
  mpesa_transaction_id: string | null;
  notes: string | null;
  created_at: string;
  user?: { full_name: string | null; email: string };
}

interface WithdrawalsManagementProps {
  withdrawals: Withdrawal[];
  onRefresh: () => void;
}

const WithdrawalsManagement = ({ withdrawals, onRefresh }: WithdrawalsManagementProps) => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [mpesaTransactionId, setMpesaTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = async (withdrawalId: string, status: "completed" | "rejected") => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: any = {
        status,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
        notes,
      };

      if (status === "completed" && mpesaTransactionId) {
        updateData.mpesa_transaction_id = mpesaTransactionId;
      }

      // If rejected, refund the wallet by fetching current balance and adding
      if (status === "rejected" && selectedWithdrawal) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("available_balance")
          .eq("user_id", selectedWithdrawal.user_id)
          .single();
        
        if (wallet) {
          await supabase
            .from("wallets")
            .update({
              available_balance: wallet.available_balance + selectedWithdrawal.amount,
            })
            .eq("user_id", selectedWithdrawal.user_id);
        }
      }

      const { error } = await supabase
        .from("withdrawals")
        .update(updateData)
        .eq("id", withdrawalId);

      if (error) throw error;

      toast({
        title: "Withdrawal processed",
        description: `Withdrawal has been ${status}`,
      });
      setSelectedWithdrawal(null);
      setMpesaTransactionId("");
      setNotes("");
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
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingTotal = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Pending withdrawals: <span className="font-bold text-foreground">KES {pendingTotal.toLocaleString()}</span>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No withdrawal requests
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    {withdrawal.user?.full_name || withdrawal.user?.email || "Unknown"}
                  </TableCell>
                  <TableCell className="font-medium">
                    KES {withdrawal.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono">
                    {withdrawal.phone_number}
                  </TableCell>
                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {withdrawal.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                      >
                        Process
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">KES {selectedWithdrawal.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-mono">{selectedWithdrawal.phone_number}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">M-Pesa Transaction ID</label>
                <Input
                  value={mpesaTransactionId}
                  onChange={(e) => setMpesaTransactionId(e.target.value)}
                  placeholder="e.g., SAL123XYZ"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleProcess(selectedWithdrawal!.id, "rejected")}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleProcess(selectedWithdrawal!.id, "completed")}
              disabled={isProcessing || !mpesaTransactionId}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalsManagement;
