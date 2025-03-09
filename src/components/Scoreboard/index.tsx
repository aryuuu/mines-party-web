import "react";
import { PlayerScores, ScoreLog } from "../../types";

type ScoreboardProps = {
  playerScores: PlayerScores[];
};

// const roundToNiceNumber = (val: number) => {
//   if (val === 0) return 0;

//   const sign = val < 0 ? -1 : 1;
//   const absVal = Math.abs(val);
//   const magnitude = Math.pow(10, Math.floor(Math.log10(absVal)));
//   const normalized = absVal / magnitude;
//   const multiplier = Math.ceil(normalized / 10) * 10;

//   return sign * multiplier * magnitude;

// }

const Scoreboard = (props: ScoreboardProps) => {
  const { playerScores } = props;

  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const allScores = playerScores.flatMap(ps => ps.scores.map(e => e.score));
  const maxValue = Math.max(...allScores);
  const minValue = Math.min(...allScores);
  
  const createSmoothPath = (playerScores: ScoreLog[]) => {
    if (playerScores.length < 2) return '';
    
    const points = playerScores.map((e, i) => {
      const x = padding + (i * (chartWidth / (playerScores.length - 1)));
      const y = height - padding - ((e.score - minValue) / (maxValue - minValue) * chartHeight);
      return { x, y };
    });
    
    // Start path at the first point
    let path = `M ${points[0].x},${points[0].y}`;
    
    // Add curves between points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Control points for smooth curve
      const cp1x = current.x + (next.x - current.x) * 0.5;
      const cp1y = current.y;
      
      const cp2x = next.x - (next.x - current.x) * 0.5;
      const cp2y = next.y;
      
      // Add cubic bezier curve
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  return (
    <div className="p-4">
      <div className="mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200">
        <svg width={width} height={height} className="overflow-visible">
          {/* Y-axis grid lines */}
          {[0, 1, 2, 3, 4].map((index) => {
            const y = padding + (chartHeight / 4) * index;
            const value = Math.round(maxValue - (index * ((maxValue - minValue) / 4)));
            return (
              <g key={`grid-${index}`}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 10} 
                  y={y} 
                  textAnchor="end" 
                  dominantBaseline="middle" 
                  className="text-xs text-gray-500 dark:fill-white"
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* X-axis line */}
          <line 
            x1={padding} 
            y1={height - padding} 
            x2={width - padding} 
            y2={height - padding} 
            stroke="#9ca3af" 
            strokeWidth="1"
          />
          
          {/* Y-axis line */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={height - padding} 
            stroke="#9ca3af" 
            strokeWidth="1"
          />
          
          {/* Lines for each player */}
          {playerScores.map((ps, psIdx) => (
            <g key={`player-${psIdx}`}>
              {/* Smooth line for this player */}
              <path
                d={createSmoothPath(ps.scores)}
                fill="none"
                stroke="#dddddd"
                strokeWidth="2"
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Data points for this player */}
              {ps.scores.map((score, i) => {
                // TODO: adjust x pos based on timestamp
                const x = padding + (i * (chartWidth / (ps.scores.length - 1)));
                const y = height - padding - ((score.score - minValue) / (maxValue - minValue) * chartHeight);
                return (
                  <g key={`point-${psIdx}-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                      stroke="#dddddd"
                      strokeWidth="2"
                      className="transition-all duration-300 ease-in-out"
                    />
                    {/* Only show scores at the last round */}
                    {i === ps.scores.length - 1 && (
                      <text
                        x={x + 8}
                        y={y}
                        dominantBaseline="middle"
                        className="text-xs font-bold"
                        fill="#eeeeee"
                      >
                        {`${score.score} (${ps.player.name})`}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default Scoreboard;
