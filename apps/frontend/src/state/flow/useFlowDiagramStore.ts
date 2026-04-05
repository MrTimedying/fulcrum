/**
 * @deprecated THIS STORE IS LEGACY AND SHOULD BE REFACTORED.
 * Extracts flow logic from flowState.js into a modular TypeScript store.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  Connection, 
  ReconnectEdgeFunction,
  NodeChange,
  EdgeChange
} from "@xyflow/react";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { 
  remapNodesAndEdgesWithNewIds, 
  clearDatesFromNodes, 
  offsetNodesEdgesPosition 
} from "../../components/utils";
import { 
  getProfileComposerTemplates, 
  getEditorComposerTemplates 
} from "../../components/variables";
import { getLayoutedElements, elkOptions } from "../utils/layoutEngine";
import { resequenceSiblingOrders } from "../utils/resequence";

export interface FlowDiagramState {
  nodes: Node[];
  edges: Edge[];
  clipboard: { nodes: Node[]; edges: Edge[] };
  selectedNodeId: string | null;
  columnsLayout: any[];
  rowsData: any[];

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: ReconnectEdgeFunction;
  setNodes: (payload: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  cutNodesEdges: () => void;
  copyNodesEdges: () => void;
  pasteNodesEdges: (position?: { x: number; y: number }, reactFlowInstance?: any) => void;
  deleteSelectedNodesEdges: () => void;
  updateNodeData: (field: string, value: any, nodeId?: string | null) => void;
  updateNodeById: (id: string, date: string) => void;
  updateNodeTestData: (id: string, testData: any[]) => void;
  updateNodeExerciseData: (id: string, exerciseData: any[]) => void;
  batchUpdateNodesExerciseData: (updatesMap: Record<string, any>) => Promise<void>;
  addTest: (testData: any) => void;
  updateTestData: (nodeId: string, testId: string, updatedData: any) => void;
  deleteTests: (nodeId: string, testIds: string[]) => void;
  applyLayout: (direction?: string) => void;
  hybridLayout: (direction?: string) => Promise<void>;
  stackSessionNodes: () => void;
  updateColumnsForSelectedNode: (activeTab: "Profile" | "Editor") => void;
  setColumnsLayout: (layout: any[]) => void;
  dumpClipboard: () => void;
  hydrateFlowState: (nodes: Node[], edges: Edge[]) => void;
}

export const useFlowDiagramStore = create<FlowDiagramState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      clipboard: { nodes: [], edges: [] },
      selectedNodeId: null,
      columnsLayout: [],
      rowsData: [],

      onNodesChange: (changes: NodeChange[]) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
        }));
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        const currentEdges = get().edges;
        const currentNodes = get().nodes;
        const parentIdsToResequence = new Set<string>();

        changes.forEach((change) => {
          if (change.type === "remove") {
            const edgeToRemove = currentEdges.find((edge) => edge.id === change.id);
            if (edgeToRemove) {
              const sourceId = edgeToRemove.source;
              const targetId = edgeToRemove.target;
              const targetNode = currentNodes.find((node) => node.id === targetId);

              if (targetNode) {
                // We shouldn't directly mutate targetNode. We'll handle it below.
                parentIdsToResequence.add(sourceId);
              }
            }
          }
        });

        set((state) => {
          const newEdges = applyEdgeChanges(changes, state.edges);
          let newNodes = [...state.nodes];

          if (parentIdsToResequence.size > 0) {
            // Find target nodes of removed edges and reset their order
            changes.forEach((change) => {
              if (change.type === "remove") {
                const edgeToRemove = currentEdges.find((edge) => edge.id === change.id);
                if (edgeToRemove) {
                  const targetId = edgeToRemove.target;
                  newNodes = newNodes.map((node) => 
                    node.id === targetId ? { ...node, data: { ...node.data, order: null } } : node
                  );
                }
              }
            });

            parentIdsToResequence.forEach((parentId) => {
              newNodes = resequenceSiblingOrders(parentId, newNodes, newEdges);
            });
          }

          return {
            edges: newEdges,
            nodes: newNodes,
          };
        });
      },

      onConnect: (params: Connection) => {
        const { nodes, edges } = get();
        const sourceNode = nodes.find((node) => node.id === params.source);
        const targetNode = nodes.find((node) => node.id === params.target);

        if (!sourceNode || !targetNode || !params.source || !params.target) return;

        const validConnections: Record<string, string[]> = {
          intervention: ["phase"],
          phase: ["micro"],
          micro: ["session"],
        };

        const allowedTargetTypes = validConnections[sourceNode.type || ""] || [];
        if (!allowedTargetTypes.includes(targetNode.type || "")) return;

        const existingEdges = edges.filter((edge) => edge.source === params.source);
        const newNodes = nodes.map((node) => 
          node.id === params.target ? { ...node, data: { ...node.data, order: existingEdges.length + 1 } } : node
        );

        const newEdges = addEdge(params, edges);

        set({
          nodes: newNodes,
          edges: newEdges,
        });
      },

      onReconnect: (oldEdge: Edge, newConnection: Connection) => {
        const { nodes, edges } = get();
        const oldSourceId = oldEdge.source;
        const targetId = oldEdge.target;
        const newSourceId = newConnection.source;

        if (!newSourceId) return;

        let updatedEdges = edges.filter(
          (edge) => !(edge.source === oldSourceId && edge.target === targetId)
        );

        let updatedNodes = [...nodes];

        if (oldSourceId) {
          updatedNodes = resequenceSiblingOrders(oldSourceId, updatedNodes, updatedEdges);
        }

        updatedEdges.push({
          ...newConnection,
          id: `e-${uuidv4()}`,
        } as Edge);

        const existingEdges = updatedEdges.filter((edge) => edge.source === newSourceId);

        updatedNodes = updatedNodes.map((node) => 
          node.id === targetId ? { ...node, data: { ...node.data, order: existingEdges.length } } : node
        );

        updatedNodes = resequenceSiblingOrders(newSourceId, updatedNodes, updatedEdges);

        set({
          nodes: updatedNodes,
          edges: updatedEdges,
        });
      },

      setNodes: (payload) => {
        set((state) => ({
          nodes: typeof payload === "function" ? payload(state.nodes) : payload,
        }));
      },

      setEdges: (payload) => {
        set((state) => ({
          edges: typeof payload === "function" ? payload(state.edges) : payload,
        }));
      },

      cutNodesEdges: () =>
        set((state) => {
          const nodesToCut = state.nodes.filter((n) => n.selected && n.type !== "intervention");
          const edgesToCut = state.edges.filter((e) => e.selected);
          const remainingNodes = state.nodes.filter((n) => !n.selected);
          const remainingEdges = state.edges.filter((e) => !e.selected);

          return {
            clipboard: {
              nodes: _.cloneDeep(nodesToCut),
              edges: _.cloneDeep(edgesToCut),
            },
            nodes: remainingNodes,
            edges: remainingEdges,
          };
        }),

      copyNodesEdges: () =>
        set((state) => {
          const nodesToCopy = state.nodes.filter((n) => n.selected && n.type !== "intervention");
          const edgesToCopy = state.edges.filter((e) => e.selected);
          return {
            clipboard: {
              nodes: _.cloneDeep(nodesToCopy),
              edges: _.cloneDeep(edgesToCopy),
            },
          };
        }),

      pasteNodesEdges: (position, reactFlowInstance = null) => {
        set((state) => {
          const { clipboard } = state;
          if (!clipboard || !clipboard.nodes || clipboard.nodes.length === 0) return state;

          const { newNodes, newEdges } = remapNodesAndEdgesWithNewIds(
            clearDatesFromNodes(clipboard.nodes),
            clipboard.edges || []
          );

          if (!newNodes || newNodes.length === 0) return state;

          const nodesWithoutOrder = newNodes.map((node: Node) => ({
            ...node,
            data: { ...node.data, order: null },
          }));

          let pastePosition = position || { x: 400, y: 400 };

          if (!position && reactFlowInstance) {
            const { x, y, zoom } = reactFlowInstance.getViewport();
            const { width, height } = reactFlowInstance.getContainer().getBoundingClientRect();
            pastePosition = {
              x: (width / 2 - x) / zoom,
              y: (height / 2 - y) / zoom,
            };
          }

          const { offsetedNodes, offsetedEdges } = offsetNodesEdgesPosition(
            nodesWithoutOrder,
            newEdges,
            pastePosition.x,
            pastePosition.y
          );

          const validNodes = offsetedNodes.filter((node: Node) => {
            if (!node.id) return false;
            node.selected = false;
            return true;
          });

          const validEdges = offsetedEdges.filter((edge: Edge) => {
            if (!edge.id || !edge.source || !edge.target) return false;
            edge.selected = false;
            return true;
          });

          return {
            nodes: [...state.nodes, ...validNodes],
            edges: [...state.edges, ...validEdges],
          };
        });
      },

      deleteSelectedNodesEdges: () => {
        const { nodes, edges } = get();
        const selectedNodes = nodes.filter((n) => n.selected);
        const parentIdsToResequence = new Set<string>();

        selectedNodes.forEach((node) => {
          edges.forEach((edge) => {
            if (edge.target === node.id && !selectedNodes.some((n) => n.id === edge.source)) {
              parentIdsToResequence.add(edge.source);
            }
          });
        });

        set((state) => {
          const remainingNodes = state.nodes.filter((n) => !n.selected);
          const remainingEdges = state.edges.filter(
            (edge) =>
              !edge.selected &&
              !selectedNodes.some((node) => node.id === edge.source) &&
              !selectedNodes.some((node) => edge.target === node.id)
          );

          let updatedNodes = [...remainingNodes];
          if (parentIdsToResequence.size > 0) {
            parentIdsToResequence.forEach((parentId) => {
              updatedNodes = resequenceSiblingOrders(parentId, updatedNodes, remainingEdges);
            });
          }

          return {
            nodes: updatedNodes,
            edges: remainingEdges,
          };
        });
      },

      updateNodeData: (field, value, nodeId = null) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            const isTarget = nodeId ? node.id === nodeId : node.selected;
            return isTarget ? { ...node, data: { ...node.data, [field]: value } } : node;
          }),
        }));
      },

      updateNodeById: (id, date) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? _.set(_.cloneDeep(node), "data.date", date) : node
          ),
        })),

      updateNodeTestData: (id, testData) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? _.set(_.cloneDeep(node), "data.tests", testData) : node
          ),
        })),

      updateNodeExerciseData: (id, exerciseData) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? _.set(_.cloneDeep(node), "data.exercises", exerciseData) : node
          ),
        })),

      batchUpdateNodesExerciseData: async (updatesMap) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (updatesMap[node.id]) {
              const updatedExercises = { ...node.data?.exercises, ...updatesMap[node.id] };
              return { ...node, data: { ...node.data, exercises: updatedExercises } };
            }
            return node;
          }),
        }));
      },

      addTest: (testData) => {
        const selectedNode = get().nodes.find((node) => node.selected);
        if (selectedNode && selectedNode.type === "session") {
          const newTest = { id: uuidv4(), ...testData };
          const updatedTests = [...(selectedNode.data.tests || []), newTest];
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.id === selectedNode.id ? { ...n, data: { ...n.data, tests: updatedTests } } : n
            ),
          }));
        }
      },

      updateTestData: (nodeId, testId, updatedData) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    tests: (node.data.tests || []).map((test: any) =>
                      test.id === testId ? { ...test, ...updatedData } : test
                    ),
                  },
                }
              : node
          ),
        }));
      },

      deleteTests: (nodeId, testIds) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    tests: (node.data.tests || []).filter((test: any) => !testIds.includes(test.id)),
                  },
                }
              : node
          ),
        }));
      },

      applyLayout: (direction = "TB") => {
        if (direction === "TB") {
          get().hybridLayout(direction);
          return;
        }

        const { nodes, edges } = get();
        if (!nodes || nodes.length === 0) return;

        const elkDirection = direction === "LR" ? "RIGHT" : direction;
        const options = { ...elkOptions, "elk.direction": elkDirection };

        getLayoutedElements(nodes, edges, options)
          .then((result) => {
            if (result && result.nodes) {
              set({ nodes: result.nodes, edges: result.edges });
            }
          })
          .catch(console.error);
      },

      hybridLayout: async (direction = "TB") => {
        const { nodes, edges } = get();
        if (!nodes || nodes.length === 0) return;

        try {
          const sessionNodes = nodes.filter((node) => node.type === "session");
          const nonSessionNodes = nodes.filter((node) => node.type !== "session");
          const elkDirection = direction === "TB" ? "DOWN" : direction === "LR" ? "RIGHT" : direction;
          const options = { ...elkOptions, "elk.direction": elkDirection };

          const nonSessionEdges = edges.filter((edge) => {
            const sourceNode = nonSessionNodes.find((node) => node.id === edge.source);
            const targetNode = nonSessionNodes.find((node) => node.id === edge.target);
            return sourceNode && targetNode;
          });

          let layoutedNonSessionNodes = nonSessionNodes;
          if (nonSessionNodes.length > 0) {
            const elkResult = await getLayoutedElements(nonSessionNodes, nonSessionEdges, options);
            if (elkResult && elkResult.nodes) layoutedNonSessionNodes = elkResult.nodes;
          }

          const mergedNodes = [...layoutedNonSessionNodes, ...sessionNodes];
          set({ nodes: mergedNodes });

          const parentMap = new Map<string, Node[]>();
          sessionNodes.forEach((node) => {
            const parentEdges = edges.filter((edge) => edge.target === node.id);
            if (parentEdges.length > 0) {
              const parentId = parentEdges[0].source;
              if (!parentMap.has(parentId)) parentMap.set(parentId, []);
              parentMap.get(parentId)!.push(node);
            }
          });

          const updatedNodes = [...mergedNodes];
          parentMap.forEach((childNodes, parentId) => {
            const parentNode = updatedNodes.find((node) => node.id === parentId);
            if (!parentNode) return;

            const startX = parentNode.position.x;
            const startY = parentNode.position.y + 150;
            const sortedChildren = [...childNodes].sort(
              (a, b) => (a.position?.x || 0) - (b.position?.x || 0)
            );

            sortedChildren.forEach((node, index) => {
              const nodeIndex = updatedNodes.findIndex((n) => n.id === node.id);
              if (nodeIndex !== -1) {
                updatedNodes[nodeIndex] = {
                  ...updatedNodes[nodeIndex],
                  position: { x: startX, y: startY + index * 150 },
                };
              }
            });
          });

          set({ nodes: updatedNodes });
        } catch (error) {
          console.error("Error in hybrid layout:", error);
        }
      },

      stackSessionNodes: () => {
        const { nodes, edges } = get();
        if (nodes.length === 0) return;

        try {
          const sessionNodes = nodes.filter((node) => node.type === "session");
          const parentMap = new Map<string, Node[]>();

          sessionNodes.forEach((node) => {
            const parentEdges = edges.filter((edge) => edge.target === node.id);
            if (parentEdges.length > 0) {
              const parentId = parentEdges[0].source;
              if (!parentMap.has(parentId)) parentMap.set(parentId, []);
              parentMap.get(parentId)!.push(node);
            }
          });

          const updatedNodes = [...nodes];
          parentMap.forEach((childNodes, parentId) => {
            const parentNode = nodes.find((node) => node.id === parentId);
            if (!parentNode) return;

            const startX = parentNode.position.x;
            const startY = parentNode.position.y + 150;
            const sortedChildren = [...childNodes].sort((a, b) => {
              if (a.data?.order !== null && b.data?.order !== null) {
                return (a.data?.order || 0) - (b.data?.order || 0);
              }
              return (a.position?.x || 0) - (b.position?.x || 0);
            });

            sortedChildren.forEach((node, index) => {
              const nodeIndex = updatedNodes.findIndex((n) => n.id === node.id);
              if (nodeIndex !== -1) {
                updatedNodes[nodeIndex] = {
                  ...updatedNodes[nodeIndex],
                  position: { x: startX, y: startY + index * 150 },
                };
              }
            });
          });

          set({ nodes: updatedNodes });
        } catch (error) {
          console.error("Error stacking session nodes:", error);
        }
      },

      updateColumnsForSelectedNode: (activeTab: "Profile" | "Editor") => {
        const { nodes } = get();
        const selectedNode = nodes.find((node) => node.selected);

        if (selectedNode) {
          const templates =
            activeTab === "Profile"
              ? getProfileComposerTemplates(get().updateNodeData)
              : getEditorComposerTemplates(get().updateNodeData);
          if (templates[selectedNode.type || ""]) {
            set({ columnsLayout: templates[selectedNode.type || ""] });
          }
        }
      },

      setColumnsLayout: (layout: any[]) => set({ columnsLayout: layout }),

      dumpClipboard: () =>
        set((state) => ({
          clipboard: {
            nodes: [],
            edges: [],
          },
        })),

      hydrateFlowState: (nodes, edges) => {
        set({ nodes: nodes || [], edges: edges || [] });
      },
    }),
    {
      name: "flow-diagram-store",
    }
  )
);
