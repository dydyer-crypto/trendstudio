import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Check, Sparkles, Zap } from 'lucide-react';
import type { Product } from '@/types';

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!user) {
      toast.error('Please login to purchase credits');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      setPurchasingId(product.id);
      
      const { url } = await paymentService.createCheckout([
        {
          name: `${product.credits} AI Credits`,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        }
      ]);

      window.open(url, '_blank');
      toast.success('Redirecting to checkout...');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout');
    } finally {
      setPurchasingId(null);
    }
  };

  const features = [
    'Generate AI videos up to 4 minutes',
    'Create stunning AI images',
    'AI-powered chat assistant',
    'Script to video conversion',
    'High-resolution outputs',
    'Priority processing'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 xl:py-12">
        <div className="text-center mb-8 xl:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 h-6 xl:h-8 xl:w-8 text-primary" />
            <h1 className="text-3xl xl:text-4xl font-bold gradient-text">Choose Your Plan</h1>
          </div>
          <p className="text-base xl:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI credits to power your content creation. No subscriptions, pay only for what you need.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="relative">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-24 mb-4 bg-muted" />
                  <Skeleton className="h-20 w-full bg-muted" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full bg-muted" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className={`relative transition-all hover:shadow-xl ${
                  index === 2 ? 'border-primary shadow-lg sm:scale-105' : ''
                }`}
              >
                {index === 2 && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Best Value
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
                    <Zap className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-xs xl:text-sm">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl xl:text-4xl font-bold">${product.price}</span>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm xl:text-base">
                    <Sparkles className="h-4 w-4" />
                    <span>{product.credits} Credits</span>
                  </div>
                  <div className="space-y-2 pt-4">
                    {features.slice(0, 4).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs xl:text-sm">
                        <Check className="h-3 w-3 xl:h-4 xl:w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(product)}
                    disabled={purchasingId === product.id}
                    variant={index === 2 ? 'default' : 'outline'}
                  >
                    {purchasingId === product.id ? 'Processing...' : 'Purchase Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 xl:mt-16 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg xl:text-xl">What are AI Credits?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm xl:text-base text-muted-foreground">
                AI Credits are used to power all AI features in VIRALIX. Each generation consumes credits based on complexity:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm xl:text-base">
                  <Check className="h-4 w-4 xl:h-5 xl:w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>AI Video:</strong> 10-50 credits per video (depending on duration)</span>
                </li>
                <li className="flex items-start gap-2 text-sm xl:text-base">
                  <Check className="h-4 w-4 xl:h-5 xl:w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>AI Image:</strong> 5-10 credits per image</span>
                </li>
                <li className="flex items-start gap-2 text-sm xl:text-base">
                  <Check className="h-4 w-4 xl:h-5 xl:w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>AI Chat:</strong> 1-2 credits per conversation</span>
                </li>
              </ul>
              <p className="text-xs xl:text-sm text-muted-foreground pt-4">
                Credits never expire and can be used anytime. Get started with 100 free credits when you sign up!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
