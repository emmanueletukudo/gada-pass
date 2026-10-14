import { GadaSelect } from '@/components/common/gada-inputs';
import { EventCategory, getEventCategories } from '@/lib/event';
import { useEffect, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './schema';

type GadaCategoriesProps = {
  form: UseFormReturn<EventFormValues>;
};

export const GadaCategories = ({ form }: GadaCategoriesProps) => {
  const {
    control,
    formState: { errors },
  } = form;

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await getEventCategories();
        if (isMounted) {
          setCategories(res);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Controller
      name="categoryId"
      control={control}
      render={({ field }) => (
        <GadaSelect
          label="Category"
          name={field.name}
          value={field.value || ''}
          onChange={(val: any) => {
            const selectedVal = val?.target ? val.target.value : val;
            field.onChange(selectedVal);
          }}
          items={categories}
          required
          loading={isLoading}
          placeholder={
            isLoading ? 'Loading categories...' : 'Select a category'
          }
          error={errors.categoryId?.message}
        />
      )}
    />
  );
};
