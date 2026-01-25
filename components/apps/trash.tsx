"use client";
import React, { useState, useEffect } from "react";
import { useFS } from "@/lib/fs";

export function Trash() {
  const fs = useFS();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const trashPath = "/trash";

  // Check/Init trash
  useEffect(() => {
    if (!fs.exists(trashPath)) {
        fs.mkdir(trashPath);
    }
    // Cleanup legacy localstorage key
    if (typeof window !== "undefined") {
        localStorage.removeItem("trash-empty");
    }
  }, []);

  // Use list from fs (reactive)
  const trashItems = fs.exists(trashPath) ? fs.list(trashPath) : [];
  const isEmpty = trashItems.length === 0;

  const handleSelection = (id: string, multi: boolean) => {
      if (multi) {
          if (selectedIds.includes(id)) {
              setSelectedIds(prev => prev.filter(i => i !== id));
          } else {
              setSelectedIds(prev => [...prev, id]);
          }
      } else {
          setSelectedIds([id]);
      }
  };

  const emptyTrash = () => {
      trashItems.forEach(item => {
          const path = fs.absolute(item.id);
          fs.delete(path);
      });
      setSelectedIds([]);
  };

  const restoreSelected = () => {
      selectedIds.forEach(id => {
          const path = fs.absolute(id);
          if (path) fs.restore(path);
      });
      setSelectedIds([]);
  };

  const emptyScreen = () => (
    <div className="flex-grow flex flex-col justify-center items-center">
      <img
        className=" w-24"
        src="./themes/Yaru/status/user-trash-symbolic.svg"
        alt="Ubuntu Trash"
      />
      <span className="font-bold mt-4 text-xl px-1 text-gray-400">
        Trash is Empty
      </span>
    </div>
  );

  const showTrashItems = () => (
    <div className="flex-grow ml-4 flex flex-wrap items-start content-start justify-start overflow-y-auto windowMainScreen">
      {trashItems.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        let icon = "./themes/Yaru/system/unknown.png";
        if (item.type === 'dir') icon = "./themes/Yaru/system/folder.png";

        return (
          <div
            key={item.id}
            tabIndex={0}
            onClick={(e) => {
                e.stopPropagation();
                handleSelection(item.id, e.ctrlKey || e.shiftKey);
            }}
            className={`flex flex-col items-center text-sm outline-none w-16 my-2 mx-4 cursor-pointer ${isSelected ? "bg-ub-orange bg-opacity-20 rounded" : ""}`}
          >
            <div className={`w-16 h-16 flex items-center justify-center ${isSelected ? "opacity-60" : ""}`}>
              <img src={icon} alt="Ubuntu File Icons" />
            </div>
            <span className={`text-center rounded px-0.5 ${isSelected ? "bg-ub-orange text-white" : ""}`}>{item.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-ub-cool-grey text-white select-none" onClick={() => setSelectedIds([])}>
      <div className="flex items-center justify-between w-full bg-ub-warm-grey bg-opacity-40 text-sm p-2">
        <span className="font-bold ml-2">Trash</span>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); restoreSelected(); }}
            disabled={selectedIds.length === 0}
            className={`border border-black bg-black bg-opacity-50 px-3 py-1 rounded text-gray-300 ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
          >
            Restore
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); emptyTrash(); }}
            disabled={isEmpty}
            className={`border border-black bg-black bg-opacity-50 px-3 py-1 rounded text-gray-300 ${isEmpty ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
          >
            Empty
          </button>
        </div>
      </div>
      {isEmpty ? emptyScreen() : showTrashItems()}
    </div>
  );
}

export default Trash;

export const displayTrash = () => {
  return <Trash />;
};
