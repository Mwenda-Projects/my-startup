import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Phone, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhoneVerificationProps {
  phoneNumber?: string | null;
  phoneVerified?: boolean;
  onVerified?: () => void;
}

const PhoneVerification = ({ phoneNumber, phoneVerified, onVerified }: PhoneVerificationProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState(phoneNumber || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please login first", variant: "destructive" });
        return;
      }

      const response = await supabase.functions.invoke("send-verification-sms", {
        body: { phone_number: phone },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Code sent!",
        description: "Check your phone for the verification code",
      });
      setStep("code");
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("verify-phone-code", {
        body: { code, phone_number: phone },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Phone verified!",
        description: "Your phone number has been verified successfully",
      });
      setOpen(false);
      onVerified?.();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (phoneVerified) {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Phone Verified
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Phone className="w-4 h-4" />
          Verify Phone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Phone Number</DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Enter your phone number to receive a verification code"
              : "Enter the 6-digit code sent to your phone"}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +254 for Kenya)
              </p>
            </div>
            <Button onClick={handleSendCode} className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleVerifyCode} className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify Code
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("phone");
                setCode("");
              }}
            >
              Change phone number
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerification;
