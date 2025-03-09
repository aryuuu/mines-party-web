import "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/reducers/root-reducer";
import { SocketEvents } from "../../types";
import { ACTIONS as ROOM_ACTIONS } from "../../redux/reducers/room-reducer";
import { flagCellSfx, moveCellSfx, openCellSfx } from "../../sfx";

type CellProps = {
  id: number;
  col: number;
  row: number;
  content: string;
  height?: number;
  width?: number;
};

const Cell = (props: CellProps) => {
  const { col, row, content } = props;
  const dispatch = useDispatch();
  const {
    current_row: currentRow,
    current_col: currentCol,
    player_positions: playerPositions,
  } = useSelector((state: RootState) => state.roomReducer);
  const {
    id_player: playerId,
  } = useSelector((state: RootState) => state.playerReducer);
  const socket = useSelector((state: RootState) => state.socketReducer.socket);

  const isCurrent = currentRow === props.row && currentCol === props.col;

  const isOtherPlayer = Object.entries(playerPositions).some(
    ([id, pos]) => id !== playerId && pos.row === row && pos.col === col,
  );

  let cellColor = "bg-gray-300";
  let textColor = "text-gray-900";
  if (isCurrent) {
    cellColor = "bg-yellow-100";
    switch (content) {
      case " ":
        cellColor = "bg-yellow-200";
        break;
      case "0":
        textColor = "text-yellow-100";
        break;
      case "F":
        cellColor = "bg-cyan-300";
        textColor = "text-gray-800";
        break;
      case "X":
        cellColor = "bg-red-500";
        break;
    }
  } else {
    switch (content) {
      case " ":
        cellColor = "bg-gray-500";
        break;
      case "0":
        textColor = "text-gray-300";
        break;
      case "F":
        cellColor = "bg-cyan-500";
        textColor = "text-gray-800";
        break;
      case "X":
        cellColor = "bg-red-500";
        break;
    }
  }

  if (isOtherPlayer && !isCurrent) {
    cellColor = "bg-green-500";
  }

  const onOpenCell = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    socket.send(
      JSON.stringify({
        event_type: SocketEvents.OPEN_CELL,
        row,
        col,
      }),
    );
    openCellSfx.play();
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    socket.send(
      JSON.stringify({
        event_type: "",
        row,
        col,
      }),
    );
  };

  const onFlagCell = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    socket.send(
      JSON.stringify({
        event_type: SocketEvents.FLAG_CELL,
        row,
        col,
      }),
    );
    flagCellSfx.play();
    return false;
  };

  const onMouseOver = () => {
    dispatch({
      type: ROOM_ACTIONS.SET_CURRENT_POSITION,
      payload: { row, col },
    });
    moveCellSfx.play();

    // TODO: probably need some kind of debounce here
    // TODO: prevent sending this event when the game is not started
    socket.send(JSON.stringify({
        event_type: SocketEvents.POSITION_UPDATED,
        // TODO: publish next position instead? and mind the possibility of race condition with the state update by reducer
        row: currentRow,
        col: currentCol
    }));
  };

  return (
    <div
      onClick={(e) => onOpenCell(e)}
      onDoubleClick={(e) => onDoubleClick(e)}
      onContextMenu={(e) => onFlagCell(e)}
      onMouseOver={(e) => {
        e.preventDefault();
        onMouseOver();
      }}
      className={`cell ${cellColor} ${textColor} grid lg:w-12 lg:h-12 md:w-8 md:h-8 m-1 rounded-sm justify-center items-center place-items-center text-center font-bold`}
    >
      <p>
        {content === "F" ? (
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 14v7M5 4.971v9.541c5.6-5.538 8.4 2.64 14-.086v-9.54C13.4 7.61 10.6-.568 5 4.97Z"/>
          </svg>
        ) : content === "X" ? (
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 17a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2Z"/>
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.815 9H16.5a2 2 0 1 0-1.03-3.707A1.87 1.87 0 0 0 15.5 5 1.992 1.992 0 0 0 12 3.69 1.992 1.992 0 0 0 8.5 5c.002.098.012.196.03.293A2 2 0 1 0 7.5 9h3.388m2.927-.985v3.604M10.228 9v2.574M15 16h.01M9 16h.01m11.962-4.426a1.805 1.805 0 0 1-1.74 1.326 1.893 1.893 0 0 1-1.811-1.326 1.9 1.9 0 0 1-3.621 0 1.8 1.8 0 0 1-1.749 1.326 1.98 1.98 0 0 1-1.87-1.326A1.763 1.763 0 0 1 8.46 12.9a2.035 2.035 0 0 1-1.905-1.326A1.9 1.9 0 0 1 4.74 12.9 1.805 1.805 0 0 1 3 11.574V12a9 9 0 0 0 18 0l-.028-.426Z"/>
            </svg>
        ) : content}
      </p>
    </div>
  );
};

export default Cell;
