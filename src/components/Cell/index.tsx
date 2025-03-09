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
        {content}
      </p>
    </div>
  );
};

export default Cell;
