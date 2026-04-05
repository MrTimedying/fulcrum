import React, { useMemo } from "react";
import { Tree } from "react-arborist";
import useFlowStore from "../../state/flowState.js";
import { getInterventionTree } from "../../utils/treeUtils.js";
import { 
  HiChevronRight, 
  HiChevronDown,
  HiOutlineClipboardDocumentList,
  HiOutlineSquare3Stack3D,
  HiOutlineRectangleStack,
  HiOutlineCalendarDays,
  HiOutlinePlay
} from "react-icons/hi2";

const NodeRenderer = ({ node, style, dragHandle }) => {
  const Icon = useMemo(() => {
    switch (node.data.type) {
      case 'intervention': return HiOutlineClipboardDocumentList;
      case 'phase': return HiOutlineSquare3Stack3D;
      case 'micro': return HiOutlineRectangleStack;
      case 'session': return HiOutlineCalendarDays;
      case 'exercise': return HiOutlinePlay;
      default: return HiOutlineClipboardDocumentList;
    }
  }, [node.data.type]);

  const textColorClass = useMemo(() => {
    switch (node.data.type) {
      case 'intervention': return 'text-zinc-200 font-medium';
      case 'phase': return 'text-zinc-300';
      case 'micro': return 'text-zinc-400';
      case 'session': return 'text-zinc-500';
      case 'exercise': return 'text-indigo-400/80 italic';
      default: return 'text-zinc-300';
    }
  }, [node.data.type]);

  return (
    <div 
      style={style} 
      className={`flex items-center space-x-1.5 py-0.5 cursor-pointer group hover:bg-zinc-800/50 rounded px-1 transition-colors`}
      onClick={() => node.toggle()}
    >
      <div className="flex items-center w-full min-w-0">
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {node.children && node.children.length > 0 && (
            <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {node.isOpen ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />}
            </div>
          )}
        </div>
        
        <Icon size={14} className={`flex-shrink-0 mr-1.5 ${node.data.type === 'exercise' ? 'text-indigo-500/70' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'}`} />
        
        <span className={`text-[11px] truncate leading-tight ${textColorClass}`}>
          {node.data.name}
        </span>
      </div>
    </div>
  );
};

const InterventionsSidebar = () => {
  const { nodes, edges, patientId } = useFlowStore();
  
  const treeData = useMemo(() => {
    return getInterventionTree(nodes, edges);
  }, [nodes, edges]);

  return (
    <div className="h-full w-full bg-zinc-900 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Structure</h2>
        {patientId && treeData.length > 0 && (
           <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
             {nodes.length} nodes
           </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden py-2">
        {!patientId ? (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-600 text-[11px] italic">Select a patient to see the intervention structure</p>
          </div>
        ) : treeData.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-600 text-[11px] italic">No intervention structure found for this patient. Start by adding an intervention node in the editor.</p>
          </div>
        ) : (
          <div className="h-full px-2">
            <Tree
              data={treeData}
              openByDefault={true}
              width="100%"
              height={800} // This will be constrained by the container
              indent={12}
              rowHeight={24}
              disableDrag={true}
              disableDrop={true}
              className="react-arborist-tree"
            >
              {NodeRenderer}
            </Tree>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterventionsSidebar;
