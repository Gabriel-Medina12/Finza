import React from 'react';

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* La letra F estilizada en color verde esmeralda */}
      <path 
        d="M20 20H75V35H35V48H65V63H35V80H20V20Z" 
        fill="#10B981" 
      />
      {/* Barra pequeña horizontal en verde claro */}
      <rect 
        x="45" 
        y="70" 
        width="15" 
        height="10" 
        rx="3" 
        fill="#7BE0C5" 
      />
      {/* Barra vertical en verde esmeralda */}
      <rect 
        x="65" 
        y="55" 
        width="15" 
        height="25" 
        rx="4" 
        fill="#10B981" 
      />
    </svg>
  );
}
