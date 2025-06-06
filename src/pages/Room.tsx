import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Swal from "sweetalert2";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { RootState } from "../redux/reducers/root-reducer";

import { ACTIONS as ROOM_ACTIONS } from "../redux/reducers/room-reducer";
import { ACTIONS as SOCKET_ACTIONS } from "../redux/reducers/socket-reducer";

import Cell from "../components/Cell";
// import ChatCard from "../components/ChatCard";
import Scoreboard from "../components/Scoreboard";
// import Timer from "../components/Timer";
import { SocketEvents, Chat, CellType, Player } from "../types";
import { flagCellSfx, moveCellSfx, newMessageSfx, openCellSfx } from "../sfx";

const Room = () => {
  // TODO: handle path param and redux store somehow
  //
  const navigateTo = useNavigate();
  const { roomId } = useParams();
  const {
    // name,
    id_player: playerId,
  } = useSelector((state: RootState) => state.playerReducer);
  const {
    // id_room: roomId,
    field,
    current_col: currentCol,
    current_row: currentRow,
    players,
    player_scores,
  } = useSelector((state: RootState) => state.roomReducer);
  const socket = useSelector((state: RootState) => state.socketReducer.socket);
  // const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  // const [timer, _setTimer] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    const chatBase = document.getElementById("chat-base");
    if (chatBase) {
      chatBase.scrollIntoView();
    }
  }, [chats]);


  useEffect(() => {
    document.title = 'Room | Mines';
    if (socket.url == null) {
      dispatch({
        type: ROOM_ACTIONS.SET_ROOM_ID,
        payload: roomId
      });
      navigateTo('/')
    }
  }, [dispatch, roomId, socket.url, navigateTo]);

  // const onSendChat = () => {
  //   const content = message.trim();
  //   if (content !== "") {
  //     socket.send(
  //       JSON.stringify({
  //         event_type: "chat",
  //         message: content,
  //       }),
  //     );
  //   }
  //   setMessage("");
  // };

  const keyMap: Map<string, string> = new Map([
    ["ArrowUp", ROOM_ACTIONS.MOVE_UP],
    ["ArrowDown", ROOM_ACTIONS.MOVE_DOWN],
    ["ArrowLeft", ROOM_ACTIONS.MOVE_LEFT],
    ["ArrowRight", ROOM_ACTIONS.MOVE_RIGHT],
    ["i", ROOM_ACTIONS.MOVE_UP],
    ["k", ROOM_ACTIONS.MOVE_DOWN],
    ["j", ROOM_ACTIONS.MOVE_LEFT],
    ["l", ROOM_ACTIONS.MOVE_RIGHT],
    ["I", ROOM_ACTIONS.MOVE_UP],
    ["K", ROOM_ACTIONS.MOVE_DOWN],
    ["J", ROOM_ACTIONS.MOVE_LEFT],
    ["L", ROOM_ACTIONS.MOVE_RIGHT],
  ]);

  const onStartGame = () => {
    socket.send(
      JSON.stringify({
        event_type: SocketEvents.START_GAME,
      }),
    );
  };

  const onExitGame = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Go to home",
      icon: "warning",
      showCancelButton: true,
    }).then(result => {
        if (result.isConfirmed) {
          socket.send(
            JSON.stringify({
              event_type: SocketEvents.LEAVE_ROOM,
            }),
          );
          dispatch({
            type: ROOM_ACTIONS.RESET_ROOM,
          });
          dispatch({
            type: SOCKET_ACTIONS.REMOVE_SOCKET
          });
          navigateTo("/");
        }
      })
  };

  const onClickSettings = () => {
    Swal.fire({
      title: "Settings",
      html: `
      <div class="space-y-4">
        <!-- Difficulty -->
        <div class="mb-4">
          <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">Difficulty:</label>
          <select id="difficulty" class="w-full max-w-xs bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <!-- Cell Point -->
        <div class="mb-4">
          <label for="cell-point" class="block text-sm font-medium text-gray-700 mb-1">Cell Point:</label>
          <input type="number" id="cell-point" value="1" min="1" class="w-full max-w-xs bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        
        <!-- Mine Point -->
        <div class="mb-4">
          <label for="mine-point" class="block text-sm font-medium text-gray-700 mb-1">Mine Point:</label>
          <input type="number" id="mine-point" value="-50" class="w-full max-w-xs bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        
        <!-- Count Cold Open -->
        <div class="flex items-center">
          <input type="checkbox" id="count-cold-open" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
          <label for="count-cold-open" class="ml-2 block text-sm text-gray-700">Count Cold Open</label>
        </div>
      </div>
`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Save Settings',
    cancelButtonText: 'Cancel',
    customClass: {
      container: 'game-settings-modal',
      input: 'game-settings-input'
    },
      preConfirm: () => {
        const difficulty = (document.getElementById('difficulty') as HTMLInputElement)?.value;
        const countColdOpen = (document.getElementById('count-cold-open') as HTMLInputElement)?.checked;
        const cellScore = (document.getElementById('cell-point') as HTMLInputElement)?.value;
        const minesScore = (document.getElementById('mine-point') as HTMLInputElement)?.value;

        // TODO: basic validation

        return { 
          difficulty,
          count_cold_open: countColdOpen,
          cell_score: parseInt(cellScore),
          mine_score: parseInt(minesScore),
        };
      }
    }).then(result => {
        if (!result.isConfirmed) return;
        socket.send(
          JSON.stringify({
            event_type: SocketEvents.CHANGE_SETTINGS,
            settings: result.value,
          })
        );
      })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.shiftKey && e.key === " " || e.key === "z") {
      flagCellSfx.play();
      socket.send(
        JSON.stringify({
          event_type: SocketEvents.FLAG_CELL,
          row: currentRow,
          col: currentCol,
        }),
      );
      return;
    } else if (e.key === " ") {
      openCellSfx.play();
      socket.send(
        JSON.stringify({
          event_type: SocketEvents.OPEN_CELL,
          row: currentRow,
          col: currentCol,
        }),
      );
      return;
    }

    const actionType = keyMap.get(e.key);
    if (actionType !== undefined) {
      dispatch({
        type: actionType,
      });
      moveCellSfx.play();

      // TODO: probably need some kind of debounce here
      socket.send(
        JSON.stringify({
          event_type: SocketEvents.POSITION_UPDATED,
          // TODO: publish next position instead? and mind the possibility of race condition with the state update by reducer
          row: currentRow,
          col: currentCol,
        }),
      );
    }
  };

  socket.onclose = () => {
    dispatch({
      type: ROOM_ACTIONS.RESET_ROOM
    });
    dispatch({
      type: SOCKET_ACTIONS.REMOVE_SOCKET
    });
    // dispatch({
    //   type: PLAYER_ACTIONS.RESET_ADMIN,
    // });
    navigateTo("/");
  }

  socket.onmessage = (ev) => {
    const data = JSON.parse(ev.data);

    switch (data.event_type) {
      case SocketEvents.CHAT:
        // playNotification();
        newMessageSfx.play();
        setChats([...chats, data]);
        break;
      case SocketEvents.JOIN_ROOM_BROADCAST: {
        const joinLog: Chat = {
          message: `${data.player.name} joined`,
          sender: "System",
        };
        setChats([...chats, joinLog]);
        if (data.player.id_player !== playerId) {
            dispatch({
                type: ROOM_ACTIONS.ADD_PLAYER,
                payload: data.player
            });
        }
        break;
      }
      case SocketEvents.LEAVE_ROOM:
        socket.close(1000);
        dispatch({
          type: ROOM_ACTIONS.RESET_ROOM,
        });

        navigateTo("/");
        break;
      case "leave-room-broadcast": {
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

      }
      case SocketEvents.START_GAME:
        if (data.success) {
          dispatch({
            type: ROOM_ACTIONS.SET_START,
          });
          dispatch({
            type: ROOM_ACTIONS.SET_FIELD,
            payload: data.board,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Failed to start game",
            text: data.detail,
            timer: 2000,
          });
        }
        break;
      case SocketEvents.BOARD_UPDATED:
        dispatch({
          type: ROOM_ACTIONS.SET_FIELD,
          payload: data.board,
        });
        break;
      case SocketEvents.MINE_OPENED:
        dispatch({
          type: ROOM_ACTIONS.END_GAME,
        });
        dispatch({
          type: ROOM_ACTIONS.SET_FIELD,
          payload: data.board,
        });
        Swal.fire({
          icon: "error",
          title: "You lose!",
          text: "You opened a mine",
          timer: 5000,
        });
        break;
      case SocketEvents.GAME_CLEARED:
        dispatch({
          type: ROOM_ACTIONS.END_GAME,
        });
        dispatch({
          type: ROOM_ACTIONS.SET_FIELD,
          payload: data.board,
        });
        // TODO: update the scoreboard as well
        // dispatch({
        //   type: ROOM_ACTIONS.SET_PLAYERS,
        //   payload: data.players,
        // });
        Swal.fire({
          icon: "info",
          title: "You win!",
          text: "Game cleared",
          timer: 2000,
        });
        break;
      case SocketEvents.POSITION_UPDATED:
        if (data.id_player !== playerId) {
          dispatch({
            type: ROOM_ACTIONS.SET_PLAYER_POSITION,
            payload: {
              player_id: data.sender_id,
              row: data.row,
              col: data.col,
            },
          });
        }
        break;
      case SocketEvents.SCORE_UPDATED:
        dispatch({
          type: ROOM_ACTIONS.SET_PLAYER_SCORE,
          payload: {
            ...data,
          },
        });
        break;
      case SocketEvents.NOTIFICATION: {
        Swal.fire({
          icon: "info",
          text: data.message,
          timer: 1500,
        });
        const notifLog: Chat = {
          sender: "System",
          message: data.message,
        };

        setChats([...chats, notifLog]);
        break;
      }
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
  };

  return (
    <div
      id="room-root"
      className="flex flex-row m-0 p-1 h-screen w-screen justify-between"
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div id="game-panel" className="flex flex-col items-center p-10">
        <div id="control-panel" className="flex flex-row justify-center m-3">
          <div
            id="start-button"
            onClick={() => onStartGame()}
            className="cell bg-gray-300 dark:bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 18V6l8 6-8 6Z"/>
            </svg>
          </div>
          <div
            id="pause-button"
            className="cell bg-gray-300 dark:bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6H8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 0h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z"/>
            </svg>
          </div>
          <div
            id="exit-button"
            onClick={() => onExitGame()}
            className="cell bg-gray-300 dark:bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
          </div>
          <CopyToClipboard
            text={window.location.href}
            onCopy={() =>
              Swal.fire({
                icon: "success",
                title: "Link copied",
                text: window.location.href,
                timer: 1500,
              })
            }
          >
            <div className="cell bg-gray-300 dark:bg-gray-800 p-2 m-1 rounded hover:bg-gray-500">
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" clip-rule="evenodd"/>
              </svg>
            </div>
          </CopyToClipboard>
          <div
            id="settings-button"
            onClick={() => onClickSettings()}
            className="cell bg-gray-300 dark:bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
            </svg>
          </div>
        </div>
        <div id="field" className="flex flex-col">
          {field && field.length > 0 ? (
            field.map((row: CellType[], rowIndex: number) => {
              return (
                <div className="flex flex-row" key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    return (
                      <Cell
                        key={`${rowIndex}-${colIndex}`}
                        id={rowIndex * colIndex}
                        row={rowIndex}
                        col={colIndex}
                        content={cell}
                      />
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div>loading...</div>
          )}
        </div>
      </div>
      <div id="monitor-panel">
        <Scoreboard playerScores={player_scores} />
      </div>
      {
      // <div
      //   id="chat-panel"
      //   className="flex flex-col justify-end pt-20 pb-20 pr-5"
      // >
      //   <div id="chat-items" className="grid overflow-scroll">
      //     {chats.map((item, index) => (
      //       <ChatCard key={index} chat={item.message} sender={item.sender} />
      //     ))}
      //     <div id="chat-base"></div>
      //   </div>
      //   <div id="chat-input" className="flex flex-row">
      //     <input
      //       type="text"
      //       value={message}
      //       onChange={(e) => setMessage(e.target.value)}
      //       onKeyPress={(e) => {
      //         if (e.key == "Enter") {
      //           onSendChat();
      //         }
      //       }}
      //     />
      //   </div>
      // </div>
      }
    </div>
  );
};

export default Room;
