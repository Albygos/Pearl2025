'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUnitByCredential } from '@/lib/services/units';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

function LoginPageContent() {
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!credentialId) {
      toast({
        title: 'Credential ID Required',
        description: 'Please enter your credential ID to sign in.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const unit = await getUnitByCredential(credentialId.trim());
      if (unit) {
        localStorage.setItem('artfestlive_unit_id', unit.id);
        const returnTo = searchParams.get('returnTo');
        router.push(returnTo || '/dashboard');
      } else {
        toast({
          title: 'Sign-in Failed',
          description: 'Invalid Credential ID. Please check and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Sign-in Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 bg-accent/50">
      <Card className="mx-auto max-w-sm w-full shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Megala Sign-in</CardTitle>
          <CardDescription>
            Enter your credential to access your megala's dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input
                id="credentialId"
                type="text"
                placeholder="Enter your unique ID"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                required
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>
            <Button onClick={handleSignIn} disabled={loading} className="w-full mt-2">
              {loading && <Loader className="animate-spin mr-2" />}
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
