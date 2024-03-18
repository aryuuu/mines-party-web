import 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers/root-reducer';
import { SocketEvents } from '../../types';

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
    const { 
        current_row: currentRow, 
        current_col: currentCol,
    } = useSelector((state: RootState) => state.roomReducer);
    const socket = useSelector((state: RootState) => state.socketReducer.socket);

    const isCurrent = currentRow === props.row && currentCol === props.col;

    let cellColor = 'bg-gray-500';
    switch (content) {
        case '0':
            cellColor = 'bg-gray-300'
            break;
        case 'F':
            cellColor = 'bg-cyan-500'
    }

    const onOpenCell = () => {
        socket.send(JSON.stringify({
            event_type: SocketEvents.OPEN_CELL,
            row,
            col,
        }));
    }

    const onDoubleClick = () => {
        socket.send(JSON.stringify({
            event_type: '',
            row, 
            col
        }));
    }

    const onFlagCell = () => {
        socket.send(JSON.stringify({
            event_type: SocketEvents.FLAG_CELL,
            row,
            col
        }));
    }

    return (
        <div 
            onClick={() => onOpenCell()}
            onDoubleClick={() => onDoubleClick()}
            onContextMenu={() => onFlagCell()}
            className={`cell ${ isCurrent ? 'bg-gray-500' : 'bg-gray-600'} ${cellColor} lg:w-12 lg:h-12 md:w-8 md:h-8 m-1 rounded-sm hover:bg-gray-500`}
        >
            {content}
        </div>
    );
}

export default Cell;
