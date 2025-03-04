
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Header />
          </Link>
        </div>

        <div className="flex justify-center items-center flex-grow my-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Log in to Claro</CardTitle>
              <CardDescription className="text-center">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/auth/reset-password"
                      className="text-sm text-indigo-500 hover:text-indigo-600"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Google
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <span className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-indigo-500 hover:text-indigo-600">
                  Sign up
                </Link>
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
