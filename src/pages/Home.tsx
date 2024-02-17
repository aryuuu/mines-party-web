import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Home = () => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigateTo = useNavigate();

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
        setUsername(value);
    };

    const onUpdateRoomId = (value: string) => {
        setRoomId(value);
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
