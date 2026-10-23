// ==============================================================================
// VYBE — ScreenScape postMessage Communication Bridge
// Protocol implementation grounded in upstream ScreenScape embed specification:
// https://web.screenscape.fun/embed
// ==============================================================================

export const PERMITTED_EMBED_ORIGINS: readonly string[] = [
  "https://web.screenscape.fun",
  "https://nxsha.screenscape.me",
];

export function isPermittedOrigin(origin: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const normalized = `${url.protocol}//${url.host}`;
    return PERMITTED_EMBED_ORIGINS.includes(normalized);
  } catch {
    return false;
  }
}

export interface ScreenScapeProgressPayload {
  tmdbId: number;
  season?: number;
  episode?: number;
  progressSeconds?: number;
}

export interface ProgressSyncResult {
  success: boolean;
  progressSeconds?: number;
  error?: string;
}

/**
 * Requests the current playback progress from the ScreenScape embed iframe.
 */
export function requestProgressFromEmbed(
  targetWindow: Window,
  targetOrigin: string,
  params: { tmdbId: number; season?: number; episode?: number },
  timeoutMs = 5000
): Promise<ProgressSyncResult> {
  return new Promise((resolve) => {
    const requestId = `req-progress-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let timer: NodeJS.Timeout | null = null;

    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (!isPermittedOrigin(event.origin)) return;

      const data = event.data;
      if (
        (data?.type === "SCREENSCAPE_PROGRESS_RESPONSE" ||
          data?.type === "VIDPLUS_PROGRESS_RESPONSE") &&
        data?.requestId === requestId
      ) {
        cleanup();
        if (data.error) {
          resolve({ success: false, error: data.error });
        } else {
          resolve({
            success: true,
            progressSeconds: Number(data.progressSeconds) || 0,
          });
        }
      }
    };

    const cleanup = () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleMessage);
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage);
    }

    timer = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        error: "Timeout waiting for embed postMessage response",
      });
    }, timeoutMs);

    const payload: Record<string, unknown> = {
      tmdbId: params.tmdbId,
    };
    if (params.season) payload.season = params.season;
    if (params.episode) payload.episode = params.episode;

    try {
      targetWindow.postMessage(
        {
          type: "SCREENSCAPE_GET_PROGRESS",
          requestId,
          payload,
        },
        targetOrigin || "*"
      );
    } catch (err: unknown) {
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : "Failed to postMessage to iframe",
      });
    }
  });
}

/**
 * Sends a progress timestamp to the ScreenScape embed player to restore or save playback.
 */
export function sendProgressToEmbed(
  targetWindow: Window,
  targetOrigin: string,
  params: { tmdbId: number; progressSeconds: number; season?: number; episode?: number },
  timeoutMs = 5000
): Promise<ProgressSyncResult> {
  return new Promise((resolve) => {
    const requestId = `set-progress-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let timer: NodeJS.Timeout | null = null;

    const handleMessage = (event: MessageEvent) => {
      if (!isPermittedOrigin(event.origin)) return;

      const data = event.data;
      if (
        (data?.type === "SCREENSCAPE_SET_PROGRESS_RESPONSE" ||
          data?.type === "VIDPLUS_SET_PROGRESS_RESPONSE") &&
        data?.requestId === requestId
      ) {
        cleanup();
        if (data.error) {
          resolve({ success: false, error: data.error });
        } else {
          resolve({
            success: true,
            progressSeconds: params.progressSeconds,
          });
        }
      }
    };

    const cleanup = () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleMessage);
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage);
    }

    timer = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        error: "Timeout waiting for embed set_progress confirmation",
      });
    }, timeoutMs);

    const payload: Record<string, unknown> = {
      tmdbId: params.tmdbId,
      progressSeconds: params.progressSeconds,
    };
    if (params.season) payload.season = params.season;
    if (params.episode) payload.episode = params.episode;

    try {
      targetWindow.postMessage(
        {
          type: "SCREENSCAPE_SET_PROGRESS",
          requestId,
          payload,
        },
        targetOrigin || "*"
      );
    } catch (err: unknown) {
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : "Failed to postMessage to iframe",
      });
    }
  });
}

/**
 * Requests the full watch history and progress array from the embed.
 */
export function requestWatchHistoryFromEmbed(
  targetWindow: Window,
  targetOrigin: string,
  timeoutMs = 5000
): Promise<{ success: boolean; watchHistory?: any[]; error?: string }> {
  return new Promise((resolve) => {
    const requestId = `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let timer: NodeJS.Timeout | null = null;

    const handleMessage = (event: MessageEvent) => {
      if (!isPermittedOrigin(event.origin)) return;

      const data = event.data;
      if (
        (data?.type === "SCREENSCAPE_WATCH_HISTORY_WITH_PROGRESS_RESPONSE" ||
          data?.type === "VIDPLUS_WATCH_HISTORY_WITH_PROGRESS_RESPONSE") &&
        data?.requestId === requestId
      ) {
        cleanup();
        resolve({
          success: true,
          watchHistory: Array.isArray(data.watchHistory) ? data.watchHistory : [],
        });
      }
    };

    const cleanup = () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleMessage);
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage);
    }

    timer = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        error: "Timeout waiting for embed history response",
      });
    }, timeoutMs);

    try {
      targetWindow.postMessage(
        {
          type: "SCREENSCAPE_GET_WATCH_HISTORY_WITH_PROGRESS",
          requestId,
        },
        targetOrigin || "*"
      );
    } catch (err: unknown) {
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : "Failed to postMessage to iframe",
      });
    }
  });
}
