import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TransactionStatus = Database["public"]["Enums"]["transaction_status"];

interface Transaction {
  id: string;
  listing_title: string;
  listing_type: "item" | "service";
  amount: number;
  platform_fee: number;
  seller_amount: number;
  status: TransactionStatus;
  buyer_id: string | null;
  seller_id: string;
  buyer_confirmed: boolean;
  seller_confirmed_delivery: boolean;
  created_at: string;
  delivered_at: string | null;
  completed_at: string | null;
}

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="w-4 h-4" /> },
  paid_escrow: { label: "In Escrow", color: "bg-blue-500/10 text-blue-600", icon: <Package className="w-4 h-4" /> },
  delivered: { label: "Delivered", color: "bg-purple-500/10 text-purple-600", icon: <ArrowRight className="w-4 h-4" /> },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600", icon: <CheckCircle2 className="w-4 h-4" /> },
  disputed: { label: "Disputed", color: "bg-red-500/10 text-red-600", icon: <AlertCircle className="w-4 h-4" /> },
  refunded: { label: "Refunded", color: "bg-gray-500/10 text-gray-600", icon: <ArrowRight className="w-4 h-4" /> },
  cancelled: { label: "Cancelled", color: "bg-gray-500/10 text-gray-600", icon: <AlertCircle className="w-4 h-4" /> }
};

interface TransactionListProps {
  type: "buyer" | "seller";
}

const TransactionList = ({ type }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const column = type === "buyer" ? "buyer_id" : "seller_id";
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq(column, user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async (transactionId: string) => {
    setProcessingId(transactionId);
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "confirm_delivery",
          transaction_id: transactionId
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message);
      }

      toast({
        title: data.completed ? "Transaction Completed!" : "Delivery Confirmed",
        description: data.completed 
          ? "Payment has been released to the seller" 
          : "Waiting for the other party to confirm"
      });

      fetchTransactions();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm delivery",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No {type === "buyer" ? "purchases" : "sales"} yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => {
        const status = statusConfig[tx.status];
        const isBuyer = tx.buyer_id === userId;
        const canConfirm = 
          (tx.status === "paid_escrow" || tx.status === "delivered") &&
          ((isBuyer && !tx.buyer_confirmed) || (!isBuyer && !tx.seller_confirmed_delivery));

        return (
          <Card key={tx.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={status.color}>
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {tx.listing_type}
                    </Badge>
                  </div>
                  
                  <h3 className="font-medium truncate">{tx.listing_title}</h3>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                    {type === "seller" && (
                      <span className="text-green-600">
                        +KSh {tx.seller_amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    KSh {tx.amount.toLocaleString()}
                  </p>
                  
                  {canConfirm && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleConfirmDelivery(tx.id)}
                      disabled={processingId === tx.id}
                    >
                      {processingId === tx.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {isBuyer ? "Confirm Receipt" : "Mark Delivered"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress indicator for escrow transactions */}
              {(tx.status === "paid_escrow" || tx.status === "delivered") && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Paid</span>
                    </div>
                    <div className="h-px flex-1 mx-2 bg-border" />
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className={`w-4 h-4 ${tx.seller_confirmed_delivery ? "text-green-500" : ""}`} />
                      <span>Delivered</span>
                    </div>
                    <div className="h-px flex-1 mx-2 bg-border" />
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className={`w-4 h-4 ${tx.buyer_confirmed ? "text-green-500" : ""}`} />
                      <span>Confirmed</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TransactionList;
