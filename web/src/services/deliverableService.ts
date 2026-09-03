import { fetchApi } from "@/lib/api-client";
import {
  LeanCanvasData,
  SwotData,
  PitchDeckData,
} from "@/lib/types";

export interface DeliverablesBundle {
  session_id: string;
  lean_canvas?: LeanCanvasData | null;
  swot?: SwotData | null;
  pitch_deck?: PitchDeckData | null;
}

export const deliverableService = {
  async getDeliverables(sessionId: string): Promise<DeliverablesBundle> {
    return fetchApi<DeliverablesBundle>(`/api/sessions/${sessionId}/deliverables`);
  },

  async generateLeanCanvas(sessionId: string): Promise<{ status: string; lean_canvas: LeanCanvasData }> {
    return fetchApi<{ status: string; lean_canvas: LeanCanvasData }>(
      `/api/sessions/${sessionId}/deliverables/lean-canvas`,
      { method: "POST" }
    );
  },

  async generateSwot(sessionId: string): Promise<{ status: string; swot: SwotData }> {
    return fetchApi<{ status: string; swot: SwotData }>(
      `/api/sessions/${sessionId}/deliverables/swot`,
      { method: "POST" }
    );
  },

  async generatePitchDeck(sessionId: string): Promise<{ status: string; pitch_deck: PitchDeckData }> {
    return fetchApi<{ status: string; pitch_deck: PitchDeckData }>(
      `/api/sessions/${sessionId}/deliverables/pitch-deck`,
      { method: "POST" }
    );
  },
};
