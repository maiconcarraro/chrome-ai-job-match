import { useCallback, useEffect, useState } from "react";

interface SessionAI {
  maxTokens: number;
  temperature: number;
  tokensLeft: number;
  tokensSoFar: number;
  topK: number;
  prompt: (s: string) => Promise<string>;
  destroy: () => void;
}

declare global {
  interface Window {
    ai: {
      assistant: {
        create: (params?: any) => Promise<SessionAI>;
      };
    };
  }
}

export default function useAI() {
  const [session, setSession] = useState<SessionAI | undefined>();

  const createSession = useCallback(async () => {
    if (!window.ai || !window.ai.assistant) {
      return;
    }

    const session = await window.ai.assistant.create();
    setSession(session);
  }, []);

  const refreshSession = useCallback(() => {
    session?.destroy();
    createSession();
  }, [session, createSession]);

  useEffect(() => {
    createSession();
  }, [createSession]);

  return [session, refreshSession] as const;
}
