import { main } from "framer-motion/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

type EventArchiveLayout = {
    children: React.ReactNode
}

export default function EventArchiveLayout ({children} : EventArchiveLayout) {
    return (
      <div className="py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Archive</h2>
            <p className="text-sm text-[#6d766d]">
              Past events and audit logs
            </p>
          </div>
          <Link
            href="/dashboard/organizer/events"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce1d5] bg-[#fffef9] px-4 py-2 text-xs font-bold text-[#6d766d] transition-all hover:border-[#17211b] hover:text-[#17211b]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-md">Back to Events</span>
          </Link>
        </div>
        <main>{children}</main>
      </div>
    );
}