import React, { useState, useMemo, useEffect } from "react";
import Modal from "react-modal";
import DatePicker, { Calendar } from "react-multi-date-picker";
import { Rnd } from "react-rnd";
import { Close, Save, AssistantDirection, DateRange } from "@mui/icons-material";
import "./calendar.css";
import useFlowStore from "../state/flowState";
import useTransientStore from "../state/transientState";
import BulkDateAssigner from "./BulkDateAssigner";
import { formatDateForPicker, standardizeDate } from "../utils/dateUtils";
import { isSessionNode } from "../utils/nodeDateCalculator";

const DatepickerModal = ({ isOpen, onClose }) => {
  // Zustand State
  const {
    nodes,
    sessionNodes = nodes,
    updateNodeById,
    setSelectedNode, // Add this if it exists in your store
  } = useFlowStore();

  const { setToaster } = useTransientStore();
  const nodeSelected = nodes.find((node) => node.selected);

  // Modal config
  const defaultModalConfig = {
    width: 600,  // Reduced size since timeline is removed
    height: 680, // Reduced size since timeline is removed
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 300 : 100,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 340 : 100,
  };

  // Unavailable dates logic
  const unavailableDates = useMemo(() =>
    sessionNodes
      .filter(n => isSessionNode(n) && n.id !== nodeSelected?.id && n.data?.date)
      .map(n => {
        let dateVal = n.data.date;
        if (typeof dateVal === "string") {
          return dateVal.slice(0,10);
        }
        if (dateVal instanceof Date && !isNaN(dateVal)) {
          return dateVal.toISOString().slice(0,10);
        }
        return "";
      }).filter(Boolean), [sessionNodes, nodeSelected]
  );

  // Controlled date logic
  const [selectedDate, setSelectedDate] = useState(() => {
    let initial = nodeSelected?.data?.date;
    if (!initial) return "";
    if (typeof initial === "string") return initial.slice(0,10);
    if (initial instanceof Date && !isNaN(initial)) return initial.toISOString().slice(0,10);
    return "";
  });

  // For animation/feedback
  const [saving, setSaving] = useState(false);
  
  // Bulk assignment mode
  const [bulkMode, setBulkMode] = useState(false);
  
  // We've removed date suggestion and order validation features

  // If the selected node changes (rare), reset selectedDate too
  useEffect(() => {
    let initial = nodeSelected?.data?.date;
    if (!initial) setSelectedDate("");
    else if (typeof initial === "string") setSelectedDate(initial.slice(0,10));
    else if (initial instanceof Date && !isNaN(initial)) setSelectedDate(initial.toISOString().slice(0,10));
    else setSelectedDate("");
  }, [nodeSelected]);
  
  // Removed handleUseSuggestion function

  // Saving logic
  const handleSaveDate = () => {
    if (!nodeSelected) {
      setToaster({
        type: "error",
        message: "Select a node first.",
        show: true
      });
      return;
    }
    if (!selectedDate || unavailableDates.includes(selectedDate)) {
      setToaster({
        type: "error",
        message: "Please select a valid, available date.",
        show: true
      });
      return;
    }
    
    // Order validation removed
    
    setSaving(true);
    updateNodeById(nodeSelected.id, selectedDate);
    setToaster({
      type: "success",
      message: "Date assigned successfully.",
      show: true,
    });
    setSaving(false);
    onClose();
  };
  
  // Handle bulk date assignments
  const handleBulkAssign = (assignments) => {
    if (!assignments || !assignments.length) return;
    
    setSaving(true);
    
    // Process each assignment
    assignments.forEach(({ nodeId, date }) => {
      updateNodeById(nodeId, date);
    });
    
    setToaster({
      type: "success",
      message: `Successfully assigned dates to ${assignments.length} nodes.`,
      show: true,
    });
    
    setSaving(false);
    setBulkMode(false);
    onClose();
  };
  
  // Removed handleTimelineNodeClick function

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{ labelledby: "node-datepicker-title" }}
      style={{
        overlay: {
          backgroundColor: "rgba(20,20,30,0.75)",
          zIndex: 1000,
        },
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: 0,
          overflow: "hidden",
        }
      }}
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={600}
        minHeight={680}
        enableResizing={{
          top:true, right:true, bottom:true, left:true, topRight:true, bottomRight:true, bottomLeft:true, topLeft:true
        }}
        bounds="window"
        dragHandleClassName="date-modal-drag"
        style={{ display:"flex", flexDirection:"column"}}
      >
        <div className="bg-zinc-900 rounded-lg shadow-lg text-gray-100 h-full flex flex-col min-h-[380px]">
          {/* Modal Title */}
          <div className="flex justify-between items-center p-3 bg-zinc-900 date-modal-drag cursor-move rounded-t-lg">
            <div className="flex items-center gap-2">
              <AssistantDirection className="text-blue-400" />
              <span className="font-light text-lg" id="node-datepicker-title">@ Smart Date Assignment</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close picker"
              className="text-gray-400 hover:text-white transition duration-150"
              tabIndex={0}
            >
              <Close />
            </button>
          </div>
          {/* Node name */}
          {/* {nodeSelected && (
            <div className="p-4 pt-2">
              <div className="text-xs text-gray-400 uppercase mb-1">Node</div>
              <div className="font-semibold text-sm text-white">{nodeSelected.data?.label || nodeSelected.id}</div>
            </div>
          )} */}
          {/* Date Picker */}
          {/* Bulk mode toggle */}
          <div className="px-4 pt-2 pb-3 border-b border-zinc-800">
            <div className="flex justify-end items-center mb-2">
              <button 
                onClick={() => setBulkMode(!bulkMode)}
                className="text-xs flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-blue-300 transition"
              >
                <DateRange fontSize="small" />
                {bulkMode ? "Single Mode" : "Bulk Assign"}
              </button>
            </div>
          </div>
          
          {/* Bulk Assignment UI */}
          {bulkMode ? (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <BulkDateAssigner 
                nodes={nodes}
                onAssign={handleBulkAssign}
                onCancel={() => setBulkMode(false)}
              />
            </div>
          ) : (
            <>
              {/* Removed suggestion and validation sections */}
              
              <div className="flex-1 flex flex-col items-center justify-center w-full h-full min-h-[280px]">
                <Calendar
                  value={selectedDate}
                  onChange={date => {
                    if (!date) return setSelectedDate("");
                    setSelectedDate(date.format("YYYY-MM-DD")); 
                  }}
                  format="YYYY-MM-DD"
                  disable={unavailableDates}
                  minDate={new Date()}
                  onClose={() => setCalendarOpen(false)}
                  mapDays={({ date }) => {
                    const curr = date.format("YYYY-MM-DD");
                    if (unavailableDates.includes(curr)) {
                      return {
                        disabled: true,
                        style: { color: "#ef4444", textDecoration: "line-through", backgroundColor: "#3f3f46" }
                      };
                    }
                    
                    // Highlight selected date
                    if (curr === selectedDate) {
                      return {
                        style: { backgroundColor: "#4f46e5", color: "#fff", borderRadius: "0.5rem" }
                      };
                    }
                    
                    // Removed suggested date highlighting
                  }}
                  className="h-full w-full custom-calendar"
                  plugins={[]}
                  weekDays={["S", "M", "T", "W", "T", "F", "S"]}
                  inputClass="w-full"
                />
              </div>
            </>
          )}
          
          {/* Controls section */}
          <div className="px-4 pb-5 pt-3 flex justify-between items-center">
            {!bulkMode && (
              <div className="text-xs text-gray-400">
                {nodeSelected && isSessionNode(nodeSelected) ? 
                  (nodeSelected.data?.order ? 
                    `Assigning date to Session #${nodeSelected.data.order}` : 
                    "Assigning date to unordered Session") : 
                  "Select a Session node to assign a date"}
              </div>
            )}
            
            {!bulkMode && (
              <button
                onClick={handleSaveDate}
                className={
                  "w-32 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm transition " +
                  (saving ? "opacity-70 cursor-wait" : "")
                }
                disabled={saving || !selectedDate || unavailableDates.includes(selectedDate) || !nodeSelected}
                tabIndex={0}
              >
                <Save fontSize="small" /> Save Date
              </button>
            )}
          </div>
        </div>
      </Rnd>
    </Modal>
  );
};

export default DatepickerModal;
