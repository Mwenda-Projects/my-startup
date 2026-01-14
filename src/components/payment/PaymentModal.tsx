import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Shield, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingType: "item" | "service";
  listingTitle: string;
  amount: number;
  sellerId: string;
  sellerName?: string;
  onSuccess?: () => void;
}

const PaymentModal = ({
  isOpen,
  onClose,
  listingId,
  listingType,
  listingTitle,
  amount,
  sellerId,
  sellerName,
  onSuccess
}: PaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "waiting" | "success">("input");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const platformFee = Math.ceil(amount * 0.1); // 10% default, will be calculated server-side
  const total = amount;

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStep("processing");

    try {
      // Create transaction
      const { data: txData, error: txError } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "create_transaction",
          listing_id: listingId,
          listing_type: listingType,
          amount,
          seller_id: sellerId
        }
      });

      if (txError || txData?.error) {
        throw new Error(txData?.error || txError?.message || "Failed to create transaction");
      }

      const transactionId = txData.transaction.id;

      // Initiate M-Pesa STK Push
      const { data: stkData, error: stkError } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone_number: phoneNumber,
          amount: total,
          transaction_id: transactionId
        }
      });

      if (stkError || stkData?.error) {
        throw new Error(stkData?.error || stkError?.message || "Failed to initiate payment");
      }

      setStep("waiting");
      
      toast({
        title: "Check your phone",
        description: "Enter your M-Pesa PIN to complete the payment"
      });

      // Poll for payment status (in production, use realtime subscription)
      const checkPayment = async () => {
        const { data: tx } = await supabase
          .from("transactions")
          .select("status, mpesa_receipt_number")
          .eq("id", transactionId)
          .single();

        if (tx?.status === "paid_escrow") {
          setStep("success");
          toast({
            title: "Payment successful!",
            description: "Your payment is held in escrow until delivery is confirmed"
          });
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
          return true;
        }
        return false;
      };

      // Poll every 3 seconds for 2 minutes
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const success = await checkPayment();
        if (success || attempts >= 40) {
          clearInterval(pollInterval);
          if (!success && attempts >= 40) {
            setStep("input");
            toast({
              title: "Payment timeout",
              description: "We couldn't confirm your payment. Please try again.",
              variant: "destructive"
            });
          }
        }
      }, 3000);

    } catch (error: unknown) {
      console.error("Payment error:", error);
      setStep("input");
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneDisplay = (value: string) => {
    // Remove non-numeric characters
    return value.replace(/\D/g, "");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && step !== "processing" && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "success" ? "Payment Successful!" : "Complete Payment"}
          </DialogTitle>
          <DialogDescription>
            {step === "success" 
              ? "Your money is safely held in escrow"
              : `Pay for "${listingTitle}"`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "success" ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">KSh {total.toLocaleString()} paid</p>
              <p className="text-sm text-muted-foreground mt-2">
                Funds will be released to seller after you confirm delivery
              </p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Item/Service</span>
                  <span className="font-medium">KSh {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Seller</span>
                  <span>{sellerName || "Campus Seller"}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Escrow Notice */}
              <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Protected by Escrow</p>
                  <p className="text-muted-foreground">
                    Your payment is held safely until you confirm delivery
                  </p>
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneDisplay(e.target.value))}
                    className="pl-10"
                    disabled={step !== "input"}
                    maxLength={12}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive an M-Pesa prompt on this number
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={step === "processing" || step === "waiting"}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={step !== "input" || !phoneNumber}
                  className="flex-1"
                >
                  {step === "processing" || step === "waiting" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {step === "waiting" ? "Waiting..." : "Processing..."}
                    </>
                  ) : (
                    `Pay KSh ${total.toLocaleString()}`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
