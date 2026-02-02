# @eeegl/tsgraph

A TypeScript library for immutable directed graphs with functional operations.

## Installation

```bash
npm install @eeegl/tsgraph
```

## Quick Start

```typescript
import { creatGraphV1 } from "@eeegl/tsgraph";

const graph = creatGraphV1<string, string>();

const nodeA = graph.newNode("A");
const nodeB = graph.newNode("B");

const g = graph
  .setNode(nodeA)
  .setNode(nodeB)
  .setEdge(graph.newEdge({ fromId: nodeA.id, toId: nodeB.id, value: "connects" }));

console.log(g.nodeCount()); // 2
console.log(g.edgeCount()); // 1
```

## Features

- Fully immutable operations
- Type-safe with TypeScript generics
- Functional programming style (map, filter, reduce)
- Error handling with Result types
- JSON serialization/deserialization
- Zero dependencies (except `@eeegl/tstime` for timestamps)

## API Reference

### Creating a Graph

#### `creatGraphV1<N, E>()`

Creates a new empty directed graph.

**Type Parameters:**
- `N` - Type of node values
- `E` - Type of edge values (defaults to `string`)

**Returns:** `DiGraph<N, E>`

**Example:**
```typescript
const graph = creatGraphV1<number, string>();
```

### Graph Properties

#### `id(): string`

Returns the unique identifier of the graph.

#### `created(): IsoDatetimeUtcExtendedMs`

Returns the creation timestamp of the graph in ISO format.

#### `error(): Error | undefined`

Returns the error state of the graph, or `undefined` if no error exists.

#### `hasNodes(): boolean`

Returns `true` if the graph contains any nodes.

#### `hasEdges(): boolean`

Returns `true` if the graph contains any edges.

#### `nodeCount(predicate?: (node: Node<N>) => boolean): number`

Returns the count of nodes. If predicate is provided, counts only matching nodes.

**Example:**
```typescript
const total = graph.nodeCount();
const filtered = graph.nodeCount(node => node.value > 10);
```

#### `edgeCount(predicate?: (edge: Edge<E>) => boolean): number`

Returns the count of edges. If predicate is provided, counts only matching edges.

### Creating Nodes and Edges

#### `newNode(value: N): Node<N>`

Creates a new node with the given value. The node has a unique ID and timestamp.

**Example:**
```typescript
const node = graph.newNode({ name: "Alice", age: 30 });
```

#### `newEdge(params: { fromId: string; toId: string; value: E }): Edge<E>`

Creates a new edge connecting two nodes.

**Example:**
```typescript
const edge = graph.newEdge({
  fromId: nodeA.id,
  toId: nodeB.id,
  value: "follows"
});
```

### Modifying the Graph

#### `setNode(node: Node<N>): DiGraph<N, E>`

Adds or updates a node in the graph. Returns a new graph instance.

**Example:**
```typescript
const node = graph.newNode("value");
const newGraph = graph.setNode(node);
```

#### `setEdge(edge: Edge<E>): DiGraph<N, E>`

Adds an edge to the graph. Both nodes must exist. Updates the edge lists of connected nodes. Returns a new graph instance or a graph with an error if nodes don't exist.

**Example:**
```typescript
const edge = graph.newEdge({ fromId: n1.id, toId: n2.id, value: "edge" });
const newGraph = graph.setEdge(edge);
```

### Querying the Graph

#### `getNode(id: string): Node<N> | undefined`

Retrieves a node by its ID.

**Example:**
```typescript
const node = graph.getNode("node-id");
if (node) {
  console.log(node.value);
}
```

#### `getEdge(id: string): Edge<E> | undefined`

Retrieves an edge by its ID.

#### `nodes(predicate?: (node: Node<N>) => boolean): Node<N>[]`

Returns all nodes, optionally filtered by predicate.

**Example:**
```typescript
const allNodes = graph.nodes();
const filtered = graph.nodes(node => node.value > 5);
```

#### `edges(predicate?: (edge: Edge<E>) => boolean): Edge<E>[]`

Returns all edges, optionally filtered by predicate.

#### `nodeValues(predicate?: (value: N) => boolean): N[]`

Returns all node values, optionally filtered by predicate.

**Example:**
```typescript
const values = graph.nodeValues();
const positives = graph.nodeValues(v => v > 0);
```

#### `edgeValues(predicate?: (value: E) => boolean): E[]`

Returns all edge values, optionally filtered by predicate.

### Filtering

#### `filterNodes(predicate: (node: Node<N>) => boolean): DiGraph<N, E>`

Returns a new graph containing only nodes that match the predicate.

**Example:**
```typescript
const filtered = graph.filterNodes(node => node.value.active);
```

#### `filterEdges(predicate: (edge: Edge<E>) => boolean): DiGraph<N, E>`

Returns a new graph containing only edges that match the predicate.

#### `filterNodeValues(predicate: (value: N) => boolean): DiGraph<N, E>`

Filters nodes by their values.

**Example:**
```typescript
const filtered = graph.filterNodeValues(v => v > 10);
```

#### `filterEdgeValues(predicate: (value: E) => boolean): DiGraph<N, E>`

Filters edges by their values.

### Mapping

#### `mapNodes<T>(fn: (node: Node<N>) => Node<T>): DiGraph<T, E>`

Transforms all nodes and returns a new graph with different node type.

**Example:**
```typescript
const transformed = graph.mapNodes(node => ({
  ...node,
  value: node.value * 2
}));
```

#### `mapEdges<T>(fn: (edge: Edge<E>) => Edge<T>): DiGraph<N, T>`

Transforms all edges and returns a new graph with different edge type.

#### `mapNodeValues<T>(fn: (value: N) => T): DiGraph<T, E>`

