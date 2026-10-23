import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "../server/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="secondary" block>
        <LogOut aria-hidden className="size-5" />
        Se déconnecter
      </Button>
    </form>
  );
}
