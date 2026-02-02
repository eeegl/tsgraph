import type { IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";
import type { Edge, Node, Result } from "../types.js";

export interface DiGraph<N, E> {
  id(): string;
  created(): IsoDatetimeUtcExtendedMs;

  error(): Error | undefined;
  match<T, ErrT>(
    fn: (graph: DiGraph<N, E>) => T,
    errorFn: (e: Error) => ErrT,
  ): { ok: true; value: T } | { ok: false; error: ErrT };

  hasNodes(): boolean;
  hasEdges(): boolean;

  nodeCount(shouldCount?: (node: Node<N>) => boolean): number;
  edgeCount(shouldCount?: (edge: Edge<E>) => boolean): number;

  newNode(value: N): Node<N>;
  newEdge(params: { fromId: string; toId: string; value: E }): Edge<E>;

  nodes(keep?: (node: Node<N>) => boolean): Node<N>[];
  edges(keep?: (edge: Edge<E>) => boolean): Edge<E>[];
  nodeValues(keep?: (value: N) => boolean): N[];
  edgeValues(keep?: (value: E) => boolean): E[];

  filterNodes(keep: (node: Node<N>) => boolean): DiGraph<N, E>;
  filterEdges(keep: (edge: Edge<E>) => boolean): DiGraph<N, E>;
  filterNodeValues(keep: (value: N) => boolean): DiGraph<N, E>;
  filterEdgeValues(keep: (value: E) => boolean): DiGraph<N, E>;

  forEachNode(fn: (node: Node<N>) => void): DiGraph<N, E>;
  forEachEdge(fn: (edge: Edge<E>) => void): DiGraph<N, E>;
  forEachNodeValue(fn: (value: N) => void): DiGraph<N, E>;
  forEachEdgeValue(fn: (value: E) => void): DiGraph<N, E>;

  mapNodes<T>(fn: (node: Node<N>) => Node<T>): DiGraph<T, E>;
  mapEdges<T>(fn: (edge: Edge<E>) => Edge<T>): DiGraph<N, T>;
  mapNodeValues<T>(fn: (value: N) => T): DiGraph<T, E>;
  mapEdgeValues<T>(fn: (value: E) => T): DiGraph<N, T>;

  reduceNodes<T>(
    fn: (acc: T, current: Node<N>, index: number) => T,
    start: T,
  ): T;
  reduceEdges<T>(
    fn: (acc: T, current: Edge<E>, index: number) => T,
    start: T,
  ): T;
  reduceNodeValues<T>(
    fn: (acc: T, current: N, index: number) => T,
    start: T,
  ): T;
  reduceEdgeValues<T>(
    fn: (acc: T, current: E, index: number) => T,
    start: T,
  ): T;

  setNode(node: Node<N>): DiGraph<N, E>;
  getNode(id: string): Node<N> | undefined;

  setEdge(edge: Edge<E>): DiGraph<N, E>;
  getEdge(id: string): Edge<E> | undefined;

  toJson(params?: { pretty: boolean }): Result<string, Error>;
  fromJson<N, E>(json: string): Result<DiGraph<N, E>, Error>;
}
