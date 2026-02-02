import { describe, test, expect } from "@jest/globals";
import { createGraphV1 } from "../src/digraph-v1.js";
import { newNode, newEdge } from "../src/shared.js";

describe("DiGraphV1", () => {
  describe("basic operations", () => {
    test("create empty graph", () => {
      const g = createGraphV1<string, string>();
      expect(g.id()).toBeTruthy();
      expect(g.created()).toBeTruthy();
      expect(g.hasNodes()).toBe(false);
      expect(g.hasEdges()).toBe(false);
      expect(g.nodeCount()).toBe(0);
      expect(g.edgeCount()).toBe(0);
    });

    test("add nodes to graph", () => {
      const g = createGraphV1<string, string>();
      const node1 = newNode("test1");
      const node2 = newNode("test2");
      const g2 = g.setNode(node1).setNode(node2);

      expect(g2.nodeCount()).toBe(2);
      expect(g2.hasNodes()).toBe(true);
    });

    test("retrieve node by id", () => {
      const g = createGraphV1<string, string>();
      const node = newNode("test");
      const g2 = g.setNode(node);
      const retrieved = g2.getNode(node.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.value).toBe("test");
    });

    test("add edges between nodes", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("node1");
      const n2 = newNode("node2");
      const g2 = g.setNode(n1).setNode(n2);
      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: "edge1" });
      const g3 = g2.setEdge(edge);

      expect(g3.edgeCount()).toBe(1);
      expect(g3.hasEdges()).toBe(true);
    });

    test("retrieve edge by id", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("from");
      const n2 = newNode("to");
      const g2 = g.setNode(n1).setNode(n2);
      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: "connect" });
      const g3 = g2.setEdge(edge);
      const retrieved = g3.getEdge(edge.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.value).toBe("connect");
    });
  });

  describe("immutability", () => {
    test("setNode does not mutate original graph", () => {
      const g1 = createGraphV1<string, string>();
      const node = newNode("test");
      const g2 = g1.setNode(node);

      expect(g1.nodeCount()).toBe(0);
      expect(g2.nodeCount()).toBe(1);
      expect(g1).not.toBe(g2);
    });

    test("setEdge does not mutate original graph", () => {
      const g1 = createGraphV1<string, string>();
      const n1 = newNode("node1");
      const n2 = newNode("node2");
      const g2 = g1.setNode(n1).setNode(n2);
      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: "edge" });
      const g3 = g2.setEdge(edge);

      expect(g2.edgeCount()).toBe(0);
      expect(g3.edgeCount()).toBe(1);
      expect(g2).not.toBe(g3);
    });

    test("multiple operations create independent graphs", () => {
      const g1 = createGraphV1<number, string>();
      const n1 = newNode(1);
      const n2 = newNode(2);
      const g2 = g1.setNode(n1);
      const g3 = g2.setNode(n2);

      expect(g1.nodeCount()).toBe(0);
      expect(g2.nodeCount()).toBe(1);
      expect(g3.nodeCount()).toBe(2);
    });
  });

  describe("edge relationships", () => {
    test("setEdge updates node edge lists", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("from");
      const n2 = newNode("to");
      const g2 = g.setNode(n1).setNode(n2);
      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: "connects" });
      const g3 = g2.setEdge(edge);

      const fromNode = g3.getNode(n1.id);
      const toNode = g3.getNode(n2.id);

      expect(fromNode).toBeDefined();
      expect(toNode).toBeDefined();
      expect(fromNode?.edgeIdsOut).toHaveLength(1);
      expect(fromNode?.edgeIdsOut[0]).toBe(edge.id);
      expect(toNode?.edgeIdsIn).toHaveLength(1);
      expect(toNode?.edgeIdsIn[0]).toBe(edge.id);
    });

    test("node tracks multiple incoming edges", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n3.id, value: "A->C" });
      const e2 = newEdge({ fromId: n2.id, toId: n3.id, value: "B->C" });
      graph = graph.setEdge(e1).setEdge(e2);

      const nodeC = graph.getNode(n3.id);
      expect(nodeC?.edgeIdsIn).toHaveLength(2);
      expect(nodeC?.edgeIdsOut).toHaveLength(0);
    });

    test("node tracks multiple outgoing edges", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: "A->B" });
      const e2 = newEdge({ fromId: n1.id, toId: n3.id, value: "A->C" });
      graph = graph.setEdge(e1).setEdge(e2);

      const nodeA = graph.getNode(n1.id);
      expect(nodeA?.edgeIdsOut).toHaveLength(2);
      expect(nodeA?.edgeIdsIn).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    test("setEdge with invalid fromId returns error", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("valid");
      const g2 = g.setNode(n1);
      const edge = newEdge({
        fromId: "nonexistent",
        toId: n1.id,
        value: "bad",
      });
      const g3 = g2.setEdge(edge);

      expect(g3.error()).toBeDefined();
      expect(g3.error()?.message).toMatch(/undefined edge/);
    });

    test("setEdge with invalid toId returns error", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("valid");
      const g2 = g.setNode(n1);
      const edge = newEdge({
        fromId: n1.id,
        toId: "nonexistent",
        value: "bad",
      });
      const g3 = g2.setEdge(edge);

      expect(g3.error()).toBeDefined();
      expect(g3.error()?.message).toMatch(/undefined edge/);
    });

    test("setEdge with both invalid ids returns error", () => {
      const g = createGraphV1<string, string>();
      const edge = newEdge({
        fromId: "nonexistent1",
        toId: "nonexistent2",
        value: "bad",
      });
      const g2 = g.setEdge(edge);

      expect(g2.error()).toBeDefined();
    });

    test("error propagates through operations", () => {
      const g = createGraphV1<string, string>();
      const badEdge = newEdge({
        fromId: "bad1",
        toId: "bad2",
        value: "edge",
      });
      const g2 = g.setEdge(badEdge);
      const node = newNode("test");
      const g3 = g2.setNode(node);

      expect(g3.error()).toBeDefined();
      expect(g3.nodeCount()).toBe(0);
    });
  });

  describe("filtering operations", () => {
    test("filterNodes keeps matching nodes", () => {
      const g = createGraphV1<{ val: number }, string>();
      const n1 = newNode({ val: 1 });
      const n2 = newNode({ val: 2 });
      const n3 = newNode({ val: 3 });
      const g2 = g.setNode(n1).setNode(n2).setNode(n3);

      const filtered = g2.filterNodes((node) => node.value.val > 1);

      expect(filtered.nodeCount()).toBe(2);
      expect(g2.nodeCount()).toBe(3);
    });

    test("filterNodeValues with predicate", () => {
      const g = createGraphV1<number, string>();
      const g2 = g
        .setNode(newNode(1))
        .setNode(newNode(2))
        .setNode(newNode(3));

      const filtered = g2.filterNodeValues((v) => v % 2 === 0);

      expect(filtered.nodeCount()).toBe(1);
      const values = filtered.nodeValues();
      expect(values).toContain(2);
    });

    test("filterEdges keeps matching edges", () => {
      const g = createGraphV1<string, { weight: number }>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({
        fromId: n1.id,
        toId: n2.id,
        value: { weight: 1 },
      });
      const e2 = newEdge({
        fromId: n2.id,
        toId: n3.id,
        value: { weight: 5 },
      });
      graph = graph.setEdge(e1).setEdge(e2);

      const filtered = graph.filterEdges((edge) => edge.value.weight > 2);

      expect(filtered.edgeCount()).toBe(1);
      expect(graph.edgeCount()).toBe(2);
    });

    test("filterEdgeValues with predicate", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: "keep" });
      const e2 = newEdge({
        fromId: n2.id,
        toId: n3.id,
        value: "remove",
      });
      graph = graph.setEdge(e1).setEdge(e2);

      const filtered = graph.filterEdgeValues((v) => v === "keep");

      expect(filtered.edgeCount()).toBe(1);
    });
  });

  describe("mapping operations", () => {
    test("mapNodeValues transforms values", () => {
      const g = createGraphV1<number, string>();
      const n1 = newNode(1);
      const n2 = newNode(2);
      const g2 = g.setNode(n1).setNode(n2);

      const mapped = g2.mapNodeValues((n) => n * 2);

      const values = mapped.nodeValues();
      expect(values).toHaveLength(2);
      expect(values).toContain(2);
      expect(values).toContain(4);
    });

    test("mapEdgeValues transforms edge values", () => {
      const g = createGraphV1<string, number>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: 5 });
      graph = graph.setEdge(edge);

      const mapped = graph.mapEdgeValues((v) => v * 10);

      const values = mapped.edgeValues();
      expect(values).toHaveLength(1);
      expect(values[0]).toBe(50);
    });

    test("mapNodes transforms entire nodes", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("a");
      const g2 = g.setNode(n1);

      const mapped = g2.mapNodes((node) => ({
        ...node,
        value: node.value.toUpperCase(),
      }));

      const values = mapped.nodeValues();
      expect(values[0]).toBe("A");
    });

    test("mapEdges transforms entire edges", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const edge = newEdge({
        fromId: n1.id,
        toId: n2.id,
        value: "hello",
      });
      graph = graph.setEdge(edge);

      const mapped = graph.mapEdges((e) => ({
        ...e,
        value: e.value.toUpperCase(),
      }));

      const values = mapped.edgeValues();
      expect(values[0]).toBe("HELLO");
    });
  });

  describe("reduce operations", () => {
    test("reduceNodeValues accumulates values", () => {
      const g = createGraphV1<number, string>();
      const g2 = g
        .setNode(newNode(1))
        .setNode(newNode(2))
        .setNode(newNode(3));

      const sum = g2.reduceNodeValues((acc, val) => acc + val, 0);

      expect(sum).toBe(6);
    });

    test("reduceEdgeValues accumulates edge values", () => {
      const g = createGraphV1<string, number>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: 10 });
      const e2 = newEdge({ fromId: n2.id, toId: n3.id, value: 20 });
      graph = graph.setEdge(e1).setEdge(e2);

      const total = graph.reduceEdgeValues((acc, val) => acc + val, 0);

      expect(total).toBe(30);
    });

    test("reduceNodes with complex accumulator", () => {
      const g = createGraphV1<string, string>();
      const g2 = g
        .setNode(newNode("a"))
        .setNode(newNode("b"))
        .setNode(newNode("c"));

      const result = g2.reduceNodes(
        (acc, node) => [...acc, node.value],
        [] as string[],
      );

      expect(result).toHaveLength(3);
      expect(result).toContain("a");
      expect(result).toContain("b");
      expect(result).toContain("c");
    });
  });

  describe("forEach operations", () => {
    test("forEachNode executes for all nodes", () => {
      const g = createGraphV1<number, string>();
      const g2 = g.setNode(newNode(1)).setNode(newNode(2));

      const values: number[] = [];
      g2.forEachNode((node) => values.push(node.value));

      expect(values).toHaveLength(2);
      expect(values).toContain(1);
      expect(values).toContain(2);
    });

    test("forEachNodeValue executes for all values", () => {
      const g = createGraphV1<string, string>();
      const g2 = g.setNode(newNode("a")).setNode(newNode("b"));

      const values: string[] = [];
      g2.forEachNodeValue((val) => values.push(val));

      expect(values).toHaveLength(2);
      expect(values).toContain("a");
      expect(values).toContain("b");
    });

    test("forEachEdge executes for all edges", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const edge = newEdge({
        fromId: n1.id,
        toId: n2.id,
        value: "edge",
      });
      graph = graph.setEdge(edge);

      const values: string[] = [];
      graph.forEachEdge((e) => values.push(e.value));

      expect(values).toHaveLength(1);
      expect(values[0]).toBe("edge");
    });

    test("forEachEdgeValue executes for all edge values", () => {
      const g = createGraphV1<string, number>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: 42 });
      graph = graph.setEdge(edge);

      const values: number[] = [];
      graph.forEachEdgeValue((val) => values.push(val));

      expect(values).toHaveLength(1);
      expect(values[0]).toBe(42);
    });
  });

  describe("query operations", () => {
    test("nodes returns all nodes", () => {
      const g = createGraphV1<string, string>();
      const g2 = g.setNode(newNode("a")).setNode(newNode("b"));

      const nodes = g2.nodes();

      expect(nodes).toHaveLength(2);
    });

    test("nodes with predicate filters results", () => {
      const g = createGraphV1<number, string>();
      const g2 = g
        .setNode(newNode(1))
        .setNode(newNode(2))
        .setNode(newNode(3));

      const nodes = g2.nodes((node) => node.value > 1);

      expect(nodes).toHaveLength(2);
    });

    test("edges returns all edges", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: "e1" });
      graph = graph.setEdge(e1);

      const edges = graph.edges();

      expect(edges).toHaveLength(1);
    });

    test("edges with predicate filters results", () => {
      const g = createGraphV1<string, number>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: 1 });
      const e2 = newEdge({ fromId: n2.id, toId: n3.id, value: 5 });
      graph = graph.setEdge(e1).setEdge(e2);

      const edges = graph.edges((edge) => edge.value > 2);

      expect(edges).toHaveLength(1);
      expect(edges[0].value).toBe(5);
    });

    test("nodeValues returns all node values", () => {
      const g = createGraphV1<string, string>();
      const g2 = g.setNode(newNode("a")).setNode(newNode("b"));

      const values = g2.nodeValues();

      expect(values).toHaveLength(2);
      expect(values).toContain("a");
      expect(values).toContain("b");
    });

    test("edgeValues returns all edge values", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const edge = newEdge({
        fromId: n1.id,
        toId: n2.id,
        value: "connect",
      });
      graph = graph.setEdge(edge);

      const values = graph.edgeValues();

      expect(values).toHaveLength(1);
      expect(values[0]).toBe("connect");
    });

    test("nodeCount with predicate", () => {
      const g = createGraphV1<number, string>();
      const g2 = g
        .setNode(newNode(1))
        .setNode(newNode(2))
        .setNode(newNode(3));

      const count = g2.nodeCount((node) => node.value > 1);

      expect(count).toBe(2);
    });

    test("edgeCount with predicate", () => {
      const g = createGraphV1<string, number>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: 1 });
      const e2 = newEdge({ fromId: n2.id, toId: n3.id, value: 5 });
      graph = graph.setEdge(e1).setEdge(e2);

      const count = graph.edgeCount((edge) => edge.value < 3);

      expect(count).toBe(1);
    });
  });

  describe("JSON serialization", () => {
    test("toJson serializes graph", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("node1");
      const g2 = g.setNode(n1);

      const result = g2.toJson();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(typeof result.value).toBe("string");
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    test("toJson with pretty formatting", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("test");
      const g2 = g.setNode(n1);

      const result = g2.toJson({ pretty: true });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain("\n");
      }
    });

    test("toJson fails on graph with error", () => {
      const g = createGraphV1<string, string>();
      const badEdge = newEdge({ fromId: "x", toId: "y", value: "e" });
      const g2 = g.setEdge(badEdge);

      const result = g2.toJson();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    test("fromJson deserializes graph", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("node1");
      const n2 = newNode("node2");
      const g2 = g.setNode(n1).setNode(n2);

      const jsonResult = g2.toJson();
      expect(jsonResult.ok).toBe(true);

      if (jsonResult.ok) {
        const restored = g2.fromJson(jsonResult.value);
        expect(restored.ok).toBe(true);

        if (restored.ok) {
          expect(restored.value.nodeCount()).toBe(2);
          expect(restored.value.id()).toBe(g2.id());
        }
      }
    });

    test("fromJson round-trip with edges", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const g2 = g.setNode(n1).setNode(n2);
      const edge = newEdge({ fromId: n1.id, toId: n2.id, value: "edge1" });
      const g3 = g2.setEdge(edge);

      const jsonResult = g3.toJson();
      expect(jsonResult.ok).toBe(true);

      if (jsonResult.ok) {
        const restored = g3.fromJson(jsonResult.value);
        expect(restored.ok).toBe(true);

        if (restored.ok) {
          expect(restored.value.nodeCount()).toBe(2);
          expect(restored.value.edgeCount()).toBe(1);
        }
      }
    });

    test("fromJson handles invalid JSON", () => {
      const g = createGraphV1<string, string>();
      const result = g.fromJson("invalid json {{{");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe("match method", () => {
    test("match handles success case", () => {
      const g = createGraphV1<string, string>();
      const node = newNode("test");
      const g2 = g.setNode(node);

      const result = g2.match(
        (graph) => graph.nodeCount(),
        (err) => -1,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(1);
      }
    });

    test("match handles error case", () => {
      const g = createGraphV1<string, string>();
      const badEdge = newEdge({ fromId: "x", toId: "y", value: "e" });
      const g2 = g.setEdge(badEdge);

      const result = g2.match(
        (graph) => "success",
        (err) => err.message,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/undefined edge/);
      }
    });

    test("match success function receives graph", () => {
      const g = createGraphV1<number, string>();
      const g2 = g.setNode(newNode(42));

      const result = g2.match(
        (graph) => graph.nodeValues()[0],
        (err) => 0,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    test("match error function receives error", () => {
      const g = createGraphV1<string, string>();
      const badEdge = newEdge({ fromId: "a", toId: "b", value: "e" });
      const g2 = g.setEdge(badEdge);

      const result = g2.match(
        (graph) => "ok",
        (err) => err.constructor.name,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Error");
      }
    });
  });

  describe("complex graph scenarios", () => {
    test("build graph with multiple edges between same nodes", () => {
      const g = createGraphV1<string, string>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      let graph = g.setNode(n1).setNode(n2);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: "edge1" });
      const e2 = newEdge({ fromId: n1.id, toId: n2.id, value: "edge2" });
      graph = graph.setEdge(e1).setEdge(e2);

      expect(graph.edgeCount()).toBe(2);

      const nodeA = graph.getNode(n1.id);
      expect(nodeA?.edgeIdsOut).toHaveLength(2);
    });

    test("build complex graph structure", () => {
      const g = createGraphV1<string, string>();

      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");

      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: "A->B" });
      const e2 = newEdge({ fromId: n2.id, toId: n3.id, value: "B->C" });
      const e3 = newEdge({ fromId: n1.id, toId: n3.id, value: "A->C" });

      graph = graph.setEdge(e1).setEdge(e2).setEdge(e3);

      expect(graph.nodeCount()).toBe(3);
      expect(graph.edgeCount()).toBe(3);

      const nodeA = graph.getNode(n1.id);
      expect(nodeA?.edgeIdsOut).toHaveLength(2);
      expect(nodeA?.edgeIdsIn).toHaveLength(0);

      const nodeC = graph.getNode(n3.id);
      expect(nodeC?.edgeIdsOut).toHaveLength(0);
      expect(nodeC?.edgeIdsIn).toHaveLength(2);
    });

    test("chain multiple transformations", () => {
      const g = createGraphV1<number, number>();
      const g2 = g
        .setNode(newNode(1))
        .setNode(newNode(2))
        .setNode(newNode(3))
        .setNode(newNode(4));

      const result = g2
        .filterNodeValues((v) => v > 1)
        .mapNodeValues((v) => v * 2)
        .reduceNodeValues((acc, v) => acc + v, 0);

      expect(result).toBe(18);
    });

    test("combine operations on nodes and edges", () => {
      const g = createGraphV1<string, number>();
      const n1 = newNode("A");
      const n2 = newNode("B");
      const n3 = newNode("C");
      let graph = g.setNode(n1).setNode(n2).setNode(n3);

      const e1 = newEdge({ fromId: n1.id, toId: n2.id, value: 10 });
      const e2 = newEdge({ fromId: n2.id, toId: n3.id, value: 20 });
      graph = graph.setEdge(e1).setEdge(e2);

      const totalWeight = graph.reduceEdgeValues((acc, v) => acc + v, 0);
      const nodeCount = graph.nodeCount();

      expect(totalWeight).toBe(30);
      expect(nodeCount).toBe(3);
    });
  });
});
