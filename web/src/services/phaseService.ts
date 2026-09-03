import { fetchApi } from "@/lib/api-client";
import { Phase3TurnResponse, Phase4StepResponse, Phase5AuditResponse, SessionState } from "@/lib/types";

export const phaseService = {
  // Phase 1: Discovery
  async discover(sessionId: string, sectors: string[], fieldObservations?: string): Promise<{ response: string; state: SessionState }> {
    return await fetchApi<{ response: string; state: SessionState }>("/api/phases/1/discover", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        sectors,
        field_observations: fieldObservations,
      }),
    });
  },

  async addPhase1Observations(sessionId: string, additions: string): Promise<{ response: string; state: SessionState }> {
    return await fetchApi<{ response: string; state: SessionState }>("/api/phases/1/additions", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        additions,
      }),
    });
  },

  // Phase 2: Screening
  async screen(sessionId: string, phase1Text?: string, selectedProblemIds?: string[]): Promise<{ response: string; state: SessionState }> {
    return await fetchApi<{ response: string; state: SessionState }>("/api/phases/2/screen", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        problem_landscape: phase1Text,
        selected_problem_ids: selectedProblemIds,
      }),
    });
  },

  // Phase 3: Validation Clinic
  async initPhase3(sessionId: string, problemStatement: string, problemId?: string): Promise<{ agent_response: string; current_level: string; level_label: string; state: SessionState }> {
    return await fetchApi<{ agent_response: string; current_level: string; level_label: string; state: SessionState }>("/api/phases/3/init", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        problem_statement: problemStatement,
        problem_id: problemId,
      }),
    });
  },

  async submitPhase3Answer(sessionId: string, studentAnswer: string): Promise<Phase3TurnResponse> {
    return await fetchApi<Phase3TurnResponse>("/api/phases/3/turn", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        answer: studentAnswer,
      }),
    });
  },

  // Phase 4: Ideation & SVB
  async executePhase4Step(
    sessionId: string,
    step: string,
    userInput?: string,
    concepts?: any[]
  ): Promise<Phase4StepResponse> {
    return await fetchApi<Phase4StepResponse>("/api/phases/4/step", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        step,
        user_input: userInput,
        concepts,
      }),
    });
  },

  // Phase 5: MVP Audit
  async auditPhase5(
    sessionId: string,
    payload: {
      concept_label: string;
      assumption_tested: string;
      test_archetype: string;
      cohort: string;
      sample_size: number;
      actions_count: number;
      pass_threshold: string | number;
      fail_threshold: string | number;
      evidence_desc: string;
    }
  ): Promise<Phase5AuditResponse> {
    return await fetchApi<Phase5AuditResponse>("/api/phases/5/audit", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        ...payload,
      }),
    });
  },
};
