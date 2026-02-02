import type { IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";

export type Node<T> = {
  id: string;
  created: IsoDatetimeUtcExtendedMs;
  value: T;
  edgesOut: Edge<T>[];
  edgesIn: Edge<T>[];
};

export type Edge<T> = {
  id: string;
  from: Node<T>;
  to: Node<T>;
};
