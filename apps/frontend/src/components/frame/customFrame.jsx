// CustomFrame.js
import WindowControls from './windowControls';

const CustomFrame = ({ children }) => {
  return (
    <div id="frame-container" >
        {/* Here for example I'll put the logo component */}
      <WindowControls />
      {children}
    </div>
  );
};

export default CustomFrame;
