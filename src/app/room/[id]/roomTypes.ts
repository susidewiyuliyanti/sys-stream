export type Participant = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type RoomMessage = Participant & {
  id: string;
  message: string;
  createdAt: number;
};

export type RoomState = {
  id: string;
  ownerUserId: string;
  title: string;
  description: string;
  status: string;
  likes: number;
  participantCount: number;
  owner?: boolean;
};

export type RoomStream = {
  provider: string;
  inputUid: string;
  playbackUrl: string;
  playbackHls: string;
  playbackWebrtc: string;
  whipUrl: string;
  status: string;
  ingestUrl: string;
  streamKey: string;
  owner: boolean;
};
