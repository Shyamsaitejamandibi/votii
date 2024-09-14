import { LogOut } from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { Button } from "./ui/button";
import { UserButton } from "./user-button";

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <MaxWidthWrapper>
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            ThinkAbout
          </Link>

          <UserButton />
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
