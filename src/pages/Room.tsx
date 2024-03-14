import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../redux/reducers/root-reducer';

import { ACTIONS as ROOM_ACTIONS } from '../redux/reducers/room-reducer';
import { ACTIONS as PLAYER_ACTIONS } from '../redux/reducers/player-reducer';
import { ACTIONS as SOCKET_ACTIONS } from '../redux/reducers/socket-reducer';

import Cell from '../components/Cell';
import ChatCard from '../components/ChatCard';

const Room = () => {
    // TODO: handle path param and redux store somehow
    const { roomId } = useParams();
    const {
        username,
        avatar_url: avatarUrl
    } = useSelector((state: RootState) => state.playerReducer);
    const {
        // id_room: roomId,
        field,
        current_col: currentCol,
        current_row: currentRow,
    } = useSelector((state: RootState) => state.roomReducer);
    const socket = useSelector((state: RootState) => state.socketReducer.socket);
    const [chat, setChat] = useState('');

    const fieldRow = 10;
    const fieldCol = 20;

    const onSendChat = () => {
        console.log(chat);
        setChat('');
    }

    const onMoveCell = () => {

    }

    return (
        <div id='room-root' className='flex flex-row m-0 '>
            <div id='control-panel' className='flex flex-col'>
                <div id='game-stat' className='flex flex-row'>
                    <div id='timer' className='p-1 m-1'>
                        timer
                    </div>
                    <div id='flag-count' className='p-1 m-1'>
                        flag-count
                    </div>
                    <div id='mine-count' className='p-1 m-1'>
                        mine-count
                    </div>
                </div>
                <div id='button-list' className='flex flex-row'>
                    <div id='' className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Start
                    </div>
                    <div id='' className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Pause
                    </div>
                    <div id='' className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Exit
                    </div>
                </div>
            </div>
            <div id='game-panel' className='flex flex-row'>
                <div id='field' className='flex flex-col'>
                    {
                        Array.from(Array(fieldRow).keys()).map(row => {
                            return (
                                <div key={row} className='flex flex-row'>
                                    {
                                        Array.from(Array(fieldCol).keys()).map(col => {
                                            return (
                                                <Cell key={`${row}-${col}`} id={col} row={row} col={col}/>
                                            );
                                        })
                                    }
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            <div id='chat-panel' className='flex flex-col'>
                {
                    Array.from(Array(10).keys()).map(el => <ChatCard key={el} />)
                }
                <div id='chat-input' className='flex flex-row'>
                    <input type='text' value={chat} onChange={e => setChat(e.target.value)} onKeyPress={(e) => {
                        if (e.key == 'Enter') {
                            onSendChat();
                        }
                    }}/>
                </div>
            </div>
        </div>
    );
}

export default Room;

