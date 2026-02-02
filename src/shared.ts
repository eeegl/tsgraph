import { newIsoUtc, type IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";
import { randomUUID } from "node:crypto";
import type { Node } from "./types.js";

export const createNode = <T>(params: {
  value: T;
  id?: string;
  created?: Date;
}): Node<T> => ({
  id: params.id ?? randomUUID(),
  created: newIsoUtc(params.created).datetimeExtendedMs,
  value: params.value,
});

export const nodeId = <T>(node: Node<T>): string => node.id;
export const nodeCreated = <T>(node: Node<T>): IsoDatetimeUtcExtendedMs =>
  node.created;
export const nodeValue = <T>(node: Node<T>): T => node.value;
