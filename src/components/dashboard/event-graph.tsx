import { ArrowUpRight } from "lucide-react";
import { FC } from "react";

type EventGrapProps = {
    isGate: boolean
}

export const EventGraph: FC<EventGrapProps> = ({isGate}) => {
    return (
      <section className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
              {isGate ? 'Live check-ins' : 'Activity overview'}
            </p>
            <h2 className="display mt-2 text-2xl font-bold tracking-[-0.04em]">
              {isGate ? 'The Good Life Brunch' : 'A healthy rhythm'}
            </h2>
          </div>
          <span className=" flex flex-row text-sm font-bold text-[#ff765f]">Today <ArrowUpRight/></span>
        </div>
        <div className="flex h-48 items-end gap-2 border-b border-[#dce1d5] px-2">
          {[36, 54, 42, 71, 62, 85, 64, 92, 76, 100, 83, 91].map(
            (height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-sm bg-[#7ca9ff]"
                style={{
                  height: `${height}%`,
                  opacity: 0.35 + index / 20,
                }}
              />
            ),
          )}
        </div>
        <div className="mt-4 flex justify-between text-xs text-[#6d766d]">
          <span>8 AM</span>
          <span>12 PM</span>
          <span>4 PM</span>
          <span>8 PM</span>
        </div>
      </section>
    );
}