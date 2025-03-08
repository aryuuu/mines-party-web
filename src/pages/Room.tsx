import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Swal from "sweetalert2";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { RootState } from "../redux/reducers/root-reducer";

import { ACTIONS as ROOM_ACTIONS } from "../redux/reducers/room-reducer";
import { ACTIONS as SOCKET_ACTIONS } from "../redux/reducers/socket-reducer";

import Cell from "../components/Cell";
import ChatCard from "../components/ChatCard";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";
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
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [playerScore, setPlayerScore] = useState<Player[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [timer, _setTimer] = useState(0);

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

  const onSendChat = () => {
    const content = message.trim();
    if (content !== "") {
      socket.send(
        JSON.stringify({
          event_type: "chat",
          message: content,
        }),
      );
    }
    setMessage("");
  };

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
  };

  const onShowScoreboard = () => {
    console.log({ players });
    const scoreboard = Object.values<Player>(players)
      .map((player: Player) => {
        return { ...player };
      })
      .sort((a, b) => b.score - a.score);
    setPlayerScore(scoreboard);
    setShowScoreboard(true);
  };

  const onCloseScoreboard = () => {
    setShowScoreboard(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.shiftKey && e.key === " ") {
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
    //   type: PLAYER_ACTIONS.RESET_HAND,
    // });
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
          // positionUpdater = setInterval(() => {
          //     console.log('update pos cast')
          //     console.log({
          //         event_type: SocketEvents.POSITION_UPDATED,
          //         row: currentRow,
          //         col: currentCol
          //     })
          //     socket.send(JSON.stringify({
          //         event_type: SocketEvents.POSITION_UPDATED,
          //         row: currentRow,
          //         col: currentCol
          //     }));
          // }, 1000);
          // timeUpdater = setInterval(() => {
          //     console.log('timer', timer);
          //     setTimer(timer + 1);
          // }, 1000);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Failed to start game",
            text: data.detail,
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
        // dispatch({
        //   type: ROOM_ACTIONS.SET_PLAYERS,
        //   payload: data.players,
        // });
        Swal.fire({
          icon: "info",
          title: "You win!",
          text: "Game cleared",
        });
        // clearInterval(positionUpdater);
        // clearInterval(timeUpdater)
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
        console.log({ score_updated_data: data });
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
      <div id="control-panel" className="flex flex-col justify-center p-10">
        <div id="game-stat" className="flex flex-row">
          <div id="timer" className="p-1 m-1">
            <Timer time={timer} />
          </div>
          <div id="flag-count" className="p-1 m-1">
            flag-count
          </div>
          <div id="mine-count" className="p-1 m-1">
            mine-count
          </div>
        </div>
        <div id="button-list" className="flex flex-row">
          <div
            id="start-button"
            onClick={() => onStartGame()}
            className="cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            Start
          </div>
          <div
            id="pause-button"
            className="cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            Pause
          </div>
          <div
            id="exit-button"
            onClick={() => onExitGame()}
            className="cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            Exit
          </div>
          <CopyToClipboard
            text={window.location.href}
            onCopy={() =>
              Swal.fire({
                icon: "success",
                title: "Link copied",
                text: window.location.href,
              })
            }
          >
            <div className="cell bg-gray-800 p-2 m-1 rounded hover:bg-gray-500">
              Copy link
            </div>
          </CopyToClipboard>
          <div
            id="scoreboard-button"
            onClick={() => onShowScoreboard()}
            className="cell bg-gray-800 p-2 m-1 rounded-md hover:bg-gray-500"
          >
            Scoreboard
          </div>
        </div>
      </div>
      <div id="game-panel" className="flex flex-row items-center p-10">
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
      <div
        id="chat-panel"
        className="flex flex-col justify-end pt-20 pb-20 pr-5"
      >
        <div id="chat-items" className="grid overflow-scroll">
          {chats.map((item, index) => (
            <ChatCard key={index} chat={item.message} sender={item.sender} />
          ))}
          <div id="chat-base"></div>
        </div>
        <div id="chat-input" className="flex flex-row">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key == "Enter") {
                onSendChat();
              }
            }}
          />
        </div>
      </div>
      <div
        id="scoreboard-modal"
        className={`absolute bg-gray-900 ${showScoreboard ? "block" : "hidden"}`}
      >
        <Scoreboard playerScores={player_scores} />
        <button onClick={() => onCloseScoreboard()}>Close</button>
      </div>
    </div>
  );
};

export default Room;
