import { ApiEvent } from '@/lib/api';
import { FC } from 'react';
import { EventCategory } from './event-category';

type EventCategoriesProps = {
  categories: string[];
  setCategory: (cat: string) => void;
  currentCategory: string;
};
export const EventCategories: FC<EventCategoriesProps> = ({
  categories,
  setCategory,
  currentCategory,
}) => {
  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <EventCategory
          key={cat}
          category={cat}
          setCategory={setCategory}
          currentCategory={currentCategory}
        />
      ))}
    </div>
  );
};
