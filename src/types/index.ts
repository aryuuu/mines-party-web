export type Room = {
  id_room: string;
  is_started: boolean;
  players: { [key:string]: Player};
  player_positions: { [key: string]: { row: number; col: number } };
  player_scores: PlayerScores[];
  field: CellType[][];
  time: number;
  flag_count: number;
  mine_count: number;
  current_row: number;
  current_col: number;
  settings: RoomSettings;
};

export type RoomSettings = {
  id_host: string;
  capacity: number;
  difficulty: "easy" | "medium" | "hard";
  cell_score: number;
  mine_score: number;
  count_cold_open: boolean;
};

export type Player = {
  id_player: string;
  avatar_url: string;
  name: string;
  color: string;
  is_admin: boolean;
  score: number;
  scores: ScoreLog[];
};

export type ScoreLog = {
  timestamp: number;
  score: number;
};

export type PlayerScores = {
  id_player: string;
  player: Player;
  scores: ScoreLog[];
};

export enum CellType {
  EMPTY = 'empty',
  FLAG = 'flag',
  MINE = 'mine',
  NUMBER = 'number',
}

export type Socket = {
  socket: WebSocket;
};

export type Chat = {
  sender: string;
  message: string;
};

export enum SocketEvents {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  CHAT = 'chat',
  JOIN_ROOM_BROADCAST = 'join_room_broadcast',
  LEAVE_ROOM = 'leave_room',
  START_GAME = 'start_game',
  START_GAME_BROADCAST = 'start_game_broadcast',
  PAUSE_GAME = 'pause_game',
  HOST_CHANGED = 'host_changed',
  RESUME_GAME = 'resume_game',
  OPEN_CELL = 'open_cell',
  FLAG_CELL = 'flag_cell',
  BOARD_UPDATED = 'board_updated',
  MINE_OPENED = 'mine_opened',
  GAME_CLEARED = 'game_cleared',
  POSITION_UPDATED = 'position_updated',
  SCORE_UPDATED = 'score_updated',
  CHANGE_SETTINGS = 'change_settings',
  SETTINGS_UPDATED = 'settings_updated',
  KICK_PLAYER = 'kick_player',
  VOTE_KICK_PLAYER = 'vote_kick_player',
  NOTIFICATION = 'notification',
  UNICAST = 'unicast',
  BROADCAST = 'broadcast',
}
