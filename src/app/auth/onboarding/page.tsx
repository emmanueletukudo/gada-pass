import { Logo } from '@/components/logo';
import OnboardingForm from '@/components/onboarding-form';

export default function Onboarding() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#ff765f] px-3">
      <div className="w-full max-w-md rounded-3xl bg-[#fffef9] p-8 md:p-10">
        <Logo />
        <h2 className="display mt-5 text-4xl font-bold tracking-[-0.07em]">
          Complete Your Profile
        </h2>
        <p className="mt-1 mb-4 text-xs text-[#6d766d]">
          Please provide a few more details to set up your Gada account.
        </p>
        <OnboardingForm/>
      </div>
    </main>
  );
}
