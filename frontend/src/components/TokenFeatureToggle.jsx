import React from 'react';
import { Info } from 'lucide-react';

const TokenFeatureToggle = ({ 
  isChecked, 
  onChange, 
  label, 
  tooltipInfo, 
  disabled = false
}) => {
  return (
    <div className="bg-[#1D0F35] rounded-xl p-4 border border-purple-500/20 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-purple-200 font-medium">{label}</span>
        {tooltipInfo && (
          <div 
            className="group relative cursor-help"
            title={tooltipInfo}
          >
            <Info className="w-4 h-4 text-purple-400 opacity-70 hover:opacity-100" />
          </div>
        )}
      </div>
      
      <label className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className={`
          w-12 h-6 rounded-full relative
          ${disabled ? 'bg-purple-300/30' : 'bg-purple-500/30'}
          peer-focus:ring-2 peer-focus:ring-purple-300
          transition-all duration-300
          after:content-[''] after:absolute after:top-0.5 after:left-[2px]
          after:bg-white after:border after:border-purple-300/20
          after:rounded-full after:h-5 after:w-5 after:transition-all
          ${isChecked 
            ? 'peer-checked:after:translate-x-[100%] bg-green-500/80' 
            : 'bg-gray-500/30'
          }
        `}
        />
      </label>
    </div>
  );
};

export default TokenFeatureToggle;