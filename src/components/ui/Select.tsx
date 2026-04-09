import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
}

export function Select({
  id,
  name,
  value,
  defaultValue,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  fullWidth = true,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState<string>(value || defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    setInternalValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const selectedOption = options.find((opt) => opt.value === internalValue);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}
    >
      {/* Hidden input for standard form submission */}
      <input type="hidden" id={id} name={name || id} value={internalValue} />
      
      <div
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={internalValue ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.length === 0 ? (
            <div className={styles.noOptions}>No options</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`${styles.option} ${internalValue === option.value ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {internalValue === option.value && <Check size={16} className={styles.checkIcon} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
