import { FC } from "react";

type EventCategoryProps = {
  category: string;
  setCategory: (val: string) => void;
  currentCategory: string;
};

export const EventCategory: FC<EventCategoryProps> = ({
  category,
  setCategory,
  currentCategory,
}) => {
  return (
    <button
      key={category}
      onClick={() => setCategory(category)}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${currentCategory === category ? "border-[#17211b] bg-[#17211b] text-white" : "border-[#dce1d5] hover:border-[#17211b]"}`}
    >
      {category}
    </button>
  );
};
