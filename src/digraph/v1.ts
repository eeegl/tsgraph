import { randomUUID } from "node:crypto";
import { createNode } from "../shared.js";
import type { Edge, Node } from "../types.js";
import type { DiGraph } from "./interface.js";
import { newIsoUtc, type IsoDatetimeUtcExtendedMs } from "@eeegl/tstime";

export const creatGraphV1 = <T>(values?: T[]): DiGraph<T> =>
  new DiGraphV1(values);

class DiGraphV1<T> implements DiGraph<T> {
  private _id: string;
  private _created: IsoDatetimeUtcExtendedMs;
  private _nodes: Node<T>[];
  private _edges: Edge<T>[];

  constructor(params?: {
    id?: string;
    created: Date;
    nodes?: Node<T>[];
    edges?: Edge<T>[];
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

  nodeCount(shouldCount?: ((node: Node<T>) => boolean) | undefined): number {
    return shouldCount
      ? this._nodes.filter(shouldCount).length
      : this._nodes.length;
  }

  edgeCount(shouldCount?: ((edge: Edge<T>) => boolean) | undefined): number {
    return shouldCount
      ? this._edges.filter(shouldCount).length
      : this._edges.length;
  }

  newNode(value: T): Node<T> {
    return {
      id: randomUUID(),
      created: newIsoUtc().datetimeExtendedMs,
      value,
      edgesIn: [],
      edgesOut: [],
    };
  }

  newEdge(from: Node<T>, to: Node<T>): Edge<T> {
    return {
      id: randomUUID(),
      created: newIsoUtc().datetimeExtendedMs,
      from,
      to,
    };
  }

  values(shouldInclude?: ((value: T) => boolean) | undefined): T[] {
    const values = this._nodes.map((n) => n.value);
    return shouldInclude ? values.filter(shouldInclude) : values;
  }

  nodes(shouldInclude?: ((node: Node<T>) => boolean) | undefined): Node<T>[] {
    return shouldInclude ? this._nodes.filter(shouldInclude) : this._nodes;
  }

  edges(shouldInclude?: ((edge: Edge<T>) => boolean) | undefined): Edge<T>[] {
    return shouldInclude ? this._edges.filter(shouldInclude) : this._edges;
  }

  //   addNode(node: Node<T>): DiGraph<T> {
  //     //   return new DiGraphV1({ id: this.id(), created: new Date(), edges: this.ed})
  //   }

  //   isOrphan(node: Node<T>): boolean {
  //     return node.edgesIn.length === 0 && node.edgesOut.length === 0;
  //   }

  //   hasOrphans(): boolean {
  //     return this._nodes.some(this.isOrphan);
  //   }

  //   orphans(): Node<T>[] {
  //     return this._nodes.filter(this.isOrphan);
  //   }

  //   isDanglingEdge(edge: Edge<T>): boolean {
  //       return edge.
  //   }
}
