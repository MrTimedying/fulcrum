import React from "react";
import * as _ from "lodash";

export default function StyleMenu({nodes, setNodes}) {


    const selectedNodes = nodes.filter((node) => node.selected); // gets all selected nodes

    const handleColorChange = (color) => {
        if (selectedNodes.length > 0 && setNodes) {
            setNodes((nds) => _.map(nds, (node) => node.selected ? {...node, data: {...node.data, color: color}} : node));
        } else return;
    };

    return(<div label="StyleMenu" className="flex flex-col items-center justify-between p-1 gap-2 mx-5">
        <p lable="Title" className="text-xs text-zinc-300">Pick a color</p>
        <div className="flex flex-row gap-2">
        <button label="Color Picker" className="h-5 w-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-400 transition-all rounded-md" onClick={() => handleColorChange("rgba(28, 28, 28, 1)")} />
        <button label="Color Picker" className="h-5 w-5 bg-slate-900 border border-zinc-800 hover:border-zinc-400 transition-all rounded-md" onClick={() => handleColorChange("rgba(15, 23, 42, 1)")} />
        <button label="Color Picker" className="h-5 w-5 bg-rose-900 border border-zinc-800 hover:border-zinc-400 transition-all rounded-md" onClick={() => handleColorChange("rgba(136, 19, 55, 1)")} />
        <button label="Color Picker" className="h-5 w-5 bg-yellow-900 border border-zinc-800 hover:border-zinc-400 transition-all rounded-md" onClick={() => handleColorChange("rgba(113, 63, 18, 1)")} />
        </div>
    </div>);
}