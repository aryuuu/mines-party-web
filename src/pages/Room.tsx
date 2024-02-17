import 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../redux/reducers/root-reducer';

import { ACTIONS as ROOM_ACTIONS } from '../redux/reducers/room-reducer';
import { ACTIONS as PLAYER_ACTIONS } from '../redux/reducers/player-reducer';
import { ACTIONS as SOCKET_ACTIONS } from '../redux/reducers/socket-reducer';

const Room = () => {
    // TODO: handle path param and redux store somehow
    const { roomId } = useParams();
    const {
        username,
        avatar_url: avatarUrl
    } = useSelector((state: RootState) => state.playerReducer);
    const {
        // id_room: roomId,
    } = useSelector((state: RootState) => state.roomReducer);
    const socket = useSelector((state: RootState) => state.socketReducer.socket);

    return (
        <div>Hello {username}, from room {roomId}</div>
    );
}

export default Room;

