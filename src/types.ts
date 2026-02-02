import type { IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";

export type Node<T> = {
  id: string;
  type: "node";
  created: IsoDatetimeUtcExtendedMs;
  value: T;
  edgeIdsOut: string[];
  edgeIdsIn: string[];
};

export type Edge<T> = {
  id: string;
  type: "edge";
  created: IsoDatetimeUtcExtendedMs;
  fromId: string;
  toId: string;
  value: T;
};

export type Ok<T> = { ok: true; value: T };
export type Err<ErrT> = { ok: false; error: ErrT };
export type Result<T, ErrT> = Ok<T> | Err<ErrT>;
