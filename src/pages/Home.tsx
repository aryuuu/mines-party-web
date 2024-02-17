import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers/root-reducer';

import { ACTIONS as ROOM_ACTIONS } from '../redux/reducers/room-reducer';
import { ACTIONS as PLAYER_ACTIONS } from '../redux/reducers/player-reducer';
import { ACTIONS as SOCKET_ACTIONS } from '../redux/reducers/socket-reducer';

const Home = () => {
    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const {
        username,
        avatar_url: avatarUrl
    } = useSelector((state: RootState) => state.playerReducer);
    const {
        id_room: roomId,
    } = useSelector((state: RootState) => state.roomReducer);
    const socket = useSelector((state: RootState) => state.socketReducer.socket);

    const onCreateRoom = () => {
        console.log('Create room', {
            username,
            roomId
        });
        navigateTo(`/room/${roomId}`);
    };

    const onJoinRoom = () => {
        console.log('Join room', {
            username,
            roomId
        });
        navigateTo(`/room/${roomId}`);
    };

    const onUpdateUsername = (value: string) => {
        dispatch({
            type: PLAYER_ACTIONS.SET_NAME,
            payload: value
        });
    };

    const onUpdateRoomId = (value: string) => {
        dispatch({
            type: ROOM_ACTIONS.SET_ID,
            payload: value
        })
    };

    return (
        <>
            <div className="text-bold">Mines Party</div>
            <div className="container mx-auto block">
                <input className="block" type="text" placeholder="Your name" value={username} onChange={e => onUpdateUsername(e.target.value)}/>
                <button className="block" onClick={onCreateRoom}>Create room</button>
                <input className="block" type="text" placeholder="Room ID" value={roomId} onChange={e => onUpdateRoomId(e.target.value)}/>
                <button className="block" onClick={onJoinRoom}>Join room</button>
            </div>
        </>
    );
}

export default Home;
