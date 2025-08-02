"use client";

import React from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { features } from "../data";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  const handleSignUpRedirect = () => {
    router.push("/signin");
  };

  return (
    <div className="flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 min-h-screen flex flex-col">
        <section className="flex-1 flex items-center justify-center w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Supercharge Your Studying
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                PageRush uses AI to create study materials from your documents.
                Upload a PDF and get started.
              </p>

              <AuthLoading>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              </AuthLoading>

              <Unauthenticated>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSignUpRedirect}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => router.push("/signin")}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Sign In
                  </button>
                </div>
              </Unauthenticated>

              <Authenticated>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-lg text-primary font-medium">
                    Welcome back! 👋
                  </p>
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </Authenticated>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted flex-1 flex items-center"
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6 w-full">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything you need to succeed
                </h2>

                <Unauthenticated>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    From PDF processing to AI-powered quizzes, we&apos;ve got
                    you covered.
                  </p>
                </Unauthenticated>

                <Authenticated>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    You&apos;re all set! Access all these features from your
                    dashboard.
                  </p>
                </Authenticated>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-start space-y-2 rounded-lg border bg-card p-4 text-card-foreground"
                >
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <Authenticated>
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Start Using These Features →
                </button>
              </div>
            </Authenticated>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
