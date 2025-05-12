import { useEffect } from 'react';

const useKeyboardShortcuts = ({
  cutNodesEdges,
  copyNodesEdges,
  pasteNodesEdges,
  deleteSelectedNodesEdges,
  undoNodesEdges,
  redoNodesEdges,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isModifierKeyPressed = event.metaKey || event.ctrlKey;
      if (isModifierKeyPressed) {
        switch (event.key.toLowerCase()) {
          case 'x':
            event.preventDefault();
            cutNodesEdges();
            break;
          case 'c':
            event.preventDefault();
            copyNodesEdges();
            break;
          case 'v':
            event.preventDefault();
            pasteNodesEdges({position: 0});
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redoNodesEdges();
            } else {
              undoNodesEdges();
            }
            break;
          default:
            break;
        }
      } else if (event.key === 'Delete') {
        event.preventDefault();
        deleteSelectedNodesEdges();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cutNodesEdges, copyNodesEdges, pasteNodesEdges, deleteSelectedNodesEdges, undoNodesEdges, redoNodesEdges]);
};

export default useKeyboardShortcuts;
