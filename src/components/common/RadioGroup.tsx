interface RadioOption {
  id: number | string;
  text: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: number | string | null;
  onChange: (id: number | string) => void;
  disabled: boolean;
  className?: string;
  direction?: 'col' | 'row';
}

export default function RadioGroup({ 
  name, 
  options, 
  selectedValue, 
  onChange, 
  disabled, 
  className = '', 
  direction = 'col' 
}: RadioGroupProps) {
  return (
    <div className={`flex ${direction === 'col' ? 'flex-col space-y-2' : 'flex-row space-x-2'} text-gray-700 ${className}`}>
      {options.map(opt => (
        <label 
          key={opt.id} 
          className={`flex items-start space-x-2 p-2 rounded border transition-colors
            ${selectedValue === opt.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'border-transparent'} 
            ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-50'}`}
        >
          <input 
            type="radio" 
            name={name}
            className="mt-1 w-4 h-4 text-blue-600 shrink-0"
            disabled={disabled}
            checked={selectedValue === opt.id}
            onChange={() => onChange(opt.id)}
          />
          <span className="leading-snug">{opt.text}</span>
        </label>
      ))}
    </div>
  );
}
