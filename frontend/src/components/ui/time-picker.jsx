import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';

const TimePicker = ({ value = '09:00', onChange, className, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState('AM');

  // Parse the initial value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const hour24 = parseInt(hours);
      const minute = parseInt(minutes);
      
      setSelectedMinute(minute);
      if (hour24 === 0) {
        setSelectedHour(12);
        setSelectedAmPm('AM');
      } else if (hour24 < 12) {
        setSelectedHour(hour24);
        setSelectedAmPm('AM');
      } else if (hour24 === 12) {
        setSelectedHour(12);
        setSelectedAmPm('PM');
      } else {
        setSelectedHour(hour24 - 12);
        setSelectedAmPm('PM');
      }
    }
  }, [value]);

  const formatTime = (hour, minute, ampm) => {
    const displayHour = hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const convertTo24Hour = (hour, ampm) => {
    if (ampm === 'AM') {
      return hour === 12 ? 0 : hour;
    } else {
      return hour === 12 ? 12 : hour + 12;
    }
  };

  const handleTimeChange = (newHour, newMinute, newAmPm) => {
    const hour24 = convertTo24Hour(newHour, newAmPm);
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
    onChange?.(timeString);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className={cn("relative", className)} {...props}>
      <input
        type="text"
        readOnly
        value={formatTime(selectedHour, selectedMinute, selectedAmPm)}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      />
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[300px] max-w-[350px] bg-white border border-gray-200 rounded-lg shadow-xl">
            <div className="p-3">
              <div className="grid grid-cols-3 gap-3">
              {/* Hours */}
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-700 mb-2">Hour</div>
                <div className="h-32 overflow-y-auto border border-gray-300 rounded-md bg-white">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-sm border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors",
                        selectedHour === hour ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"
                      )}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Minutes */}
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-700 mb-2">Minute</div>
                <div className="h-32 overflow-y-auto border border-gray-300 rounded-md bg-white">
                  {minutes.filter(m => m % 5 === 0).map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-sm border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors",
                        selectedMinute === minute ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"
                      )}
                      onClick={() => setSelectedMinute(minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* AM/PM */}
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-700 mb-2">Period</div>
                <div className="h-32 flex flex-col justify-center space-y-3">
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-3 text-sm rounded-md border-2 font-medium transition-all",
                      selectedAmPm === 'AM' 
                        ? "bg-blue-500 text-white border-blue-500 shadow-md" 
                        : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                    )}
                    onClick={() => setSelectedAmPm('AM')}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-3 text-sm rounded-md border-2 font-medium transition-all",
                      selectedAmPm === 'PM' 
                        ? "bg-blue-500 text-white border-blue-500 shadow-md" 
                        : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                    )}
                    onClick={() => setSelectedAmPm('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => handleTimeChange(selectedHour, selectedMinute, selectedAmPm)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export { TimePicker };