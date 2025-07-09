import React from "react";

export class VoidNet extends React.Component {
  componentDidMount() {
    // Redirect to the external URL
    window.open('https://voidnet.notvc.to', '_blank');
  }

  render() {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-ub-cool-grey text-white">
        <div className="text-center">
          <div className="mb-4">
            <img 
              src="./themes/Yaru/apps/voidnet.png" 
              alt="VoidNet" 
              className="w-16 h-16 mx-auto mb-4"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2">Redirecting to VoidNet...</h2>
          <p className="text-gray-400 mb-4">Opening voidnet.notvc.to in a new tab</p>
          <a 
            href="https://voidnet.notvc.to" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-ub-orange text-white rounded hover:bg-opacity-80 transition-colors"
          >
            Open VoidNet
          </a>
        </div>
      </div>
    );
  }
}

export default VoidNet;

export const displayVoidNet = () => {
  return <VoidNet> </VoidNet>;
};