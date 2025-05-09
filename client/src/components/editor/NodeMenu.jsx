import React from "react";
import ContextMenu from "./ContextMenu.jsx";
import { PiListMagnifyingGlass } from "react-icons/pi";
import { IoCalendarNumberSharp } from "react-icons/io5";
import { IoIosCut } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";

const NodeMenu = ({
  isOpen,
  position,
  onClose,
  targetNode,
  actions,
  setIsInspectorOpen,
}) => {
  if (!isOpen || !targetNode) return null;

  const inspectorConditional = (targetNode.type === "bodyStructure" || targetNode.type === "activities" || targetNode.type === "participation");
  const actionsConditional = (!inspectorConditional || targetNode.type === "session" );


  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>


      <ul style={{ marginTop: "5px" }}>
        { !inspectorConditional && (<li
          style={{ marginBottom: "8px" }}
          className="mb-0 text-sm  text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
          onClick={() => {
            setIsInspectorOpen(true);
            onClose();
          }}
        > 
          <button className="flex flex-row gap-2 px-2 cursor-default"> 
           <PiListMagnifyingGlass size={20} /> Inspect Node
          </button>
        </li>)}
        {targetNode.type === "session" && (
          <li
            style={{ marginBottom: "8px" }}
            className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
            onClick={() => {
              actions?.setIsExerciseModalOpen(true);
              onClose();
            }}
          >
            <a className="flex flex-row gap-2 px-2 cursor-default"> 
            <CiViewTable size={20} />Exercises/Activities
            </a>
          </li>
        )}
        {targetNode.type === "session" && (
          <li
            style={{ marginBottom: "8px" }}
            className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
            onClick={() => {
              actions?.setIsTestModalOpen(true);
              onClose();
            }}
          >
            <a className="flex flex-row gap-2 px-2 cursor-default"> 
            <IoCalendarNumberSharp size={20} />Schedule testing
            </a>
          </li>
        )}
        {actionsConditional && (<hr className="border-zinc-500 w-full py-2"></hr>)}
        <li
          style={{ marginBottom: "8px" }}
          className="flex justify-between mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
          onClick={() => {
            actions?.cutNodesEdges(targetNode);
            onClose();
          }}
        >
          <a className="flex flex-row gap-2 px-2 cursor-default"> 
            <IoIosCut size={20} />Cut
            </a>
          <span className="px-2 text-gray-500">
            CTRL + X
          </span>
        </li>
        <li
          style={{ marginBottom: "8px" }}
          className="flex justify-between mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
          onClick={() => {
            actions?.copyNodesEdges(targetNode);
            onClose();
          }}
        >
          <a className="flex flex-row gap-2 px-2 cursor-default"> 
            <MdOutlineContentCopy size={20} />Copy
            </a>
          <span className="px-2 text-gray-500">
            CTRL + C
          </span>
        </li>
        <li
          style={{ marginBottom: "8px" }}
          className="flex justify-between mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
          onClick={() => {
            actions?.deleteSelectedNodesEdges(targetNode);
            onClose();
          }}
        >
          <a className="flex flex-row gap-2 px-2 cursor-default"> 
            <MdDeleteOutline size={20} />Delete
            </a>
          <span className="px-2 text-gray-500">
            Canc
          </span>
        </li>
      </ul>
    </ContextMenu>
  );
};

export default NodeMenu;
