import type { IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";

export type Node<T> = {
  id: string;
  created: IsoDatetimeUtcExtendedMs;
  value: T;
  edgeIdsOut: string[];
  edgeIdsIn: string[];
};

export type Edge<T> = {
  id: string;
  created: IsoDatetimeUtcExtendedMs;
  fromId: string;
  toId: string;
  value: T;
};
