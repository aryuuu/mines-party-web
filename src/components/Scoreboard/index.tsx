import "react";
import { PlayerScores } from "../../types";

type ScoreboardProps = {
  players: PlayerScores[];
};

const Scoreboard = (props: ScoreboardProps) => {
  const { players } = props;

  // Chart dimensions
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Find min and max values across all players
  const allScores = players.flatMap(player => player.scores);
  const maxValue = Math.max(...allScores);
  const minValue = 0; // Starting from 0 for a scoreboard
  
  // Create a smooth path using bezier curves
  const createSmoothPath = (playerScores: number[]) => {
    if (playerScores.length < 2) return '';
    
    const points = playerScores.map((score, i) => {
      const x = padding + (i * (chartWidth / (playerScores.length - 1)));
      const y = height - padding - ((score - minValue) / (maxValue - minValue) * chartHeight);
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
      <h2 className="text-lg font-bold text-center mb-4">Players Scoreboard</h2>
      <div className="mx-auto bg-white rounded-lg shadow-lg p-4 border border-gray-200">
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
                  className="text-xs text-gray-500"
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
          {players.map((player, playerIndex) => (
            <g key={`player-${playerIndex}`}>
              {/* Smooth line for this player */}
              <path
                d={createSmoothPath(player.scores)}
                fill="none"
                stroke="#dddddd"
                strokeWidth="2"
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Data points for this player */}
              {player.scores.map((score, i) => {
                const x = padding + (i * (chartWidth / (player.scores.length - 1)));
                const y = height - padding - ((score - minValue) / (maxValue - minValue) * chartHeight);
                return (
                  <g key={`point-${playerIndex}-${i}`}>
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
                    {i === player.scores.length - 1 && (
                      <text
                        x={x + 8}
                        y={y}
                        dominantBaseline="middle"
                        className="text-xs font-bold"
                        fill="#eeeeee"
                      >
                        {score}
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
