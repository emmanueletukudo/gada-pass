import { useState, useRef, useEffect, useMemo } from 'react';

export type BankOption = {
  bank: string;
  code: string;
};

type BankSelectProps = {
  banks: BankOption[];
  value: string;
  onChange: (code: string) => void;
  isLoading?: boolean;
  error?: string;
};

const POPULAR_BANK_CODES = [
  '044',
  '058',
  '057', 
  '011', 
  '033',
  '50515',
  '100004',
  '50211',
];

export function BankSelect({
  banks,
  value,
  onChange,
  isLoading = false,
  error,
}: BankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedBank = useMemo(
    () => banks.find((b) => b.code === value),
    [banks, value],
  );

  const { popular, others } = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = banks.filter((bank) =>
      bank.bank.toLowerCase().includes(term),
    );

    const pop: BankOption[] = [];
    const oth: BankOption[] = [];

    filtered.forEach((bank) => {
      if (POPULAR_BANK_CODES.includes(bank.code)) {
        pop.push(bank);
      } else {
        oth.push(bank);
      }
    });

    oth.sort((a, b) => a.bank.localeCompare(b.bank));
    return { popular: pop, others: oth };
  }, [banks, searchTerm]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border text-left text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'text-gray-900'}`}
      >
        <span className="truncate">
          {isLoading
            ? 'Loading banks...'
            : selectedBank
              ? selectedBank.bank
              : 'Select a bank...'}
        </span>

        <div className="ml-2 flex items-center shrink-0">
          {isLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
          ) : (
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bank name..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900 placeholder-gray-400"
              />
              <svg
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {popular.length === 0 && others.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No banks found matching "{searchTerm}"
              </div>
            ) : (
              <>
                {popular.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase bg-gray-50/50">
                      Popular Banks
                    </div>
                    {popular.map((bank, index) => (
                      <button
                        key={`pop-${bank.code}-${index}`}
                        type="button"
                        onClick={() => handleSelect(bank.code)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-black hover:text-white transition-colors ${
                          value === bank.code
                            ? 'bg-indigo-50 font-medium text-black'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="truncate">{bank.bank}</span>
                        {value === bank.code && (
                          <svg
                            className="h-4 w-4 text-black shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {others.length > 0 && (
                  <div className="py-1">
                    {popular.length > 0 && (
                      <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase bg-gray-50/50">
                        All Banks
                      </div>
                    )}
                    {others.map((bank, index) => (
                      <button
                        key={`other-${bank.code}-${index}`}
                        type="button"
                        onClick={() => handleSelect(bank.code)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-black hover:text-white transition-colors ${
                          value === bank.code
                            ? 'bg-gray-200 font-medium text-black'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="truncate">{bank.bank}</span>
                        {value === bank.code && (
                          <svg
                            className={`h-4 w-4 text-black hover:text-white shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
