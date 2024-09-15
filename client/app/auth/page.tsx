"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
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
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github")}
          >
            <GitHubLogoIcon className="w-5 h-5 mr-2" />
            Sign In with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
