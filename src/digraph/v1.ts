import { randomUUID } from "node:crypto";
import { createNode } from "../shared.js";
import type { Edge, Node } from "../types.js";
import type { DiGraph } from "./interface.js";
import { newIsoUtc, type IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";

export const creatGraphV1 = <N, E = string>(): DiGraph<N, E> =>
  new DiGraphV1<N, E>();

class DiGraphV1<N, E> implements DiGraph<N, E> {
  private _id: string;
  private _created: IsoDatetimeUtcExtendedMs;
  private _nodes: Node<N>[];
  private _edges: Edge<E>[];

  constructor(params?: {
    id?: string;
    created?: Date;
    nodes?: Node<N>[];
    edges?: Edge<E>[];
  }) {
    this._id = params?.id ?? randomUUID();
    this._created = newIsoUtc(params?.created).datetimeExtendedMs;
    this._nodes = params?.nodes ?? [];
    this._edges = params?.edges ?? [];
  }

  id(): string {
    return this._id;
  }

  created(): IsoDatetimeUtcExtendedMs {
    return this._created;
  }

  hasNodes(): boolean {
    return this._nodes.length > 0;
  }

  hasEdges(): boolean {
    return this._edges.length > 0;
  }

  nodeCount(shouldCount?: ((node: Node<N>) => boolean) | undefined): number {
    return shouldCount
      ? this._nodes.filter(shouldCount).length
      : this._nodes.length;
  }

  edgeCount(shouldCount?: ((edge: Edge<E>) => boolean) | undefined): number {
    return shouldCount
      ? this._edges.filter(shouldCount).length
      : this._edges.length;
  }

  newNode(value: N): Node<N> {
    return {
      id: randomUUID(),
      created: newIsoUtc().datetimeExtendedMs,
      value,
      edgeIdsIn: [],
      edgeIdsOut: [],
    };
  }

  newEdge(params: { fromId: string; toId: string; value: E }): Edge<E> {
    return {
      id: randomUUID(),
      created: newIsoUtc().datetimeExtendedMs,
      fromId: params.fromId,
      toId: params.toId,
      value: params.value,
    };
  }

  nodes(keep?: ((node: Node<N>) => boolean) | undefined): Node<N>[] {
    return keep ? this._nodes.filter(keep) : this._nodes;
  }

  edges(keep?: ((edge: Edge<E>) => boolean) | undefined): Edge<E>[] {
    return keep ? this._edges.filter(keep) : this._edges;
  }

  nodeValues(keep?: ((value: N) => boolean) | undefined): N[] {
    const values = this._nodes.map((n) => n.value);
    return keep ? values.filter(keep) : values;
  }

  edgeValues(keep?: ((value: E) => boolean) | undefined): E[] {
    const values = this._edges.map((n) => n.value);
    return keep ? values.filter(keep) : values;
  }

  filterNodes(keep: (node: Node<N>) => boolean): DiGraph<N, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes().filter(keep),
      edges: this.edges(),
    });
  }

  filterEdges(keep: (edge: Edge<E>) => boolean): DiGraph<N, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes(),
      edges: this.edges().filter(keep),
    });
  }

  filterNodeValues(keep: (value: N) => boolean): DiGraph<N, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes().filter((n) => keep(n.value)),
      edges: this.edges(),
    });
  }

  filterEdgeValues(keep: (value: E) => boolean): DiGraph<N, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes(),
      edges: this.edges().filter((n) => keep(n.value)),
    });
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
      nodes: this.nodes().map(fn),
      edges: this.edges(),
    });
  }

  mapEdges<T>(fn: (edge: Edge<E>) => Edge<T>): DiGraph<N, T> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes(),
      edges: this.edges().map(fn),
    });
  }

  mapNodeValues<T>(fn: (value: N) => T): DiGraph<T, E> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes().map((n) => ({ ...n, value: fn(n.value) })),
      edges: this.edges(),
    });
  }

  mapEdgeValues<T>(fn: (value: E) => T): DiGraph<N, T> {
    return new DiGraphV1({
      id: this.id(),
      created: new Date(this.created()),
      nodes: this.nodes(),
      edges: this.edges().map((n) => ({ ...n, value: fn(n.value) })),
    });
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
}
