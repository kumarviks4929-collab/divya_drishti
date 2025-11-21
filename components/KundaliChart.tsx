import React from 'react';

interface KundaliChartProps {
  data: { [key: number]: string[] }; // House number to planets
}

const KundaliChart: React.FC<KundaliChartProps> = ({ data }) => {
  // North Indian Diamond Chart Layout Coordinates (Approximate for SVG)
  // The chart is a square divided by diagonals.
  // House 1 is top center diamond. House 4 is right, 7 is bottom, 10 is left.
  // Others are triangles.

  const renderHouseContent = (houseNum: number, x: number, y: number) => {
    const planets = data[houseNum] || [];
    return (
      <text x={x} y={y} textAnchor="middle" className="text-[10px] fill-amber-300 font-semibold">
        <tspan x={x} dy="-0.5em" className="fill-slate-500 text-[8px]">{houseNum}</tspan>
        {planets.map((p, i) => (
          <tspan x={x} dy="1.2em" key={i}>{p.substring(0, 2)}</tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="aspect-square w-full max-w-md mx-auto bg-slate-950 border-2 border-amber-600/50 rounded-lg p-1 shadow-inner shadow-amber-900/20">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Outer Box */}
        <rect x="2" y="2" width="396" height="396" fill="none" stroke="#d97706" strokeWidth="2" />
        
        {/* Diagonals */}
        <line x1="0" y1="0" x2="400" y2="400" stroke="#d97706" strokeWidth="1.5" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="#d97706" strokeWidth="1.5" />
        
        {/* Inner Diamonds */}
        <line x1="0" y1="200" x2="200" y2="0" stroke="#d97706" strokeWidth="1.5" />
        <line x1="200" y1="0" x2="400" y2="200" stroke="#d97706" strokeWidth="1.5" />
        <line x1="400" y1="200" x2="200" y2="400" stroke="#d97706" strokeWidth="1.5" />
        <line x1="200" y1="400" x2="0" y2="200" stroke="#d97706" strokeWidth="1.5" />

        {/* House Content Placement (North Indian Style) */}
        {/* 1st House (Lagna) - Top Center */}
        {renderHouseContent(1, 200, 100)}
        
        {/* 2nd House - Top Left Triangle */}
        {renderHouseContent(2, 100, 40)}
        
        {/* 3rd House - Top Left Corner */}
        {renderHouseContent(3, 60, 80)}
        
        {/* 4th House - Left Center */}
        {renderHouseContent(4, 100, 200)}
        
        {/* 5th House - Bottom Left Corner */}
        {renderHouseContent(5, 60, 320)}
        
        {/* 6th House - Bottom Left Triangle */}
        {renderHouseContent(6, 100, 360)}
        
        {/* 7th House - Bottom Center */}
        {renderHouseContent(7, 200, 300)}
        
        {/* 8th House - Bottom Right Triangle */}
        {renderHouseContent(8, 300, 360)}
        
        {/* 9th House - Bottom Right Corner */}
        {renderHouseContent(9, 340, 320)}
        
        {/* 10th House - Right Center */}
        {renderHouseContent(10, 300, 200)}
        
        {/* 11th House - Top Right Corner */}
        {renderHouseContent(11, 340, 80)}
        
        {/* 12th House - Top Right Triangle */}
        {renderHouseContent(12, 300, 40)}

      </svg>
    </div>
  );
};

export default KundaliChart;
