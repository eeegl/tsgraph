import { createNode } from "../shared.js";
import type { Edge, Node } from "../types.js";
import type { DiGraph } from "./interface.js";

export const creatGraphV1 = <T>(values?: T[]): DiGraph<T> =>
  new DiGraphV1(values);

class DiGraphV1<T> implements DiGraph<T> {
  private _nodes: Node<T>[];
  private _edges: Edge<T>[];

  constructor(nodes: Node<T>[] = []) {
    this._nodes = nodes;
  }

  add(value: T): DiGraph<T> {
    return new DiGraphV1([value, ...this.values()]);
  }

  del(filter: (value: T) => boolean): DiGraph<T> {
    return new DiGraphV1(this.values().filter((v) => !filter(v)));
  }

  values(filter?: ((value: T) => boolean) | undefined): T[] {
    return this._nodes
      .map((node) => node.value)
      .filter((v) => (filter ? filter(v) : true));
  }

  nodes(filter?: ((node: Node<T>) => boolean) | undefined): Node<T>[] {
    return filter ? this._nodes.filter(filter) : this._nodes;
  }

  map<U>(fn: (value: T) => U): DiGraph<U> {
    return new DiGraphV1(this.values().map(fn));
  }

  filter(fn: (value: T) => boolean): DiGraph<T> {
    return new DiGraphV1(this.values().filter(fn));
  }

  reduce<U>(fn: (acc: U, current: T, index: number) => U, start: U): U {
    return this.values().reduce(fn, start);
  }

  numNodes(): number {
    return this._nodes.length;
  }

  isEmpty(): boolean {
    return this.numNodes() !== 0;
  }
}
