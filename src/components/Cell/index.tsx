import 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers/root-reducer';

type CellProps = {
    id: number;
    col: number;
    row: number;
    height?: number;
    width?: number;
};

const Cell = (props: CellProps) => {
    const { current_row: currentRow, current_col: currentCol } = useSelector((state: RootState) => state.roomReducer);
    const isCurrent = currentRow === props.row && currentCol === props.col;

    return (
        <div className={`cell ${ isCurrent ? 'bg-gray-500' : 'bg-gray-600'} lg:w-12 lg:h-12 md:w-8 md:h-8 m-1 rounded-sm hover:bg-gray-500`}>
        </div>
    );
}

export default Cell;
