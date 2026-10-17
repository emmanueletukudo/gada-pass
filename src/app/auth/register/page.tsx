import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#ff765f] px-3">
      <div className="w-full max-w-md rounded-3xl bg-[#fffef9] p-8 md:p-10">
       <Logo/>
        <h2 className="display mt-5 text-5xl font-bold tracking-[-0.07em]">
          Make room
          <br />
          for more<span className="text-[#ff765f]">.</span>
        </h2>
        <p className="mt-3 mb-8 text-sm text-[#6d766d]">
          Create your free Gada Pass account.
        </p>
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-[#6d766d]">
          Already have an account?{" "}
          <Link className="font-bold text-[#17211b]" href="/auth/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
