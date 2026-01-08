declare global {
  interface Window {
    Android?: {
      postMessage: (msg: string) => void;
    };
    webkit?: {
      messageHandlers?: {
        native?: {
          postMessage: (msg: any) => void;
        };
      };
    };
  }
}

export {};
