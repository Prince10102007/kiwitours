/**
 * Quick reply buttons for flow-based navigation.
 */
export function FlowOptions({ options, onSelect, disabled }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-4">
      {options.map((option, index) => {
        const isCustomTrip = option.value === 'custom';

        return (
          <button
            key={`${option.value}-${index}`}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-all duration-200 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              ${disabled ? '' : 'hover:shadow-md hover:-translate-y-0.5'}
              ${isCustomTrip
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 hover:from-orange-600 hover:to-amber-600 focus:ring-orange-500 shadow-md shadow-orange-200'
                : 'border-2 border-teal-500 text-teal-700 hover:bg-teal-500 hover:text-white focus:ring-teal-500'
              }
            `}
          >
            {isCustomTrip && <span className="mr-1.5">✈️</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
