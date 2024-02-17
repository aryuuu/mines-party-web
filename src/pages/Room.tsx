import 'react';
import { useParams } from 'react-router-dom';

const Room = () => {
    const { roomId } = useParams();
    return (
        <div>Hello world, from room {roomId}</div>
    );
}

export default Room;

