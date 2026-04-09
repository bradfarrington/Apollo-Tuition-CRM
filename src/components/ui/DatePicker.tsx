import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select date...',
  className = '',
  fullWidth = true,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState<string>(value || defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  
  // View states for calendar
  const initialDate = internalValue ? new Date(internalValue) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      if (value) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          setCurrentMonth(d.getMonth());
          setCurrentYear(d.getFullYear());
        }
      }
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    
    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }
    
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = internalValue === dateString;
      
      const isToday = (() => {
        const today = new Date();
        return today.getFullYear() === currentYear && 
               today.getMonth() === currentMonth && 
               today.getDate() === d;
      })();

      days.push(
        <div
          key={d}
          className={`${styles.day} ${isSelected ? styles.selectedDay : ''} ${isToday && !isSelected ? styles.todayDay : ''}`}
          onClick={() => {
            setInternalValue(dateString);
            setIsOpen(false);
            if (onChange) onChange(dateString);
          }}
        >
          {d}
        </div>
      );
    }
    
    return days;
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const displayValue = internalValue ? (() => {
    const d = new Date(internalValue);
    return !isNaN(d.getTime()) ? d.toLocaleDateString() : internalValue;
  })() : placeholder;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}
    >
      {/* Hidden input for form submission */}
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
        <div className={styles.displayArea}>
          <CalendarIcon size={18} className={styles.calendarIcon} />
          <span className={internalValue ? styles.value : styles.placeholder}>
            {displayValue}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navButton}
              onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
            >
              <ChevronLeft size={16} />
            </button>
            <div className={styles.currentMonthYear}>
              {MONTHS[currentMonth]} {currentYear}
            </div>
            <button
              type="button"
              className={styles.navButton}
              onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className={styles.daysOfWeek}>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className={styles.dayOfWeek}>{day}</div>
            ))}
          </div>
          
          <div className={styles.daysGrid}>
            {generateDays()}
          </div>
        </div>
      )}
    </div>
  );
}
