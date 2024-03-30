import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Swal from 'sweetalert2';

import { RootState } from '../redux/reducers/root-reducer';

import { ACTIONS as ROOM_ACTIONS } from '../redux/reducers/room-reducer';
// import { ACTIONS as PLAYER_ACTIONS } from '../redux/reducers/player-reducer';
// import { ACTIONS as SOCKET_ACTIONS } from '../redux/reducers/socket-reducer';

import Cell from '../components/Cell';
import ChatCard from '../components/ChatCard';
import { SocketEvents, Chat, CellType, Player } from '../types';

const Room = () => {
    // TODO: handle path param and redux store somehow
    //
    const navigateTo = useNavigate();
    const { roomId } = useParams();
    console.log({ roomId });
    // const {
    //     username,
    //     avatar_url: avatarUrl
    // } = useSelector((state: RootState) => state.playerReducer);
    const {
        // id_room: roomId,
        field,
        current_col: currentCol,
        current_row: currentRow,
        players,
    } = useSelector((state: RootState) => state.roomReducer);
    const socket = useSelector((state: RootState) => state.socketReducer.socket);
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);

    const dispatch = useDispatch();

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

    const keyMap: Map<string, string> = new Map([
        ['ArrowUp', ROOM_ACTIONS.MOVE_UP],
        ['ArrowDown', ROOM_ACTIONS.MOVE_DOWN],
        ['ArrowLeft', ROOM_ACTIONS.MOVE_LEFT],
        ['ArrowRight', ROOM_ACTIONS.MOVE_RIGHT],
        ['i', ROOM_ACTIONS.MOVE_UP],
        ['k', ROOM_ACTIONS.MOVE_DOWN],
        ['j', ROOM_ACTIONS.MOVE_LEFT],
        ['l', ROOM_ACTIONS.MOVE_RIGHT],
    ]);

    const onStartGame = () => {
        socket.send(JSON.stringify({
            event_type: SocketEvents.START_GAME
        }));
    }

    const onExitGame = () => {
        socket.send(JSON.stringify({
            event_type: SocketEvents.LEAVE_ROOM
        }));
        dispatch({
            type: ROOM_ACTIONS.RESET_ROOM
        });

        navigateTo('/');
    }

    const onShowScoreboard = () => {
        console.log({ players });
        const scoreboard = Object.values<Player>(players).map((player: Player) => {
            return { name: player.name, score: player.score }
        }).sort((a, b) => b.score - a.score);
        console.log({ scoreboard });
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>)  => {
        if (e.shiftKey && e.key === ' ') {
            socket.send(JSON.stringify({
                event_type: SocketEvents.FLAG_CELL,
                row: currentRow,
                col: currentCol
            }));
            return
        } else if (e.key === ' ') {
            socket.send(JSON.stringify({
                event_type: SocketEvents.OPEN_CELL,
                row: currentRow,
                col: currentCol
            }));
            return
        }

        const actionType = keyMap.get(e.key);
        if (actionType !== undefined) {
            dispatch({
                type: actionType
            });
        }
    }

    socket.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        console.log({ data });

        switch (data.event_type) {
            case SocketEvents.CHAT:
                // playNotification();
                setChats([...chats, data])
                break;
            case SocketEvents.JOIN_ROOM_BROADCAST:
                // playNotification();
                const joinLog: Chat = {
                    message: `${data.player.name} joined`,
                    sender: 'System'
                }
                setChats([...chats, joinLog])
                // if (data.player.id_player !== playerId) {
                //     dispatch({
                //         type: ROOM_ACTIONS.ADD_PLAYER,
                //         payload: data.new_player
                //     });
                // }
                break;
            // case "leave-room":
            case SocketEvents.LEAVE_ROOM:
                socket.close(1000);
                dispatch({
                    type: ROOM_ACTIONS.RESET_ROOM
                });

                navigateTo('/');
                break;
            // case "leave-room-broadcast":
            //     playNotification();
            //     const leavingPlayer = players.find(
            //         (p: Player) => p.id_player === data.id_leaving_player);

            //     let leavingPlayerName = data.id_leaving_player;
            //     if (leavingPlayer !== undefined) {
            //         leavingPlayerName = leavingPlayer.name;
            //     }
            //     const leaveLog: Chat = {
            //         message: `${leavingPlayerName} left`,
            //         sender: 'System'
            //     }
            //     setChats([...chats, leaveLog])
            //     dispatch({
            //         type: ROOM_ACTIONS.REMOVE_PLAYER,
            //         payload: data.id_leaving_player
            //     })
            //     break;
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
                dispatch({
                    type: ROOM_ACTIONS.SET_FIELD,
                    payload: data.board
                });
                dispatch({
                    type: ROOM_ACTIONS.SET_PLAYERS,
                    payload: data.players,
                });
                Swal.fire({
                    icon: 'error',
                    title: 'You lose!',
                    text: 'You opened a mine'
                });
                break;
            case SocketEvents.GAME_CLEARED:
                dispatch({
                    type: ROOM_ACTIONS.END_GAME,
                });
                dispatch({
                    type: ROOM_ACTIONS.SET_FIELD,
                    payload: data.board
                });
                dispatch({
                    type: ROOM_ACTIONS.SET_PLAYERS,
                    payload: data.players,
                })
                Swal.fire({
                    icon: 'info',
                    title: 'You win!',
                    text: 'Game cleared'
                });
                break;
            // case "end-game-broadcast":
            //     playNotification();
            //     dispatch({
            //         type: ROOM_ACTIONS.END_GAME
            //     });
            //     dispatch({
            //         type: ROOM_ACTIONS.SET_PLAYER_SCORE,
            //         payload: {
            //             id_player: data.id_winner,
            //             score: data.winner_score
            //         }
            //     })
            //     const winner = players.find(
            //         (p: Player) => p.id_player === data.id_winner);

            //     let winnerName = data.id_winner;
            //     if (winner !== undefined) {
            //         winnerName = winner.name
            //     }
            //     const endLog: Chat = {
            //         sender: 'System',
            //         message: `${winnerName} win!`
            //     }
            //     setChats([...chats, endLog]);
            //     Swal.fire({
            //         icon: 'info',
            //         text: `${winnerName} win!`
            //     })
            //     break;
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
            // case SocketEvents.HOST_CHANGED:
            //     // playNotification();
            //     if (data.id_new_host === playerId) {
            //         dispatch({
            //             type: PLAYER_ACTIONS.SET_ADMIN
            //         });
            //     }
            //     const newHost = players.find(
            //         (p: Player) => p.id_player === data.id_new_host);

            //     let hostName = data.id_new_host;
            //     if (newHost !== undefined) {
            //         hostName = newHost.name
            //     }
            //     const newAdminLog: Chat = {
            //         sender: 'System',
            //         message: `user ${hostName} is now admin`
            //     }
            //     setChats([...chats, newAdminLog]);
            //     break;
            // case "vote-kick-broadcast":
            //     const targetPlayer = players.find(
            //         (p: Player) => p.id_player === data.id_target);

            //     let targetName = data.id_target;
            //     if (targetPlayer !== undefined) {
            //         targetName = targetPlayer.name
            //     }
            //     Swal.fire({
            //         icon: 'warning',
            //         title: 'Vote Kick',
            //         text: `Kick ${targetName}? (by ${data.issuer_name})`,
            //         showConfirmButton: false,
            //         showDenyButton: true,
            //         denyButtonText: 'Kick',
            //         showCancelButton: true,
            //     }).then((result) => {
            //             if (result.isDenied) {
            //                 socket.send(JSON.stringify({
            //                     event_type: "vote-kick-player",
            //                     is_add: true,
            //                     id_player: data.id_target
            //                 }));
            //             } else if (result.isDismissed) {
            //                 dispatch({
            //                     type: GAME_ACTIONS.SET_NOT_CHOOSING_PLAYER
            //                 })
            //             }
            //         })
            //     break;
            default:
                break;
        }
    }

    return (
        <div id='room-root' className='flex flex-row m-0' onKeyDown={onKeyDown} tabIndex={-1}>
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
                    <div id='exit-button' onClick={() => onExitGame()} className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Exit
                    </div>
                    <div id='scoreboard-button' onClick={() => onShowScoreboard()} className='cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500'>
                        Scoreboard
                    </div>
                </div>
            </div>
            <div id='game-panel' className='flex flex-row'>
                <div id='field' className='flex flex-col'>
                    {
                        field && field.length > 0 ? field.map((row: CellType[], rowIndex: number) => {
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

