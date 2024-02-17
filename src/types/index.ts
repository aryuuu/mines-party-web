export type Room = {
  id_room: string;
  capacity: number;
  id_host: string;
  is_started: boolean;
  players: Player[];
  field: CellType[][];
  time: number;
  flag_count: number;
  mine_count: number;
}

export type Player = {
  id_player: string;
  avatar_url: string;
  username: string;
  is_admin: boolean;
  score: number;
}

export enum CellType {
  EMPTY = 'empty',
  FLAG = 'flag',
  MINE = 'mine',
  NUMBER = 'number',
}

export type Socket = {
  socket: WebSocket;
}

export type Chat = {
  sender: string;
  message: string;
}
