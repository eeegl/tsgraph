import { newIsoUtc } from "@eeegl/tstime";
import { randomUUID } from "node:crypto";
import type { Edge, Err, Node, Ok } from "./types.js";

export const newNode = <N>(value: N): Node<N> => ({
  id: randomUUID(),
  type: "node",
  created: newIsoUtc().datetimeExtendedMs,
  value,
  edgeIdsIn: [],
  edgeIdsOut: [],
});

export const newEdge = <E>(params: {
  fromId: string;
  toId: string;
  value: E;
}): Edge<E> => ({
  id: randomUUID(),
  type: "edge",
  created: newIsoUtc().datetimeExtendedMs,
  fromId: params.fromId,
  toId: params.toId,
  value: params.value,
});

export const _ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const _err = <ErrT>(error: ErrT): Err<ErrT> => ({ ok: false, error });
