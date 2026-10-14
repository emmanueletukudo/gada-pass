import { Asterisk } from 'lucide-react';
import { useState } from 'react';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { StateSelect, CitySelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import { EventCategory } from '@/lib/event';

type GadaInputProps<T extends FieldValues> = {
  error?: string;
  register: UseFormRegister<T>;
  placeHolder?: string;
  name: Path<T>;
  type: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  styles?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
const inputClass =
  'w-full rounded-xl border border-[#dce1d5] bg-[#fffef9] px-4 py-3 outline-none';
export const selectClass =
  `${inputClass} h-[50px] appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] ` +
  'bg-[length:12px_12px] bg-[right_10px_center] bg-no-repeat';

export const WithLabelRequired = ({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) => {
  return (
    <>
      {label && (
        <label className="text-sm text-[#5a5a5a] my-1.5 flex flex-row justify-start items-start">
          {required && <Asterisk size={14} className="text-[#c34837]" />}{' '}
          {label}
        </label>
      )}
    </>
  );
};

export function GadaInput<T extends FieldValues>({
  error,
  type,
  label,
  required = false,
  placeHolder,
  name,
  register,
  styles,
  disabled = false,
}: GadaInputProps<T>) {
  return (
    <div>
      {label && <WithLabelRequired label={label} required={required} />}
      <input
        {...register(name)}
        placeholder={placeHolder}
        className={`${inputClass} ${styles ? styles : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-300/40' : ''}`}
        type={type}
        disabled={disabled}
      />
      {error && <p className="mt-1 text-xs text-[#c34837]">{error}</p>}
    </div>
  );
}

interface GadaTextAreaProps<T extends FieldValues> extends Omit<
  GadaInputProps<T>,
  'type'
> {
  rows: number;
}

export function GadaTextArea<T extends GadaInputProps<T>>({
  register,
  error,
  placeHolder,
  required = false,
  label,
  name,
  rows,
}: GadaTextAreaProps<T>) {
  return (
    <div>
      {label && <WithLabelRequired label={label} required={required} />}
      <textarea
        {...register(name)}
        placeholder={placeHolder}
        rows={rows}
        className={inputClass}
      />
      {error && <p className="mt-1 text-xs text-[#c34837]">{error}</p>}
    </div>
  );
}

export interface GadaSelectItem {
  id: string | number;
  label?: string;
  name?: string;
}

export interface GadaSelectInputProps<T extends FieldValues> {
  items: GadaSelectItem[];
  name: Path<T>;
  className?: string;
  register?: UseFormRegister<T>;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  label?: string;
  required?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function GadaSelect<T extends FieldValues>({
  items,
  name,
  className = selectClass,
  register,
  value,
  onChange,
  error,
  label,
  required,
  loading = false,
  placeholder,
}: GadaSelectInputProps<T>) {
  const defaultPlaceholder = loading ? 'Loading...' : 'Select a value';
  const selectProps = register ? register(name) : { name, value, onChange };

  return (
    <div>
      {label && <WithLabelRequired label={label} required={required} />}
      <div className="relative">
        <select {...selectProps} className={className} disabled={loading}>
          <option value="" disabled hidden>
            {placeholder || defaultPlaceholder}
          </option>
          {!loading &&
            items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label || item.name}
              </option>
            ))}
        </select>

        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full text-gray-400" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[#c34837]">{error}</p>}
    </div>
  );
}

export interface CityOption {
  id: number;
  name: string;
  latitude?: string;
  longitude?: string;
  state_id?: number;
}

interface GadaCitySelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  countryId?: number;
  error?: string;
}

export function GadaCitySelect<TFieldValues extends FieldValues>({
  control,
  name,
  countryId = 161,
  error,
}: GadaCitySelectProps<TFieldValues>) {
  const [selectedState, setSelectedState] = useState<any>({
    id: 293,
    name: 'Abuja Federal Capital Territory',
  });

  const selectContainerClass =
    `w-full rounded-md border ${
      error ? 'border-red-500' : 'border-gray-300'
    } bg-white text-sm shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ` +
    `[&_input]:border-none [&_input]:outline-none [&_input]:focus:ring-0 ` +
    `[&_select]:border-none [&_select]:outline-none [&_select]:focus:ring-0 ` +
    `[&_.std-input]:border-none [&_.std-select]:border-none`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <WithLabelRequired label="State" required />
        <div className={''}>
          <StateSelect
            countryid={countryId}
            containerClassName="w-full border-none p-0"
            inputClassName="w-full border-none focus:outline-none focus:ring-0"
            defaultValue={selectedState}
            onChange={(st: any) => setSelectedState(st)}
            placeHolder="Select State"
          />
        </div>
      </div>

      <div>
        <WithLabelRequired label="City" required />
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className={''}>
              <CitySelect
                countryid={countryId}
                stateid={selectedState?.id}
                containerClassName="w-full border-none p-0"
                inputClassName="w-full border-none focus:outline-none focus:ring-0"
                defaultValue={field.value}
                onChange={
                  ((city: any) => {
                    const cityName =
                      typeof city === 'string' ? city : city?.name;
                    field.onChange(cityName);
                  }) as any
                }
                placeHolder="Select City"
              />
            </div>
          )}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
