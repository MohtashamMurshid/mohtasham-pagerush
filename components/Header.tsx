"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export function Header() {
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b min">
      <Link className="flex items-center justify-center" href="/">
        <span className="sr-only">PageRush</span>
        <h1 className="text-2xl font-bold text-primary">PageRush</h1>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Button variant="ghost" asChild>
          <a href="#features">Features</a>
        </Button>
        <Button variant="ghost" asChild>
          <a href="#">Pricing</a>
        </Button>

        <AuthLoading>
          <Button disabled variant="ghost">
            Loading...
          </Button>
        </AuthLoading>

        <Unauthenticated>
          <Button asChild>
            <Link href="/signin">Login</Link>
          </Button>
        </Unauthenticated>

        <Authenticated>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Authenticated>
      </nav>
    </header>
  );
}
