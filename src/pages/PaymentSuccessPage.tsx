import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      toast.error('Invalid payment session');
      navigate('/pricing');
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setVerifying(true);
      const result = await paymentService.verifyPayment(sessionId);
      
      setVerified(result.verified);
      setPaymentDetails(result);

      if (result.verified) {
        toast.success('Payment successful! Credits added to your account.');
        await refreshProfile();
      } else {
        toast.error('Payment not completed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify payment');
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle>Verifying Payment</CardTitle>
            <CardDescription>Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verified ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle>
            {verified ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {verified
              ? 'Your credits have been added to your account'
              : 'There was an issue processing your payment'}
          </CardDescription>
        </CardHeader>
        
        {verified && paymentDetails && (
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">
                  ${(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-green-500">Completed</span>
              </div>
              {paymentDetails.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold text-sm">{paymentDetails.customerEmail}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Credits added to your account!</span>
            </div>
          </CardContent>
        )}
        
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => navigate('/')}
          >
            Start Creating
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/orders')}
          >
            View Order History
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
