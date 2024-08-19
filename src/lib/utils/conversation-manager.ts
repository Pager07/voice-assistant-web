import WebSocket from "ws";

export type ConversationManager = {
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  getSocket: () =>Promise< WebSocket | null>;
};

export function createConversationManager(
  voiceId: string,
  apiKey: string
): ConversationManager {

  let socket: WebSocket | null = null;
  const url = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=eleven_turbo_v2`;

  const startConversation = async (): Promise<void> => {
    "use server"
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      return;
    }

    socket = new WebSocket(url);

    socket.onopen = () => {
      const bosMessage = {
        text: " ",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
        xi_api_key: apiKey,
      };
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(bosMessage));
      }
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.info(`Connection closed cleanly, code=${event.code}`);
      } else {
        console.warn("Connection died");
      }
    };

    socket.onerror = (error) => {
      console.error(`WebSocket Error: ${error}`);
    };
  };

  const endConversation = async (): Promise<void> => {
    "use server"
    if (socket && socket.readyState === WebSocket.OPEN) {
      const eosMessage = { text: "" };
      socket.send(JSON.stringify(eosMessage));
      socket.close();
      console.log("WebSocket connection closed after conversation end.");
    }
  };

  const getSocket =async ():Promise<WebSocket|null>=> {
    "use server"
    return socket;
  };

  return {
    startConversation,
    endConversation,
    getSocket,
  };
}


