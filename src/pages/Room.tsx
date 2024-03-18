import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Swal from 'sweetalert2';

import { RootState } from '../redux/reducers/root-reducer';

import { ACTIONS as ROOM_ACTIONS } from '../redux/reducers/room-reducer';
import { ACTIONS as PLAYER_ACTIONS } from '../redux/reducers/player-reducer';
import { ACTIONS as SOCKET_ACTIONS } from '../redux/reducers/socket-reducer';

import Cell from '../components/Cell';
import ChatCard from '../components/ChatCard';
import { SocketEvents } from '../types';

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
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);

    const dispatch = useDispatch();
    const fieldRow = 10;
    const fieldCol = 20;

    const onSendChat = () => {
        const content = message.trim();
        if (content !== '') {
            socket.send(JSON.stringify({
                event_type: "chat",
                message: content
            }));
        }
        setMessage('');
    }

    const keyToActionType: unknown = {
        'ArrowUp': ROOM_ACTIONS.MOVE_UP,
        'ArrowDown': ROOM_ACTIONS.MOVE_DOWN,
        'ArrowLeft': ROOM_ACTIONS.MOVE_LEFT,
        'ArrowRight': ROOM_ACTIONS.MOVE_RIGHT,
    };

    const onStartGame = () => {
        socket.send(JSON.stringify({
            event_type: SocketEvents.START_GAME
        }));
    }

    const onMoveCell = (direction) => {
        const type = keyToActionType[direction];
        dispatch({
            type
        });
    }

    socket.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        console.log({ data });

        switch (data.event_type) {
            case SocketEvents.CHAT:
                // playNotification();
                setChats([...chats, data])
                break;
            case "join-room-broadcast":
                playNotification();
                const joinLog: Chat = {
                    message: `${data.new_player.name} joined`,
                    sender: 'System'
                }
                setChats([...chats, joinLog])
                if (data.new_player.id_player !== playerId) {
                    dispatch({
                        type: ROOM_ACTIONS.ADD_PLAYER,
                        payload: data.new_player
                    });
                }
                break;
            case "leave-room":
                // socket.close(1000)
                // playNotification();
                dispatch({
                    type: ROOM_ACTIONS.RESET_ROOM
                });
                dispatch({
                    type: SOCKET_ACTIONS.REMOVE_SOCKET
                });
                dispatch({
                    type: PLAYER_ACTIONS.RESET_HAND
                });
                dispatch({
                    type: GAME_ACTIONS.RESET
                })
                onNavigateHome();
                break;
            case "leave-room-broadcast":
                playNotification();
                const leavingPlayer = players.find(
                    (p: Player) => p.id_player === data.id_leaving_player);

                let leavingPlayerName = data.id_leaving_player;
                if (leavingPlayer !== undefined) {
                    leavingPlayerName = leavingPlayer.name;
                }
                const leaveLog: Chat = {
                    message: `${leavingPlayerName} left`,
                    sender: 'System'
                }
                setChats([...chats, leaveLog])
                dispatch({
                    type: ROOM_ACTIONS.REMOVE_PLAYER,
                    payload: data.id_leaving_player
                })
                break;
            case SocketEvents.START_GAME:
                if (data.success) {
                    dispatch({
                        type: ROOM_ACTIONS.SET_START
                    });
                    dispatch({
                        type: ROOM_ACTIONS.SET_FIELD,
                        payload: data.board
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Failed to start game',
                        text: data.detail
                    })
                }
                break;
            case SocketEvents.BOARD_UPDATED:
                dispatch({
                    type: ROOM_ACTIONS.SET_FIELD,
                    payload: data.board
                });
                break;
            case SocketEvents.MINE_OPENED:
                dispatch({
                    type: ROOM_ACTIONS.END_GAME,
                });
                Swal.fire({
                    icon: 'error',
                    title: 'You lose!',
                    text: 'You opened a mine'
                });
                break;
            case "end-game-broadcast":
                playNotification();
                dispatch({
                    type: ROOM_ACTIONS.END_GAME
                });
                dispatch({
                    type: ROOM_ACTIONS.SET_PLAYER_SCORE,
                    payload: {
                        id_player: data.id_winner,
                        score: data.winner_score
                    }
                })
                const winner = players.find(
                    (p: Player) => p.id_player === data.id_winner);

                let winnerName = data.id_winner;
                if (winner !== undefined) {
                    winnerName = winner.name
                }
                const endLog: Chat = {
                    sender: 'System',
                    message: `${winnerName} win!`
                }
                setChats([...chats, endLog]);
                Swal.fire({
                    icon: 'info',
                    text: `${winnerName} win!`
                })
                break;
            case SocketEvents.NOTIFICATION:
                // playNotification();
                Swal.fire({
                    icon: 'info',
                    text: data.message
                });
                const notifLog: Chat = {
                    sender: 'System',
                    message: data.message
                }

                setChats([...chats, notifLog]);
                break;
            case SocketEvents.HOST_CHANGED:
                playNotification();
                if (data.id_new_host === playerId) {
                    dispatch({
                        type: PLAYER_ACTIONS.SET_ADMIN
                    });
                }
                const newHost = players.find(
                    (p: Player) => p.id_player === data.id_new_host);

                let hostName = data.id_new_host;
                if (newHost !== undefined) {
                    hostName = newHost.name
                }
                const newAdminLog: Chat = {
                    sender: 'System',
                    message: `user ${hostName} is now admin`
                }
                setChats([...chats, newAdminLog]);
                break;
            case "vote-kick-broadcast":
                const targetPlayer = players.find(
                    (p: Player) => p.id_player === data.id_target);

                let targetName = data.id_target;
                if (targetPlayer !== undefined) {
                    targetName = targetPlayer.name
                }
                Swal.fire({
                    icon: 'warning',
                    title: 'Vote Kick',
                    text: `Kick ${targetName}? (by ${data.issuer_name})`,
                    showConfirmButton: false,
                    showDenyButton: true,
                    denyButtonText: 'Kick',
                    showCancelButton: true,
                }).then((result) => {
                        if (result.isDenied) {
                            socket.send(JSON.stringify({
                                event_type: "vote-kick-player",
                                is_add: true,
                                id_player: data.id_target
                            }));
                        } else if (result.isDismissed) {
                            dispatch({
                                type: GAME_ACTIONS.SET_NOT_CHOOSING_PLAYER
                            })
                        }
                    })
                break;
            default:
                break;
        }
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
                    <div id='start-button' onClick={() => onStartGame()} className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Start
                    </div>
                    <div id='pause-button' className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Pause
                    </div>
                    <div id='exit-button' className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Exit
                    </div>
                </div>
            </div>
            <div id='game-panel' className='flex flex-row'>
                <div id='field' className='flex flex-col'>
                    {
                        field && field.length > 0 ? field.map((row, rowIndex) => {
                            return (
                                <div className='flex flex-row'>
                                    {
                                        row.map((cell, colIndex) => {
                                            return (
                                                <Cell 
                                                    key={`${rowIndex}-${colIndex}`} 
                                                    id={rowIndex*colIndex} 
                                                    row={rowIndex} 
                                                    col={colIndex} 
                                                    content={cell} 
                                                />
                                            );
                                        })
                                    }
                                </div>
                            );
                        }) : <div>loading...</div>
                    }
                </div>
            </div>
            <div id='chat-panel' className='flex flex-col'>
                {
                    chats.map((item, index) => <ChatCard key={index} chat={item.message} sender={item.sender} />)
                }
                <div id='chat-input' className='flex flex-row'>
                    <input type='text' value={message} onChange={e => setMessage(e.target.value)} onKeyPress={(e) => {
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

