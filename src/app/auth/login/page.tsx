import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#d6f94a] px-5">
      <div className="w-full max-w-md rounded-3xl bg-[#fffef9] p-8 md:p-10">
        <Logo/>
        <h1 className="display mt-12 text-5xl font-bold tracking-[-0.07em]">
          Welcome back<span className="text-[#ff765f]">.</span>
        </h1>
        <p className="mt-3 mb-8 text-sm text-[#6d766d]">
          Your next moment is waiting.
        </p>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-[#6d766d]">
          New here?{" "}
          <Link className="font-bold text-[#17211b]" href="/auth/register">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
