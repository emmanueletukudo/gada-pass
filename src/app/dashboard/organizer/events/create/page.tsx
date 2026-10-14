import CreateEventMultiStepPage from "@/components/dashboard/events/create";

export default function CreateEventPage() {
  return (
    <main className="min-h-screen px-5 py-2 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mt-2 rounded-3xl bg-[#fffef9] p-7 md:p-10">
          <h1 className="display mt-4 text-5xl font-bold leading-[0.9] tracking-[-0.07em]">
            Give it a beginning
          </h1>
          <p className="mt-4 text-sm text-[#6d766d]">
            Add a cover image, the event details, and every ticket tier you want
            to sell.
          </p>
          <CreateEventMultiStepPage />
        </div>
      </div>
    </main>
  );
}
