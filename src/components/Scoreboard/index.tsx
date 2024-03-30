import "react";
import { Player } from "../../types";

type ScoreboardProps = {
  players: Player[];
};

const Scoreboard = (props: ScoreboardProps) => {
  const { players } = props;
  return (
    <table id="leaderboard-table" className="table-auto">
      <tr>
        <td className="px-4 py-2">Rank</td>
        <td className="px-4 py-2">Name</td>
        <td className="px-4 py-2">Score</td>
      </tr>
      {players.map((player, index) => (
        <tr key={player.id_player}>
          <td className="border px-4 py-2">{index + 1}</td>
          <td className="border px-4 py-2">{player.name}</td>
          <td className="border px-4 py-2">{player.score}</td>
        </tr>
      ))}
    </table>
  );
};

export default Scoreboard;
