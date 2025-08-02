"use client";

import * as React from "react";
import {
  Brain,
  Focus,
  GraduationCap,
  Upload,
  BarChart3,
  Settings2,
  Timer,
  Zap,
} from "lucide-react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { studyNavData } from "@/data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Fetch current user data
  const user = useQuery(api.users.currentUser);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            PageRush
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <AuthLoading>
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </AuthLoading>

        <Unauthenticated>
          <div className="flex flex-col items-center justify-center p-4 space-y-3">
            <div className="text-sm text-muted-foreground text-center">
              Sign in to access your study materials
            </div>
            <Button asChild size="sm">
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </Unauthenticated>

        <Authenticated>
          <NavMain items={studyNavData.navMain} />
          <NavProjects projects={studyNavData.quickActions} />
        </Authenticated>
      </SidebarContent>

      <SidebarFooter>
        <AuthLoading>
          <div className="text-xs text-muted-foreground px-4">
            Loading user...
          </div>
        </AuthLoading>

        <Unauthenticated>
          <div className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Not signed in</div>
          </div>
        </Unauthenticated>

        <Authenticated>
          {user && (
            <NavUser
              user={{
                name: user.name as string,
                email: user.email as string,
                avatar: user.avatar as string,
              }}
            />
          )}
        </Authenticated>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
