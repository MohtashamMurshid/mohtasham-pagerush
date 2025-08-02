"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b min">
      <a className="flex items-center justify-center" href="#">
        <span className="sr-only">PageRush</span>
        <h1 className="text-2xl font-bold text-primary">PageRush</h1>
      </a>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Button variant="ghost" asChild>
          <a href="#features">Features</a>
        </Button>
        <Button variant="ghost" asChild>
          <a href="#">Pricing</a>
        </Button>
        <Button asChild>
          <a href="#">Login</a>
        </Button>
      </nav>
    </header>
  );
}
