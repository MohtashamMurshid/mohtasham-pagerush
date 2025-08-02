"use client";
import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      await signIn("password", formData);
      // Redirect will happen via the useEffect above when isAuthenticated becomes true
    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        step === "signIn"
          ? "Invalid email or password. Please try again."
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">PageRush</h1>
          <h2 className="mt-6 text-2xl font-semibold text-foreground">
            {step === "signIn"
              ? "Sign in to your account"
              : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "signIn"
              ? "Welcome back! Please sign in to continue."
              : "Join PageRush to supercharge your studying."}
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg border shadow-sm">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <input name="flow" type="hidden" value={step} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  {step === "signIn" ? "Signing in..." : "Signing up..."}
                </div>
              ) : step === "signIn" ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setStep(step === "signIn" ? "signUp" : "signIn");
                setError(null); // Clear error when switching
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "signIn"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
