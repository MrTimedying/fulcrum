import React, { useState, useMemo, useEffect } from "react";
import Modal from "react-modal";
import { Calendar } from "react-multi-date-picker";
import { Rnd } from "react-rnd";
import { Close, Save, AssistantDirection, DateRange } from "@mui/icons-material";
import "./calendar.css";
import { useInterventionStore } from "../state/core/useInterventionStore";
import useUIStore from "../state/core/useUIStore";
import BulkDateAssigner from "./BulkDateAssigner";
import { formatDateForPicker } from "../utils/dateUtils";
import { getUnavailableSessionDatesExcept } from "../utils/nodeDateCalculator";

const DatepickerModal = ({ isOpen, onClose }) => {
  const {
    sessions,
    selectedSessionId,
    selectedInterventionId,
    updateSession,
    updateMultipleSessions
  } = useInterventionStore();

  const { setToaster } = useUIStore();
  const selectedSession = sessions[selectedSessionId];

  const defaultModalConfig = {
    width: 600,
    height: 680,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 300 : 100,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 340 : 100,
  };

  const unavailableDates = useMemo(() =>
    getUnavailableSessionDatesExcept(sessions, selectedInterventionId, selectedSessionId),
    [sessions, selectedInterventionId, selectedSessionId]
  );

  const [selectedDate, setSelectedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    if (selectedSession?.date) {
      setSelectedDate(formatDateForPicker(selectedSession.date));
    } else {
      setSelectedDate("");
    }
  }, [selectedSessionId, selectedSession]);

  const handleSaveDate = () => {
    if (!selectedSessionId) {
      setToaster({ type: "error", message: "Select a session first.", show: true });
      return;
    }
    if (!selectedDate || unavailableDates.includes(selectedDate)) {
      setToaster({ type: "error", message: "Select a valid, available date.", show: true });
      return;
    }
    
    setSaving(true);
    updateSession(selectedSessionId, { date: new Date(selectedDate).toISOString() });
    setToaster({ type: "success", message: "Date assigned successfully.", show: true });
    setSaving(false);
    onClose();
  };
  
  const handleBulkAssign = (assignments) => {
    if (!assignments?.length) return;
    
    setSaving(true);
    const updatesMap = {};
    assignments.forEach(({ id, date }) => {
      updatesMap[id] = { date: new Date(date).toISOString() };
    });
    
    updateMultipleSessions(updatesMap);
    setToaster({ type: "success", message: `Assigned dates to ${assignments.length} sessions.`, show: true });
    setSaving(false);
    setBulkMode(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{ labelledby: "node-datepicker-title" }}
      style={{
        overlay: { backgroundColor: "rgba(20,20,30,0.75)", zIndex: 1000 },
        content: { background: "transparent", border: "none", padding: 0, inset: 0, overflow: "hidden" }
      }}
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={600}
        minHeight={680}
        bounds="window"
        dragHandleClassName="date-modal-drag"
        style={{ display:"flex", flexDirection:"column"}}
      >
        <div className="bg-zinc-900 rounded-lg shadow-lg text-gray-100 h-full flex flex-col min-h-[380px] border border-zinc-800">
          <div className="flex justify-between items-center p-3 bg-zinc-900 date-modal-drag cursor-move rounded-t-lg border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AssistantDirection className="text-zinc-400" />
              <span className="font-light text-lg tracking-tight">Timeline Management</span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition duration-150"><Close /></button>
          </div>

          <div className="px-4 py-3 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/20">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {selectedSession ? `Session: ${selectedSession.name}` : "Select a session"}
            </div>
            <button 
              onClick={() => setBulkMode(!bulkMode)}
              className="text-[10px] font-bold uppercase flex items-center gap-1.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 transition-all border border-zinc-700"
            >
              <DateRange size={12} />
              {bulkMode ? "Single Session" : "Bulk Scheduler"}
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden p-4">
            {bulkMode ? (
              <BulkDateAssigner 
                sessions={sessions}
                interventionId={selectedInterventionId}
                onAssign={handleBulkAssign}
                onCancel={() => setBulkMode(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Calendar
                  value={selectedDate}
                  onChange={date => setSelectedDate(date?.format("YYYY-MM-DD") || "")}
                  format="YYYY-MM-DD"
                  disable={unavailableDates}
                  minDate={new Date()}
                  mapDays={({ date }) => {
                    const curr = date.format("YYYY-MM-DD");
                    if (unavailableDates.includes(curr)) {
                      return { disabled: true, style: { color: "#ef4444", textDecoration: "line-through", opacity: 0.3 } };
                    }
                    if (curr === selectedDate) {
                      return { style: { backgroundColor: "#52525b", color: "#fff", borderRadius: "0.5rem", fontWeight: "bold" } };
                    }
                  }}
                  className="custom-calendar"
                  weekDays={["S", "M", "T", "W", "T", "F", "S"]}
                />
              </div>
            )}
          </div>
          
          <div className="px-4 py-4 border-t border-zinc-800 flex justify-end items-center bg-zinc-950/20">
            {!bulkMode && (
              <button
                onClick={handleSaveDate}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded text-xs font-bold transition-all ${saving ? "opacity-50 cursor-wait" : "bg-zinc-600 hover:bg-zinc-500 text-white shadow-lg shadow-zinc-800/50"}`}
                disabled={saving || !selectedDate || unavailableDates.includes(selectedDate) || !selectedSessionId}
              >
                <Save fontSize="small" /> 
                {saving ? "Saving..." : "Apply Date"}
              </button>
            )}
          </div>
        </div>
      </Rnd>
    </Modal>
  );
};

export default DatepickerModal;
