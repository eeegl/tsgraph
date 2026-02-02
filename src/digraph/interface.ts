import type { IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";
import type { Edge, Node } from "../types.js";

export interface DiGraph<T> {
  id(): string;
  created(): IsoDatetimeUtcExtendedMs;

  hasNodes(): boolean;
  hasEdges(): boolean;

  hasOrphans(): boolean;
  orphans(): Node<T>[];

  hasBadEdges(): boolean;
  badEdges(): Edge<T>[];

  nodeCount(shouldCount?: (node: Node<T>) => boolean): number;
  edgeCount(shouldCount?: (edge: Edge<T>) => boolean): number;

  newNode(value: T): Node<T>;
  newEdge(from: Node<T>, to: Node<T>): Edge<T>;

  addNode(node: Node<T>): DiGraph<T>;
  getNode(id: string): Node<T> | undefined;
  setNode(id: string, node: Node<T>): DiGraph<T>;
  delNode(id: string): DiGraph<T>;
  delNodes(shouldDelete: (node: Node<T>) => boolean): DiGraph<T>;

  addEdge(edge: Edge<T>): DiGraph<T>;
  getEdge(id: string): T | undefined;
  setEdge(id: string, value: T): DiGraph<T>;
  delEdge(id: string): DiGraph<T>;
  delEdges(shouldDelete: (value: T) => boolean): DiGraph<T>;

  values(shouldInclude?: (value: T) => boolean): T[];
  nodes(shouldInclude?: (node: Node<T>) => boolean): Node<T>[];
  edges(shouldInclude?: (edge: Edge<T>) => boolean): Edge<T>[];

  forEachValue(fn: (value: T) => void): DiGraph<T>;
  forEachNode(fn: (node: Node<T>) => void): DiGraph<T>;
  forEachEdge(fn: (edge: Edge<T>) => void): DiGraph<T>;

  mapValues<U>(fn: (value: T) => U): DiGraph<U>;
  mapNodes<U>(fn: (node: Node<T>) => Node<U>): DiGraph<U>;
  mapEdges<U>(fn: (edge: Node<T>) => Node<U>): DiGraph<U>;

  filterValues(shouldInclude: (value: T) => boolean): DiGraph<T>;
  filterNodes(shouldInclude: (node: Node<T>) => boolean): DiGraph<T>;
  filterEdges(shouldInclude: (edge: Edge<T>) => boolean): DiGraph<T>;

  reduceValues<U>(fn: (acc: U, current: T, index: number) => U, start: U): U;
  reduceNodes<U>(fn: (acc: U, current: T, index: number) => U, start: U): U;
  reduceEdges<U>(fn: (acc: U, current: T, index: number) => U, start: U): U;

  toJson(params?: { pretty: boolean }): string;
  fromJson<T>(
    json: string,
  ): { ok: true; graph: DiGraph<T> } | { ok: false; error: Error };
}