Transforms node values.

**Example:**
```typescript
const stringGraph = graph.mapNodeValues(n => n.toString());
```

#### `mapEdgeValues<T>(fn: (value: E) => T): DiGraph<N, T>`

Transforms edge values.

### Reducing

#### `reduceNodes<T>(fn: (acc: T, current: Node<N>, index: number) => T, start: T): T`

Reduces all nodes to a single value.

**Example:**
```typescript
const sum = graph.reduceNodes((acc, node) => acc + node.value, 0);
```

#### `reduceEdges<T>(fn: (acc: T, current: Edge<E>, index: number) => T, start: T): T`

Reduces all edges to a single value.

#### `reduceNodeValues<T>(fn: (acc: T, current: N, index: number) => T, start: T): T`

Reduces node values.

**Example:**
```typescript
const total = graph.reduceNodeValues((sum, val) => sum + val, 0);
```

#### `reduceEdgeValues<T>(fn: (acc: T, current: E, index: number) => T, start: T): T`

Reduces edge values.

### Iteration

#### `forEachNode(fn: (node: Node<N>) => void): DiGraph<N, E>`

Executes a function for each node. Returns the same graph for chaining.

**Example:**
```typescript
graph.forEachNode(node => console.log(node.value));
```

#### `forEachEdge(fn: (edge: Edge<E>) => void): DiGraph<N, E>`

Executes a function for each edge.

#### `forEachNodeValue(fn: (value: N) => void): DiGraph<N, E>`

Executes a function for each node value.

#### `forEachEdgeValue(fn: (value: E) => void): DiGraph<N, E>`

Executes a function for each edge value.

### Error Handling

#### `match<T, ErrT>(successFn: (graph: DiGraph<N, E>) => T, errorFn: (e: Error) => ErrT): Result<T, ErrT>`

Pattern matching for error handling. Executes `successFn` if no error exists, otherwise executes `errorFn`.

**Example:**
```typescript
const result = graph.match(
  g => g.nodeCount(),
  err => {
    console.error(err.message);
    return -1;
  }
);

if (result.ok) {
  console.log("Node count:", result.value);
} else {
  console.log("Error result:", result.error);
}
```

### Serialization

#### `toJson(params?: { pretty: boolean }): Result<string, Error>`

Serializes the graph to JSON string. Returns a Result type.

**Example:**
```typescript
const result = graph.toJson({ pretty: true });
if (result.ok) {
  console.log(result.value);
}
```

#### `fromJson<N, E>(json: string): Result<DiGraph<N, E>, Error>`

Deserializes a graph from JSON string. Returns a Result type.

**Example:**
```typescript
const result = graph.fromJson(jsonString);
if (result.ok) {
  const restoredGraph = result.value;
}
```

## Types

### `Node<T>`

```typescript
type Node<T> = {
  id: string;
  url: "github.com/eeegl/tsgraph/node";
  type: "node";
  created: IsoDatetimeUtcExtendedMs;
  value: T;
  edgeIdsOut: string[];  // IDs of outgoing edges
  edgeIdsIn: string[];   // IDs of incoming edges
};
```

### `Edge<T>`

```typescript
type Edge<T> = {
  id: string;
  url: "github.com/eeegl/tsgraph/edge";
  type: "edge";
  created: IsoDatetimeUtcExtendedMs;
  fromId: string;  // Source node ID
  toId: string;    // Target node ID
  value: T;
};
```

### `Result<T, ErrT>`

```typescript
type Result<T, ErrT> =
  | { ok: true; value: T }
  | { ok: false; error: ErrT };
```

## Examples

### Building a Graph

```typescript
const graph = creatGraphV1<string, number>();

const nodes = ["A", "B", "C"].map(v => graph.newNode(v));
let g = graph;

for (const node of nodes) {
  g = g.setNode(node);
}

const edge1 = g.newEdge({ fromId: nodes[0].id, toId: nodes[1].id, value: 1 });
const edge2 = g.newEdge({ fromId: nodes[1].id, toId: nodes[2].id, value: 2 });

g = g.setEdge(edge1).setEdge(edge2);

console.log(g.nodeCount()); // 3
console.log(g.edgeCount()); // 2
```

### Filtering and Mapping

```typescript
const graph = creatGraphV1<number, string>()
  .setNode(graph.newNode(1))
  .setNode(graph.newNode(2))
  .setNode(graph.newNode(3))
  .setNode(graph.newNode(4));

const result = graph
  .filterNodeValues(v => v % 2 === 0)
  .mapNodeValues(v => v * 10)
  .reduceNodeValues((sum, v) => sum + v, 0);

console.log(result); // 60 (20 + 40)
```

### Error Handling

```typescript
const graph = creatGraphV1<string, string>();
const node = graph.newNode("A");
const g = graph.setNode(node);

const badEdge = g.newEdge({
  fromId: node.id,
  toId: "nonexistent",
  value: "error"
});

const g2 = g.setEdge(badEdge);

const result = g2.match(
  graph => `Success: ${graph.nodeCount()} nodes`,
  err => `Failed: ${err.message}`
);

if (!result.ok) {
  console.log(result.error); // "Failed: undefined edge: fromId=...; toId=nonexistent"
}
```

### JSON Round-Trip

```typescript
const original = creatGraphV1<string, string>()
  .setNode(original.newNode("A"))
  .setNode(original.newNode("B"));

const jsonResult = original.toJson({ pretty: true });

if (jsonResult.ok) {
  const restored = original.fromJson(jsonResult.value);

  if (restored.ok) {
    console.log(restored.value.nodeCount()); // 2
    console.log(restored.value.id() === original.id()); // true
  }
}
```

## Development

```bash
npm install
npm test
npm run test:watch
```

## License

ISC
