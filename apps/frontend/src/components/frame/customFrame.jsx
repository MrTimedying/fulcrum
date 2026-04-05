// CustomFrame.js
import WindowControls from './windowControls';

const CustomFrame = ({ children }) => {
  return (
    <div id="frame-container" className="h-screen flex flex-col overflow-hidden">
      <WindowControls />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default CustomFrame;
