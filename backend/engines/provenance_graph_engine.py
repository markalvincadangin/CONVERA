"""
CONVERA Provenance Graph Engine (SDD-022)
Deterministic multi-tier Directed Acyclic Graph (DAG) construction, epistemic metrics,
and cryptographic provenance digest for research sessions.
"""

import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Set, Tuple

from models.provenance import (
    ProvenanceNode,
    ProvenanceEdge,
    ProvenanceMetrics,
    ProvenanceGraphPayload,
    ProvenanceFilterQuery,
    ProvenanceNodeType,
    ProvenanceEdgeType,
    EpistemicTier,
)
from storage.base import BaseStorageAdapter


class ProvenanceGraphEngine:
    """
    Constructs deterministic, multi-tier research provenance graphs directly
    from CONVERA's SQLite WAL relational storage tables.
    """

    def __init__(self, storage: BaseStorageAdapter):
        self.storage = storage

    def build_provenance_graph(
        self,
        session_id: str,
        filters: Optional[ProvenanceFilterQuery] = None,
    ) -> ProvenanceGraphPayload:
        """
        Builds the complete multi-tier research provenance DAG for a given session.
        Applies optional filters (min_confidence, stages, tiers, orphans, search).
        """
        if filters is None:
            filters = ProvenanceFilterQuery(session_id=session_id)

        # 1. Resolve Session and Problem Context
        session_row = self._get_session_row(session_id)
        active_problem_id = None
        project_id = None

        if session_row:
            active_problem_id = session_row.get("active_problem_id") or session_row.get("phase3_problem")
            project_id = session_row.get("project_id")

        # 2. Extract Raw Entities Across Tiers
        raw_sources = self._fetch_sources(session_id, active_problem_id, project_id)
        raw_claims = self._fetch_claims(active_problem_id)
        raw_assumptions = self._fetch_assumptions(active_problem_id)
        raw_artifacts = self._fetch_dsr_artifacts(session_id, active_problem_id)
        raw_evaluations = self._fetch_concept_evaluations(session_id)
        raw_feasibility = self._fetch_feasibility_records(session_id)
        raw_evidence_links = self._fetch_evidence_links([c["id"] for c in raw_claims])

        # 3. Assemble Tiered Nodes
        nodes_by_id: Dict[str, ProvenanceNode] = {}

        # Tier 0: Sources / Scholarly Works
        for src in raw_sources:
            node_id = str(src.get("sw_id") or f"src_{src['id']}")
            nodes_by_id[node_id] = ProvenanceNode(
                id=node_id,
                type=ProvenanceNodeType.SCHOLARLY_WORK,
                tier=int(EpistemicTier.TIER_0_SOURCE),
                label=src.get("sw_title") or src.get("title") or "Scholarly Source",
                description=src.get("abstract") or src.get("url"),
                stage_id="stage_a",
                confidence_score=1.0,
                status="validated",
                doi=src.get("doi"),
                year=src.get("year"),
                authors=self._parse_authors(src.get("authors")),
                citation_count=src.get("citation_count"),
                metadata={
                    "source_id": src["id"],
                    "venue": src.get("venue"),
                    "source_connector": src.get("source_connector"),
                },
                created_at=src.get("created_at") or datetime.now(timezone.utc).isoformat(),
            )

        # Tier 1: Claims
        for claim in raw_claims:
            node_id = str(claim["id"])
            raw_conf = float(claim.get("confidence_score") or 50.0)
            norm_conf = min(max(raw_conf / 100.0 if raw_conf > 1.0 else raw_conf, 0.0), 1.0)
            status_val = str(claim.get("status") or "hypothesis").lower()

            nodes_by_id[node_id] = ProvenanceNode(
                id=node_id,
                type=ProvenanceNodeType.EMPIRICAL_CLAIM,
                tier=int(EpistemicTier.TIER_1_CLAIM),
                label=self._truncate(claim.get("claim_text", "Empirical Claim"), 65),
                description=claim.get("claim_text"),
                stage_id="stage_b",
                confidence_score=norm_conf,
                status=status_val,
                metadata={
                    "claim_type": claim.get("claim_type"),
                    "mode": claim.get("mode"),
                    "evidence_notes": claim.get("evidence_notes"),
                },
                created_at=claim.get("created_at") or datetime.now(timezone.utc).isoformat(),
            )

        # Tier 2: Assumptions
        for asm in raw_assumptions:
            node_id = str(asm["id"])
            status_val = str(asm.get("status") or "untested").lower()
            conf_val = 0.85 if status_val == "validated" else 0.40

            nodes_by_id[node_id] = ProvenanceNode(
                id=node_id,
                type=ProvenanceNodeType.RESEARCH_ASSUMPTION,
                tier=int(EpistemicTier.TIER_2_ASSUMPTION),
                label=self._truncate(asm.get("assumption_text", "Research Assumption"), 65),
                description=asm.get("assumption_text"),
                stage_id="stage_c",
                confidence_score=conf_val,
                status=status_val,
                metadata={
                    "risk_level": asm.get("risk_level"),
                    "origin": asm.get("origin"),
                    "testable_question": asm.get("testable_question"),
                },
                created_at=asm.get("created_at") or datetime.now(timezone.utc).isoformat(),
            )

        # Tier 3: DSR Artifacts
        for art in raw_artifacts:
            node_id = str(art["id"])
            dsr_class = art.get("dsr_class", "ARTIFACT")
            feasibility = float(art.get("feasibility_score") or 0.5)

            nodes_by_id[node_id] = ProvenanceNode(
                id=node_id,
                type=ProvenanceNodeType.DSR_ARTIFACT,
                tier=int(EpistemicTier.TIER_3_DSR_ARTIFACT),
                label=f"[{dsr_class}] {self._truncate(art.get('title', 'DSR Artifact'), 50)}",
                description=art.get("description"),
                stage_id="stage_d",
                confidence_score=min(max(feasibility, 0.0), 1.0),
                status=str(art.get("status") or "proposed").lower(),
                metadata={
                    "dsr_class": dsr_class,
                    "kernel_theory": art.get("kernel_theory"),
                    "novelty_score": art.get("novelty_score"),
                    "simpler_baseline": art.get("simpler_baseline_alternative"),
                },
                created_at=art.get("created_at") or datetime.now(timezone.utc).isoformat(),
            )

        # Tier 4: Concept Evaluations
        for ev in raw_evaluations:
            node_id = str(ev["id"])
            comp_score = float(ev.get("composite_score") or 0.5)
            rec = str(ev.get("recommendation") or "RECOMMENDED")

            nodes_by_id[node_id] = ProvenanceNode(
                id=node_id,
                type=ProvenanceNodeType.CONCEPT_EVALUATION,
                tier=int(EpistemicTier.TIER_4_CONCEPT_EVAL),
                label=f"Eval: {rec} ({comp_score:.2f})",
                description=ev.get("narrative_summary") or ev.get("falsification_advisory"),
                stage_id="stage_e",
                confidence_score=min(max(comp_score, 0.0), 1.0),
                status=rec.lower(),
                metadata={
                    "evaluator_type": ev.get("evaluator_type"),
                    "concept_id": ev.get("concept_id"),
                    "strengths": ev.get("strengths"),
                    "vulnerabilities": ev.get("vulnerabilities"),
                },
                created_at=ev.get("created_at") or datetime.now(timezone.utc).isoformat(),
            )

        # Tier 5: Feasibility & Proposals
        for feas in raw_feasibility:
            node_id = str(feas["id"])
            feas_score = float(feas.get("feasibility_score") or 0.5)
            status_val = "cleared" if feas.get("is_cleared") else "in_review"

            nodes_by_id[node_id] = ProvenanceNode(
                id=node_id,
                type=ProvenanceNodeType.FEASIBILITY_PROPOSAL,
                tier=int(EpistemicTier.TIER_5_FEASIBILITY),
                label=f"Proposal Canvas (Score: {feas_score:.2f})",
                description=feas.get("advisory_notes") or "Feasibility & Gate 4 Proposal Synthesis",
                stage_id="stage_f",
                confidence_score=min(max(feas_score, 0.0), 1.0),
                status=status_val,
                metadata={
                    "timeline_weeks": feas.get("timeline_weeks"),
                    "compliance_passed": bool(feas.get("compliance_passed")),
                    "is_cleared": bool(feas.get("is_cleared")),
                },
                created_at=feas.get("created_at") or datetime.now(timezone.utc).isoformat(),
            )

        # 4. Assemble Provenance Edges
        edges: List[ProvenanceEdge] = []
        edge_keys: Set[str] = set()

        # Edge: Tier 0 -> Tier 1 (Source -> Claim via claim_evidence_links)
        for link in raw_evidence_links:
            source_id = link.get("source_work_id") or link.get("source_id_str")
            claim_id = link.get("claim_id")
            if source_id in nodes_by_id and claim_id in nodes_by_id:
                rel = str(link.get("relation_type", "SUPPORTS")).upper()
                is_contra = (rel == "CONTRADICTS")
                edge_type = (
                    ProvenanceEdgeType.CONTRADICTS if is_contra
                    else ProvenanceEdgeType.EXTENDS if rel == "EXTENDS"
                    else ProvenanceEdgeType.SUPPORTS
                )
                edge_id = f"e_{source_id}_{claim_id}_{rel.lower()}"
                if edge_id not in edge_keys:
                    edge_keys.add(edge_id)
                    edges.append(
                        ProvenanceEdge(
                            id=edge_id,
                            source=source_id,
                            target=claim_id,
                            edge_type=edge_type,
                            weight=0.9 if not is_contra else 0.4,
                            is_contradiction=is_contra,
                            evidence_excerpt=link.get("rationale"),
                            metadata={"link_id": link.get("id")},
                        )
                    )

        # Fallback Source->Claim: If no explicit links, link first source to claims if problem matches
        if not edges and raw_sources and raw_claims:
            primary_src_id = list(nodes_by_id.keys())[0]
            for claim in raw_claims:
                claim_id = claim["id"]
                edge_id = f"e_{primary_src_id}_{claim_id}_supports"
                if edge_id not in edge_keys:
                    edge_keys.add(edge_id)
                    edges.append(
                        ProvenanceEdge(
                            id=edge_id,
                            source=primary_src_id,
                            target=claim_id,
                            edge_type=ProvenanceEdgeType.SUPPORTS,
                            weight=0.8,
                            is_contradiction=False,
                            evidence_excerpt="Implicit thematic anchor from problem intake literature.",
                        )
                    )

        # Edge: Tier 1 -> Tier 2 (Claims -> Assumptions)
        if raw_claims and raw_assumptions:
            claim_list = list(raw_claims)
            for i, asm in enumerate(raw_assumptions):
                linked_claim = claim_list[i % len(claim_list)]
                source_claim_id = linked_claim["id"]
                asm_id = asm["id"]
                if source_claim_id in nodes_by_id and asm_id in nodes_by_id:
                    edge_id = f"e_{source_claim_id}_{asm_id}_derives"
                    if edge_id not in edge_keys:
                        edge_keys.add(edge_id)
                        edges.append(
                            ProvenanceEdge(
                                id=edge_id,
                                source=source_claim_id,
                                target=asm_id,
                                edge_type=ProvenanceEdgeType.DERIVES,
                                weight=0.75,
                                is_contradiction=False,
                                evidence_excerpt="Assumption formulated from empirical claim boundaries.",
                            )
                        )

        # Edge: Tier 1/2 -> Tier 3 (Claims/Assumptions -> DSR Artifacts)
        for art in raw_artifacts:
            art_id = art["id"]
            if art_id not in nodes_by_id:
                continue

            linked_claim_ids = self._parse_json_list(art.get("linked_claim_ids"))
            if linked_claim_ids:
                for cid in linked_claim_ids:
                    if cid in nodes_by_id:
                        edge_id = f"e_{cid}_{art_id}_grounds"
                        if edge_id not in edge_keys:
                            edge_keys.add(edge_id)
                            edges.append(
                                ProvenanceEdge(
                                id=edge_id,
                                source=cid,
                                target=art_id,
                                edge_type=ProvenanceEdgeType.GROUNDS,
                                weight=0.85,
                                is_contradiction=False,
                                evidence_excerpt="Empirical claim directly grounds DSR artifact design.",
                            )
                        )
            else:
                # Ground to available claims or assumptions
                candidates = [c["id"] for c in raw_claims] or [a["id"] for a in raw_assumptions]
                for cid in candidates[:2]:
                    if cid in nodes_by_id:
                        edge_id = f"e_{cid}_{art_id}_grounds"
                        if edge_id not in edge_keys:
                            edge_keys.add(edge_id)
                            edges.append(
                                ProvenanceEdge(
                                    id=edge_id,
                                    source=cid,
                                    target=art_id,
                                    edge_type=ProvenanceEdgeType.GROUNDS,
                                    weight=0.70,
                                    is_contradiction=False,
                                    evidence_excerpt="Inferred grounding context from active problem scope.",
                                )
                            )

        # Edge: Tier 3 -> Tier 4 (DSR Artifact -> Concept Evaluation)
        for ev in raw_evaluations:
            ev_id = ev["id"]
            concept_id = ev.get("concept_id")
            if concept_id and concept_id in nodes_by_id and ev_id in nodes_by_id:
                edge_id = f"e_{concept_id}_{ev_id}_evaluates"
                if edge_id not in edge_keys:
                    edge_keys.add(edge_id)
                    edges.append(
                        ProvenanceEdge(
                            id=edge_id,
                            source=concept_id,
                            target=ev_id,
                            edge_type=ProvenanceEdgeType.EVALUATES,
                            weight=0.90,
                            is_contradiction=False,
                            evidence_excerpt="Deterministic rubric matrix evaluation.",
                        )
                    )
            elif raw_artifacts and ev_id in nodes_by_id:
                # Link to first artifact if concept_id is synthetic/unmapped
                primary_art_id = raw_artifacts[0]["id"]
                if primary_art_id in nodes_by_id:
                    edge_id = f"e_{primary_art_id}_{ev_id}_evaluates"
                    if edge_id not in edge_keys:
                        edge_keys.add(edge_id)
                        edges.append(
                            ProvenanceEdge(
                                id=edge_id,
                                source=primary_art_id,
                                target=ev_id,
                                edge_type=ProvenanceEdgeType.EVALUATES,
                                weight=0.80,
                                is_contradiction=False,
                                evidence_excerpt="Evaluates primary candidate artifact.",
                            )
                        )

        # Edge: Tier 4 -> Tier 5 (Concept Evaluation -> Feasibility Proposal)
        for feas in raw_feasibility:
            feas_id = feas["id"]
            if feas_id not in nodes_by_id:
                continue

            eval_sources = [ev["id"] for ev in raw_evaluations] or [art["id"] for art in raw_artifacts]
            for sid in eval_sources:
                if sid in nodes_by_id:
                    edge_id = f"e_{sid}_{feas_id}_synthesizes"
                    if edge_id not in edge_keys:
                        edge_keys.add(edge_id)
                        edges.append(
                            ProvenanceEdge(
                                id=edge_id,
                                source=sid,
                                target=feas_id,
                                edge_type=ProvenanceEdgeType.SYNTHESIZES,
                                weight=0.95,
                                is_contradiction=False,
                                evidence_excerpt="Synthesizes evaluated candidate into Gate 4 proposal canvas.",
                            )
                        )

        # 5. Apply Filtering
        filtered_nodes, filtered_edges = self._apply_filters(
            nodes_by_id, edges, filters
        )

        # 6. Calculate Summary Metrics
        metrics = self._calculate_metrics(filtered_nodes, filtered_edges, raw_artifacts)

        # 7. Compute Cryptographic SHA-256 State Hash
        state_hash = self._compute_graph_state_hash(filtered_nodes, filtered_edges)

        return ProvenanceGraphPayload(
            session_id=session_id,
            nodes=filtered_nodes,
            edges=filtered_edges,
            metrics=metrics,
            state_hash=state_hash,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    def get_node_lineage(
        self,
        session_id: str,
        node_id: str,
    ) -> Dict[str, Any]:
        """
        Calculates direct ancestors and descendants for a specific node.
        """
        graph = self.build_provenance_graph(session_id)
        node = next((n for n in graph.nodes if n.id == node_id), None)
        if not node:
            return {"error": f"Node '{node_id}' not found in session '{session_id}'."}

        # Ancestor traversal (DFS backwards)
        ancestor_ids: Set[str] = set()
        queue = [node_id]
        while queue:
            curr = queue.pop(0)
            for edge in graph.edges:
                if edge.target == curr and edge.source not in ancestor_ids:
                    ancestor_ids.add(edge.source)
                    queue.append(edge.source)

        # Descendant traversal (DFS forwards)
        descendant_ids: Set[str] = set()
        queue = [node_id]
        while queue:
            curr = queue.pop(0)
            for edge in graph.edges:
                if edge.source == curr and edge.target not in descendant_ids:
                    descendant_ids.add(edge.target)
                    queue.append(edge.target)

        return {
            "node": node.model_dump(),
            "ancestor_ids": sorted(list(ancestor_ids)),
            "descendant_ids": sorted(list(descendant_ids)),
            "ancestors": [n.model_dump() for n in graph.nodes if n.id in ancestor_ids],
            "descendants": [n.model_dump() for n in graph.nodes if n.id in descendant_ids],
        }

    # -------------------------------------------------------------------------
    # Internal Storage Query Helpers
    # -------------------------------------------------------------------------

    def _get_session_row(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self.storage._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def _fetch_sources(
        self, session_id: str, problem_id: Optional[str], project_id: Optional[str]
    ) -> List[Dict[str, Any]]:
        with self.storage._get_connection() as conn:
            if problem_id:
                query = """
                    SELECT 
                        s.id, s.problem_id, s.source_name as title, s.source_url as url, s.source_tier, s.evidence_type, s.created_at,
                        sw.id as sw_id, sw.title as sw_title, sw.authors, sw.year, sw.venue, sw.doi,
                        sw.abstract, sw.citation_count, sw.source_connector
                    FROM problem_sources s
                    LEFT JOIN scholarly_works sw ON s.scholarly_work_id = sw.id
                    WHERE s.problem_id = ?
                    ORDER BY s.created_at ASC
                """
                cursor = conn.execute(query, (problem_id,))
                rows = [dict(r) for r in cursor.fetchall()]
                if rows:
                    return rows

            # If no problem sources, check scholarly_works directly
            query = """
                SELECT 
                    sw.id as sw_id, sw.id as id, sw.title as sw_title, sw.title, sw.authors,
                    sw.year, sw.venue, sw.doi, sw.abstract, sw.citation_count, sw.source_connector,
                    sw.created_at
                FROM scholarly_works sw
                ORDER BY sw.created_at DESC LIMIT 10
            """
            cursor = conn.execute(query)
            return [dict(r) for r in cursor.fetchall()]

    def _fetch_claims(self, problem_id: Optional[str]) -> List[Dict[str, Any]]:
        if not problem_id:
            return []
        with self.storage._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM problem_claims WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,),
            )
            return [dict(r) for r in cursor.fetchall()]

    def _fetch_assumptions(self, problem_id: Optional[str]) -> List[Dict[str, Any]]:
        if not problem_id:
            return []
        with self.storage._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM problem_assumptions WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,),
            )
            return [dict(r) for r in cursor.fetchall()]

    def _fetch_dsr_artifacts(self, session_id: str, problem_id: Optional[str]) -> List[Dict[str, Any]]:
        with self.storage._get_connection() as conn:
            if problem_id:
                cursor = conn.execute(
                    "SELECT * FROM dsr_artifacts WHERE session_id = ? OR problem_id = ? ORDER BY created_at ASC",
                    (session_id, problem_id),
                )
            else:
                cursor = conn.execute(
                    "SELECT * FROM dsr_artifacts WHERE session_id = ? ORDER BY created_at ASC",
                    (session_id,),
                )
            return [dict(r) for r in cursor.fetchall()]

    def _fetch_concept_evaluations(self, session_id: str) -> List[Dict[str, Any]]:
        with self.storage._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM concept_evaluations WHERE session_id = ? ORDER BY created_at ASC",
                (session_id,),
            )
            return [dict(r) for r in cursor.fetchall()]

    def _fetch_feasibility_records(self, session_id: str) -> List[Dict[str, Any]]:
        with self.storage._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM research_feasibility_records WHERE session_id = ? ORDER BY created_at ASC",
                (session_id,),
            )
            return [dict(r) for r in cursor.fetchall()]

    def _fetch_evidence_links(self, claim_ids: List[str]) -> List[Dict[str, Any]]:
        if not claim_ids:
            return []
        placeholders = ",".join("?" for _ in claim_ids)
        query = f"""
            SELECT 
                l.id, l.claim_id, l.source_id, l.relation_type, l.evidence_strength, l.rationale,
                s.scholarly_work_id,
                coalesce(sw.id, s.scholarly_work_id, cast(s.id as text)) as source_work_id,
                cast(s.id as text) as source_id_str
            FROM claim_evidence_links l
            JOIN problem_sources s ON l.source_id = s.id
            LEFT JOIN scholarly_works sw ON s.scholarly_work_id = sw.id
            WHERE l.claim_id IN ({placeholders})
        """
        with self.storage._get_connection() as conn:
            cursor = conn.execute(query, tuple(claim_ids))
            return [dict(r) for r in cursor.fetchall()]

    # -------------------------------------------------------------------------
    # Internal Transformation & Metrics Helpers
    # -------------------------------------------------------------------------

    def _apply_filters(
        self,
        nodes_by_id: Dict[str, ProvenanceNode],
        edges: List[ProvenanceEdge],
        filters: ProvenanceFilterQuery,
    ) -> Tuple[List[ProvenanceNode], List[ProvenanceEdge]]:
        filtered_nodes = list(nodes_by_id.values())

        # Filter by minimum confidence
        if filters.min_confidence > 0.0:
            filtered_nodes = [n for n in filtered_nodes if n.confidence_score >= filters.min_confidence]

        # Filter by methodology stages
        if filters.stages:
            stage_set = set(filters.stages)
            filtered_nodes = [n for n in filtered_nodes if n.stage_id in stage_set]

        # Filter by epistemic tiers
        if filters.tiers:
            tier_set = set(filters.tiers)
            filtered_nodes = [n for n in filtered_nodes if n.tier in tier_set]

        # Filter by search query
        if filters.search_term:
            term = filters.search_term.lower()
            filtered_nodes = [
                n for n in filtered_nodes
                if term in n.label.lower() or (n.description and term in n.description.lower())
            ]

        # Valid active node IDs
        active_ids = {n.id for n in filtered_nodes}

        # Keep edges connecting existing nodes
        valid_edges = [
            e for e in edges
            if e.source in active_ids and e.target in active_ids
        ]

        # Filter orphans if requested
        if not filters.include_orphans:
            connected_ids = {e.source for e in valid_edges} | {e.target for e in valid_edges}
            filtered_nodes = [n for n in filtered_nodes if n.id in connected_ids]

        # Final sort by tier and ID for deterministic output
        filtered_nodes.sort(key=lambda n: (n.tier, n.id))
        valid_edges.sort(key=lambda e: (e.source, e.target, e.edge_type))

        return filtered_nodes, valid_edges

    def _calculate_metrics(
        self,
        nodes: List[ProvenanceNode],
        edges: List[ProvenanceEdge],
        raw_artifacts: List[Dict[str, Any]],
    ) -> ProvenanceMetrics:
        tier_counts: Dict[int, int] = {}
        for n in nodes:
            tier_counts[n.tier] = tier_counts.get(n.tier, 0) + 1

        connected_ids = {e.source for e in edges} | {e.target for e in edges}
        orphans = sum(1 for n in nodes if n.id not in connected_ids)
        contradictions = sum(1 for e in edges if e.is_contradiction)

        avg_conf = (
            sum(n.confidence_score for n in nodes) / len(nodes)
            if nodes else 0.0
        )

        # Grounding ratio: DSR artifacts having incoming edges
        dsr_ids = {n.id for n in nodes if n.tier == int(EpistemicTier.TIER_3_DSR_ARTIFACT)}
        grounded_dsr = sum(1 for art_id in dsr_ids if any(e.target == art_id for e in edges))
        grounded_ratio = (grounded_dsr / len(dsr_ids)) if dsr_ids else 0.0

        return ProvenanceMetrics(
            total_nodes=len(nodes),
            total_edges=len(edges),
            tier_distribution=tier_counts,
            contradiction_count=contradictions,
            average_confidence=round(avg_conf, 4),
            grounded_artifacts_ratio=round(grounded_ratio, 4),
            orphaned_nodes_count=orphans,
        )

    def _compute_graph_state_hash(
        self,
        nodes: List[ProvenanceNode],
        edges: List[ProvenanceEdge],
    ) -> str:
        """Computes deterministic SHA-256 state hash of the graph."""
        canonical_repr = {
            "nodes": [{"id": n.id, "type": n.type.value, "tier": n.tier, "conf": round(n.confidence_score, 4)} for n in nodes],
            "edges": [{"src": e.source, "tgt": e.target, "rel": e.edge_type.value, "contra": e.is_contradiction} for e in edges],
        }
        serialized = json.dumps(canonical_repr, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def _parse_authors(self, authors_field: Any) -> List[str]:
        if not authors_field:
            return []
        if isinstance(authors_field, list):
            return [str(a) for a in authors_field]
        if isinstance(authors_field, str):
            try:
                parsed = json.loads(authors_field)
                if isinstance(parsed, list):
                    return [str(a) for a in parsed]
            except Exception:
                return [a.strip() for a in authors_field.split(",") if a.strip()]
        return []

    def _parse_json_list(self, val: Any) -> List[str]:
        if not val:
            return []
        if isinstance(val, list):
            return [str(v) for v in val]
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return [str(v) for v in parsed]
        except Exception:
            pass
        return []

    def _truncate(self, text: str, max_chars: int) -> str:
        if not text:
            return ""
        return text if len(text) <= max_chars else text[: max_chars - 3] + "..."
