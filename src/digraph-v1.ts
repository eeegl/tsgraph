import { randomUUID } from "node:crypto";
import type { Edge, Node, Result } from "./types.js";
import type { DiGraph } from "./digraph-interface.js";
import { newIsoUtc, type IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";
import { _err, _ok } from "./shared.js";

export const createGraphV1 = <N, E = string>(): DiGraph<N, E> =>
  new DiGraphV1<N, E>();

class DiGraphV1<N, E> implements DiGraph<N, E> {
  private _error?: Error | undefined;
  private _id: string;
  private _created: IsoDatetimeUtcExtendedMs;
  private _nodes: Map<string, Node<N>>;
  private _edges: Map<string, Edge<E>>;

  constructor(params?: {
    error?: Error;
    id?: string;
    created?: Date;
    nodes?: Map<string, Node<N>>;
    edges?: Map<string, Edge<E>>;
  }) {
    this._error = params?.error;
    this._id = params?.id ?? randomUUID();
    this._created = newIsoUtc(params?.created).datetimeExtendedMs;
    this._nodes = params?.nodes ?? new Map();
    this._edges = params?.edges ?? new Map();
  }

  id(): string {
    return this._id;
  }

  created(): IsoDatetimeUtcExtendedMs {
    return this._created;
  }

  error(): Error | undefined {
    return this._error;
  }

  match<T, ErrT>(
    successFn: (graph: DiGraph<N, E>) => T,
    errorFn: (e: Error) => ErrT,
  ): Result<T, ErrT> {
    const error = this.error();
    return error === undefined
      ? { ok: true, value: successFn(this) }
      : { ok: false, error: errorFn(error) };
  }

  hasNodes(): boolean {
    return this._nodes.size > 0;
  }

  hasEdges(): boolean {
    return this._edges.size > 0;
  }

  nodeCount(shouldCount?: ((node: Node<N>) => boolean) | undefined): number {
    return shouldCount
      ? this.nodes().filter(shouldCount).length
      : this.nodes().length;
  }

  edgeCount(shouldCount?: ((edge: Edge<E>) => boolean) | undefined): number {
    return shouldCount
      ? this.edges().filter(shouldCount).length
      : this.edges().length;
  }

  nodes(keep?: ((node: Node<N>) => boolean) | undefined): Node<N>[] {
    const nodes = Array.from(this._nodes.values());
    return keep ? nodes.filter(keep) : nodes;
  }

  edges(keep?: ((edge: Edge<E>) => boolean) | undefined): Edge<E>[] {
    const edges = Array.from(this._edges.values());
    return keep ? edges.filter(keep) : edges;
  }

  nodeValues(keep?: ((value: N) => boolean) | undefined): N[] {
    const values = this.nodes().map((n) => n.value);
    return keep ? values.filter(keep) : values;
  }

  edgeValues(keep?: ((value: E) => boolean) | undefined): E[] {
    const values = this.edges().map((n) => n.value);
    return keep ? values.filter(keep) : values;
  }

  filterNodes(keep: (node: Node<N>) => boolean): DiGraph<N, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: new Map(Array.from(this._nodes).filter(([, node]) => keep(node))),
      edges: this._edges,
    });
  }

  filterEdges(keep: (edge: Edge<E>) => boolean): DiGraph<N, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this._nodes,
      edges: new Map(Array.from(this._edges).filter(([, edge]) => keep(edge))),
    });
  }

  filterNodeValues(keep: (value: N) => boolean): DiGraph<N, E> {
    return this.filterNodes((node) => keep(node.value));
  }

  filterEdgeValues(keep: (value: E) => boolean): DiGraph<N, E> {
    return this.filterEdges((edge) => keep(edge.value));
  }

  forEachNode(fn: (node: Node<N>) => void): DiGraph<N, E> {
    this.nodes().forEach(fn);
    return this;
  }

  forEachEdge(fn: (edge: Edge<E>) => void): DiGraph<N, E> {
    this.edges().forEach(fn);
    return this;
  }

  forEachNodeValue(fn: (value: N) => void): DiGraph<N, E> {
    this.nodeValues().forEach(fn);
    return this;
  }

  forEachEdgeValue(fn: (value: E) => void): DiGraph<N, E> {
    this.edgeValues().forEach(fn);
    return this;
  }

  mapNodes<T>(fn: (node: Node<N>) => Node<T>): DiGraph<T, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: new Map(this._nodes.entries().map(([id, node]) => [id, fn(node)])),
      edges: this._edges,
    });
  }

  mapEdges<T>(fn: (edge: Edge<E>) => Edge<T>): DiGraph<N, T> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this._nodes,
      edges: new Map(this._edges.entries().map(([id, edge]) => [id, fn(edge)])),
    });
  }

  mapNodeValues<T>(fn: (value: N) => T): DiGraph<T, E> {
    return this.mapNodes((node) => ({ ...node, value: fn(node.value) }));
  }

  mapEdgeValues<T>(fn: (value: E) => T): DiGraph<N, T> {
    return this.mapEdges((edge) => ({ ...edge, value: fn(edge.value) }));
  }

  reduceNodes<T>(
    fn: (acc: T, current: Node<N>, index: number) => T,
    start: T,
  ): T {
    return this.nodes().reduce(fn, start);
  }

  reduceEdges<T>(
    fn: (acc: T, current: Edge<E>, index: number) => T,
    start: T,
  ): T {
    return this.edges().reduce(fn, start);
  }

  reduceNodeValues<T>(
    fn: (acc: T, current: N, index: number) => T,
    start: T,
  ): T {
    return this.nodeValues().reduce(fn, start);
  }

  reduceEdgeValues<T>(
    fn: (acc: T, current: E, index: number) => T,
    start: T,
  ): T {
    return this.edgeValues().reduce(fn, start);
  }

  setNode(node: Node<N>): DiGraph<N, E> {
    if (this.error()) return this;
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: new Map(this._nodes).set(node.id, node),
      edges: this._edges,
    });
  }

  getNode(id: string): Node<N> | undefined {
    return this._nodes.get(id);
  }

  setEdge(edge: Edge<E>): DiGraph<N, E> {
    if (this.error()) return this;

    const from = this.getNode(edge.fromId);
    const to = this.getNode(edge.toId);

    if (!from || !to) {
      return new DiGraphV1({
        error: new Error(
          `undefined edge: fromId=${edge.fromId}; toId=${edge.toId}`,
        ),
        id: this.id(),
        created: new Date(this.created()),
        nodes: this._nodes,
        edges: this._edges,
      });
    }

    const newEdges = new Map(this._edges);
    newEdges.set(edge.id, edge);

    const graph = new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this._nodes,
      edges: newEdges,
    });

    return graph
      .setNode({
        ...from,
        edgeIdsOut: [edge.id, ...from.edgeIdsOut],
      })
      .setNode({ ...to, edgeIdsIn: [edge.id, ...to.edgeIdsIn] });
  }

  getEdge(id: string): Edge<E> | undefined {
    return this._edges.get(id);
  }

  toJson(params?: { pretty: boolean }): Result<string, Error> {
    const error = this.error();
    if (error) return _err(error);

    try {
      const { pretty = false } = params ?? {};
      const serializable = {
        _id: this._id,
        _created: this._created,
        _nodes: Object.fromEntries(this._nodes),
        _edges: Object.fromEntries(this._edges),
        _error: this._error,
      };
      const json = JSON.stringify(serializable, null, pretty ? 2 : 0);
      return _ok(json);
    } catch (x: unknown) {
      return _err(
        x instanceof Error ? x : new Error("unknown error: " + String(x)),
      );
    }
  }

  fromJson<N, E>(json: string): Result<DiGraph<N, E>, Error> {
    try {
      const parsed = JSON.parse(json);

      const nodes = new Map(
        Object.entries(parsed._nodes ?? {}).map(([id, node]: [string, any]) => [
          id,
          node,
        ]),
      );

      const edges = new Map(
        Object.entries(parsed._edges ?? {}).map(([id, edge]: [string, any]) => [
          id,
          edge,
        ]),
      );

      const graph = new DiGraphV1<N, E>({
        id: parsed._id,
        created: parsed._created ? new Date(parsed._created) : new Date(),
        nodes,
        edges,
        error: parsed._error,
      });

      return _ok(graph);
    } catch (x: unknown) {
      return _err(
        x instanceof Error ? x : new Error("unknown error: " + String(x)),
      );
    }
  }
}
