import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  selectedAge: number | null;
  onChange: (age: number) => void;
  autoNavigate?: boolean;
}

const AgeFilter: React.FC<Props> = ({ selectedAge, onChange, autoNavigate = false }) => {
  const navigate = useNavigate();
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange(value);
  };

  const handleApply = () => {
    if (autoNavigate && selectedAge !== null) {
      navigate(`/shop?ageMonths=${selectedAge}`);
    }
  };

  const formatAge = (months: number | null) => {
    if (months === null) return 'Any Age';
    if (months === 0) return '0 Months (Newborn)';
    if (months < 12) return `${months} Month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) return `${years} Year${years > 1 ? 's' : ''}`;
    return `${years} Year${years > 1 ? 's' : ''} ${remMonths} Month${remMonths > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col gap-2 mb-4">
        <label htmlFor="age-slider" className="font-bold text-gray-800 text-base leading-tight">
          Select Child's Age
        </label>
        <div>
          <span className="inline-block bg-secondary text-primary-dark font-extrabold px-3.5 py-1 rounded-full text-xs whitespace-nowrap shadow-sm">
            {formatAge(selectedAge)}
          </span>
        </div>
      </div>
      <input
        id="age-slider"
        type="range"
        min="0"
        max="84"
        value={selectedAge || 0}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-dark"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
        <span>Newborn</span>
        <span>7 Years</span>
      </div>
      {autoNavigate && (
        <button 
          onClick={handleApply}
          className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-colors"
        >
          Find Suitable Materials
        </button>
      )}
    </div>
  );
};

export default AgeFilter;
