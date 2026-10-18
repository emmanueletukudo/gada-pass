import EmbedGenerator from "@/components/dashboard/organizer/embed-generator";
import { use } from "react";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function Embed({ params }: PageProps) {
    const {eventId} = use(params)

    return (
        <EmbedGenerator eventId={eventId}/>
    )
}