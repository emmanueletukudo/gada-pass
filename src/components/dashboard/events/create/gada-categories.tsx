import { GadaSelect } from '@/components/common/gada-inputs';
import { Controller, UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './schema';
import { useEventCategories } from '@/lib/hooks-new/useEvents';

type GadaCategoriesProps = {
  form: UseFormReturn<EventFormValues>;
};

export const GadaCategories = ({ form }: GadaCategoriesProps) => {
  const {
    control,
    formState: { errors },
  } = form;

  const { data: categories = [], isLoading } = useEventCategories();

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
