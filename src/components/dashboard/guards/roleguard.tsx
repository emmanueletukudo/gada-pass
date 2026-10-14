import { getDashboardPathForRole } from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { UserRole } from "@/types/next-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: FC<RoleGuardProps> = ({allowedRoles, children}) => {
    const {user, isAuthenticated, isLoading} = useCurrentUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/auth/login")
            }else if(user && !allowedRoles.includes(user.role as UserRole)) {
                const redirectPath = getDashboardPathForRole(user.role as UserRole)
                router.push(redirectPath);
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router])

     if (isLoading) {
       return (
         <div className="flex min-h-screen flex-col items-center justify-center space-y-3 bg-black text-white">
           <Loader2 className="h-8 w-8 animate-spin text-white" />
           <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
             Verifying Permissions...
           </p>
         </div>
       );
     }

      if (!user || !allowedRoles.includes(user.role as UserRole)) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
            <div className="max-w-sm space-y-4 rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
              <h2 className="text-base font-extrabold">Access Unauthorized</h2>
              <p className="text-xs text-neutral-400">
                Your account does not have permission to access this area.
                Redirecting to your assigned dashboard...
              </p>
            </div>
          </div>
        );
      }

    return <>{children}</>;

}