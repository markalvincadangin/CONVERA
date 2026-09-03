# DSR-Informed Computing Research Concept Development Framework

## A Working Guide for Discovering, Validating, Formulating, Evaluating, and Selecting Computing Research Concepts

**Revised and expanded version**  
**August 2026**

Prepared as a practical group guidebook for concept development before formal proposal preparation.

> **Governing rule**  
> The validated problem, research gap, requirements, context, and evaluation needs should constrain and justify the technology choice.

---

## Document Status and Use

This guidebook defines a practical framework for developing and screening candidate Computing research concepts. It creates a shared reasoning process for research groups before a concept is developed into a formal proposal.

The framework is **Design Science Research (DSR)-informed**, but it is not Design Science Research Methodology (DSRM) itself. DSRM is a methodology for conducting and presenting design-science research through problem identification, solution objectives, design and development, demonstration, evaluation, and communication. This guidebook operates mainly at the earlier concept-development and screening stage. It does not require every eventual study to use DSR.

### What this guidebook does

- Creates a consistent process for discovering and validating research problems.
- Adds a preliminary **Problem Bank** stage for collecting and shortlisting problem opportunities without proposing solutions prematurely.
- Separates discovery signals, contextual evidence, and validation evidence.
- Separates evidence that a problem exists from evidence of its magnitude or significance.
- Distinguishes research gaps from missing product features and routine software-development work.
- Requires an answerable research question before technology selection.
- Requires the research question to guide the research purpose, design, evidence, measures, and analysis.
- Requires technology, including emerging technology, to be justified against requirements and evaluation needs.
- Makes evaluability, participant ethics, privacy, security, safety, fairness, research integrity, and feasibility part of concept selection.
- Uses gates to determine eligibility and a weighted matrix to rank only eligible concepts.

### What this guidebook does not do

- It does not prove that a concept is original. Originality remains provisional until a sufficiently broad literature and prior-art review is completed.
- It does not replace an adviser, ethics review, institutional research policy, data-protection requirements, or formal proposal requirements.
- It does not require every Computing study to use DSR as its eventual methodology.
- It does not treat an SDG, national priority, news report, social-media post, or emerging technology as proof that a local research problem exists.
- It does not prescribe one research design for every concept.
- It does not treat technical difficulty as proof of research worthiness.
- It does not guarantee that the highest-scoring concept should be selected if a critical gate has failed.

### Revision scope

This revision preserves the original six-phase and four-gate structure while adding:

- a formal preliminary Problem Bank stage;
- research-purpose and methodological-alignment checks;
- a clearer distinction between routine design and research;
- stronger guidance for online and social-media evidence;
- explicit participant-ethics and research-integrity controls;
- improved documentation templates for evidence, methods, and decisions.

---

## Contents

1. [Introduction](#1-introduction)
2. [Purpose, Scope, and Limitations](#2-purpose-scope-and-limitations)
3. [Academic and Methodological Foundations](#3-academic-and-methodological-foundations)
4. [Key Terminology](#4-key-terminology)
5. [Core Principles](#5-core-principles)
6. [Framework Overview](#6-framework-overview)
7. [Phase A - Problem Discovery](#7-phase-a---problem-discovery)
8. [Phase B - Problem Validation](#8-phase-b---problem-validation)
9. [Phase C - Research Opportunity](#9-phase-c---research-opportunity)
10. [Phase D - Solution Formulation](#10-phase-d---solution-formulation)
11. [Phase E - Evaluation Design](#11-phase-e---evaluation-design)
12. [Phase F - Relevance and Feasibility](#12-phase-f---relevance-and-feasibility)
13. [Gate System](#13-gate-system)
14. [Screening and Ranking System](#14-screening-and-ranking-system)
15. [Evidence and Source Quality Guidelines](#15-evidence-and-source-quality-guidelines)
16. [Participant Ethics, Privacy, and Research Integrity](#16-participant-ethics-privacy-and-research-integrity)
17. [Required Documentation](#17-required-documentation)
18. [Worked Example](#18-worked-example)
19. [Group Usage Procedure](#19-group-usage-procedure)
20. [Final Workflow and Quick Reference](#20-final-workflow-and-quick-reference)
21. [References](#21-references)
22. [Appendices](#appendix-a---revised-concept-canvas)

---

# 1. Introduction

Computing research concepts become weak when a group begins with a fashionable technology and then searches for a problem to attach to it. Statements such as “we want to make an AI system,” “we should use blockchain,” or “our project must use IoT” do not establish who experiences a meaningful problem, whether the problem is important, what existing work already addresses it, what remains unknown, or how a study could generate credible evidence.

This guidebook reverses that pattern. It treats concept development as a sequence of evidence-based decisions. The group first explores application domains, records candidate problems in a Problem Bank, and shortlists problems without assuming a technical solution. It then identifies stakeholders, context, and the current process; defines and validates the problem; examines existing solutions and literature; establishes a research gap and research question; and only afterward formulates objectives, requirements, artifact options, and technology choices.

> **Core idea**  
> A good Computing research concept is not merely a useful application idea. It should contain a meaningful and evidenced problem, a defensible research uncertainty, an appropriate Computing intervention or artifact, a credible evaluation plan, an expected knowledge contribution, and a scope that can be completed responsibly.

The framework supports two related decisions:

1. Whether a candidate problem is sufficiently meaningful, research-worthy, evaluable, ethical, and feasible to continue.
2. Which eligible concept offers the strongest combination of relevance, evidence, research opportunity, technical fit, evaluability, contribution, and feasibility.

The process is iterative. Contrary evidence, access limitations, ethical concerns, measurement problems, or technical constraints may require the group to narrow, reformulate, defer, or reject an idea. Revision is evidence of disciplined research planning, not failure.

---

# 2. Purpose, Scope, and Limitations

## 2.1 Purpose

The purpose of the DSR-Informed Computing Research Concept Development Framework is to guide the systematic discovery, validation, formulation, evaluation planning, and screening of Computing research concepts before the conduct of a full research study.

## 2.2 Intended users

The primary users are student research groups and advisers who need a common basis for discovering, documenting, comparing, and selecting candidate Computing concepts. The framework may also support early discussions with stakeholders, potential participants, institutions, laboratories, domain experts, or partner organizations.

## 2.3 When to use it

- When the group is identifying possible research domains and problems.
- Before committing to a specific app, system, model, device, architecture, or emerging technology.
- Before writing a full research proposal.
- When several candidate problems or concepts must be compared consistently.
- When an idea must be revised after evidence, gap, evaluability, ethics, access, or feasibility weaknesses are discovered.

## 2.4 Scope boundary

The framework is optimized for solution-oriented Computing research in which a group may design, develop, adapt, compare, or evaluate a Computing artifact or approach. The eventual study may use DSR, experimental research, quasi-experimental research, nonexperimental research, software-engineering evaluation, human-computer interaction methods, machine-learning evaluation, IoT experimentation, qualitative inquiry, quantitative inquiry, mixed methods, or another methodology appropriate to the research question.

The framework does not select the final methodology at the Problem Bank stage. Methodological commitment becomes appropriate only after the problem, research gap, question, expected evidence, and evaluation conditions are sufficiently clear.

## 2.5 Concept development versus full research conduct

Concept development asks whether a study is worth pursuing and whether it can be designed credibly. Full research conduct includes detailed sampling, instruments, data collection, implementation, analysis, interpretation, and reporting. This guidebook anticipates those later needs but does not replace the eventual proposal or research protocol.

---

# 3. Academic and Methodological Foundations

The framework is a practical synthesis rather than a published standard under this exact name or sequence. Its structure is informed by established research principles, DSR literature, quality standards, risk frameworks, and ethical guidance useful for Computing concept development.

## 3.1 Empirical and scientific inquiry

Research is a systematic effort to develop, test, refine, or apply knowledge. Empirical inquiry relies on planned observation or measurement rather than unsystematic impressions alone. Scientific inquiry requires claims to be open to examination, evidence to be collected systematically, and conclusions to remain proportionate to the evidence.

Everyday observations, authority, professional experience, news, and public discussion can generate important research ideas. However, they are vulnerable to incomplete information, confirmation bias, availability bias, misinterpretation, and overgeneralization. They should therefore initiate investigation rather than automatically settle a claim.

At the concept stage, good research planning should be:

- **clear**, with a defined purpose and shared terminology;
- **systematic**, with traceable steps and records;
- **logical**, with claims connected to evidence and reasoning;
- **empirical**, where conclusions depend on observable or analyzable evidence;
- **transparent**, including limitations, exclusions, and contradictory findings;
- **replicable or transferable**, to the degree appropriate to the question and context.

## 3.2 Research methods and methodology

Research methods are the procedures used to collect, produce, process, or analyze evidence. Examples include interviews, observations, surveys, experiments, benchmark tests, log analysis, usability testing, statistical analysis, and qualitative coding.

Research methodology is the reasoned justification for how the research will answer its question. It explains why particular methods, participants, data, measures, comparisons, and analyses are suitable and what assumptions or limitations accompany them.

> **Alignment rule**  
> A list of methods is not a methodology. The group must be able to explain why the selected design and methods can produce evidence that answers the research question.

## 3.3 Design Science Research

Design science studies purposeful artifacts and the knowledge produced through their design, construction, use, and evaluation. Hevner et al. emphasize problem relevance, artifact creation, rigorous evaluation, research contribution, rigor, search as an iterative process, and communication. Peffers et al. organize DSRM around problem identification and motivation, solution objectives, design and development, demonstration, evaluation, and communication.

Vaishnavi and Kuechler further emphasize that DSR should be distinguished from routine design by its knowledge contribution and meaningful unknowns. Routine design generally applies established knowledge to a familiar problem. DSR addresses an intellectual uncertainty: something important is not yet known about what design will work, how well it will work, for whom, under what conditions, or why.

Technical difficulty alone is not enough. A system may be difficult to build but still constitute routine development if its relevant principles and expected behavior are already established. Conversely, a relatively small artifact may support strong research when it is used to test a consequential and defensible uncertainty.

Potential DSR contribution types include:

- **Invention:** a substantially new solution or knowledge for a relatively new problem.
- **Improvement:** a meaningfully better solution or knowledge for a known problem.
- **Adaptation:** a nontrivial application or modification of known knowledge for a materially different problem or context.

Potential knowledge outputs include constructs, models, frameworks, architectures, design principles, methods, instantiations, evaluation evidence, datasets, and nascent design theory. A student project is not required to produce a complete design theory, but it should identify the reusable knowledge or evidence expected beyond the prototype itself.

DSR is iterative. Unexpected performance and failed assumptions may reveal boundary conditions or constraint knowledge. Evaluation should therefore examine not only whether an artifact succeeds, but also where, when, for whom, and why it fails.

## 3.4 Research and development characteristics

The OECD Frascati Manual defines R&D as creative and systematic work undertaken to increase knowledge and devise new applications of available knowledge. Its criteria ask whether work is novel, creative, uncertain in outcome, systematic, and transferable or reproducible.

At the concept stage, these become practical questions:

- Is something meaningful genuinely unknown?
- Is the proposed investigation systematic?
- Is there a realistic possibility that the expected claim will not be supported?
- Could the resulting knowledge, method, dataset, design principle, or evidence be reused, transferred, or reproduced?
- Is the proposed contribution more than completion of the artifact?

## 3.5 Research purpose and design alignment

Research questions can serve different purposes. The purpose should be identified provisionally after the research question is formulated and refined as the evaluation plan develops.

| Research purpose | Typical intent | Possible approaches |
|---|---|---|
| Exploratory | Clarify an insufficiently understood problem, process, experience, or design space | Interviews, observation, qualitative inquiry, exploratory technical analysis |
| Descriptive | Describe frequency, characteristics, patterns, performance, or current conditions | Surveys, records analysis, measurements, descriptive technical tests |
| Relational or predictive | Examine associations or prediction among variables | Correlational studies, predictive modeling, validation studies |
| Comparative | Compare approaches, systems, groups, configurations, or conditions | Controlled comparison, benchmark testing, usability comparison |
| Causal or explanatory | Determine whether an intervention or factor produces an effect | Experimental or quasi-experimental designs where ethical and feasible |
| Evaluative | Determine whether an artifact or intervention meets objectives or acceptance criteria | Technical evaluation, user evaluation, field evaluation, mixed methods |
| Design-oriented | Develop and evaluate an artifact while producing reusable design knowledge | DSR or another justified design-and-evaluation methodology |

These categories may overlap. They should clarify the evidence needed, not force every concept into one rigid label. Exploratory studies need not invent a hypothesis merely to appear scientific; comparative or causal claims, however, require an appropriate comparison and design.

## 3.6 Requirements and evaluation quality

ISO/IEC 25010:2023 provides a product-quality model for ICT and software products. It can support requirements, testing objectives, quality-control criteria, acceptance criteria, and product-quality measurement. It should be used selectively: the study should evaluate only the quality characteristics that matter to the research question and context.

Demonstration and evaluation are different. Demonstration shows that an artifact can operate in a relevant scenario. Evaluation systematically generates evidence about whether the artifact satisfies objectives, requirements, or research claims.

## 3.7 Responsible AI and technology risk

For AI-based studies, the NIST AI Risk Management Framework provides a useful risk lens. Relevant considerations may include validity and reliability, safety, security and resilience, accountability and transparency, explainability and interpretability, privacy enhancement, and fairness with harmful bias managed.

Not every characteristic must become a metric in every student study. The group should identify the material risks created by its context, data, users, claims, and technology, then design proportionate controls and evaluation.

## 3.8 Participant ethics, privacy, and research integrity

Research involving people should be planned around respect for persons, beneficence, and justice:

- **Respect for persons:** participation is voluntary and informed; individuals can decline or withdraw; people with limited autonomy receive appropriate protection.
- **Beneficence:** foreseeable risks are minimized and reasonable benefits are maximized.
- **Justice:** participant selection and distribution of burdens and benefits are fair; groups are not recruited merely because they are convenient or less able to refuse.

Philippine research involving personal or sensitive information should also be screened against the Data Privacy Act of 2012, its Implementing Rules and Regulations, institutional policies, and applicable ethics-review requirements. Transparency, legitimate purpose, proportionality, data minimization, security, retention limits, and data-subject safeguards should be addressed before collection.

Research integrity extends beyond participant protection. The group should preserve accurate records, avoid fabrication and falsification, disclose exclusions and material deviations, report results honestly, credit contributions appropriately, avoid plagiarism, and retain evidence needed to verify decisions.

Online information requires contextual judgment. A post that is publicly viewable is not automatically unrestricted research data. Identifiability, reasonable expectations of privacy, group vulnerability, platform context, quotation searchability, consent, and possible harm must be considered.

## 3.9 SDGs and Philippine research relevance

The United Nations Sustainable Development Goals contain 17 goals and 169 targets. This framework uses SDG alignment as a relevance layer, not as evidence that a local problem exists. When an SDG connection is claimed, the group should identify the specific target and explain the mechanism through which the research may contribute.

Philippine relevance may also be supported through national, sectoral, local, or institutional priorities. The DOST Harmonized National R&D Agenda 2022-2028 and relevant DOST-PCIEERD priorities can strengthen significance where they genuinely apply. Alignment does not replace problem validation, a research gap, or credible evaluation.

---

# 4. Key Terminology

| Term | Working definition |
|---|---|
| Application domain | The real-world sector or setting in which a problem occurs, such as agriculture, education, health, environment, transportation, business, disaster management, or public service. |
| Computing area | The Computing discipline or technical area used to investigate a problem, such as AI, data science, HCI, IoT, cybersecurity, software engineering, computer vision, networks, or information systems. |
| Problem Bank | A structured preliminary inventory of technology-neutral problem opportunities collected before full Problem Briefs and formal gate evaluation. |
| Problem Bank entry | One normalized record describing stakeholders, context, current process, candidate problem, preliminary consequences, available signals, evidence status, access status, and next action. |
| Stakeholder | A person, group, organization, or institution that experiences, influences, provides evidence about, evaluates, or is affected by the problem or proposed solution. |
| Context | The conditions under which the problem occurs, including location, users, workflow, devices, connectivity, language, environment, cost constraints, and institutional setting. |
| Current process | The existing sequence of actions, tools, decisions, handoffs, and constraints through which stakeholders currently handle the situation. |
| Problem | A specific undesirable condition, limitation, inefficiency, risk, or unmet need affecting identifiable stakeholders. |
| Discovery signal | Preliminary information suggesting that a problem may exist. It supports investigation but normally cannot validate the claim by itself. |
| Contextual evidence | Evidence supporting the wider setting, sector, policy environment, or background without directly proving the precise local claim. |
| Validation evidence | Evidence that directly supports the problem, stakeholders, context, or magnitude being claimed. |
| Problem magnitude | The scale or importance of a problem, expressed through frequency, severity, cost, time loss, risk, error rate, affected population, or another appropriate measure. |
| Evidence scope | The population, location, period, process, and conditions to which evidence reasonably applies. |
| Conflicting evidence | Credible information that challenges, narrows, qualifies, or contradicts a current claim or interpretation. |
| Existing solution | A current practice, manual process, product, system, algorithm, service, or published research approach addressing some part of the problem. |
| Feature gap | A missing capability or function in an existing product. A feature gap alone is not automatically a research gap. |
| Research gap | A meaningful limitation, uncertainty, inconsistency, untested condition, or insufficiently established claim in existing knowledge. |
| Intellectual uncertainty | A consequential unknown about what works, how well, for whom, under what conditions, or why; it distinguishes research from routine construction. |
| Research question | A focused and answerable question expressing what the study seeks to determine rather than merely what it seeks to build. |
| Research purpose | The principal intent of the question, such as exploration, description, comparison, prediction, explanation, evaluation, or design-oriented knowledge production. |
| Research design | The organized plan linking the research question to data, participants, conditions, measures, analysis, and conclusions. |
| Research method | A procedure used to collect, produce, process, or analyze evidence. |
| Research methodology | The reasoned justification for the selected design and methods, including their assumptions, fit, and limitations. |
| Methodological alignment | Consistency among the question, purpose, design, data, participants, measures, analysis, and intended conclusion. |
| Solution objective | A statement of what an effective solution should achieve in response to the validated problem and research question. |
| Requirement | A functional, quality, contextual, ethical, safety, data, interoperability, or operational condition constraining the solution. |
| Artifact | A Computing output being designed or investigated, such as a system, model, algorithm, method, dataset, architecture, device, framework, or prototype. |
| Routine design | Application of substantially established knowledge and techniques to a familiar problem without a sufficient research uncertainty or knowledge contribution. |
| Emerging-technology component | A contemporary technology whose use is justified by a specific capability, requirement, or research uncertainty. |
| Demonstration | Showing that the artifact can function in a relevant scenario, test case, simulation, or deployment. |
| Evaluation | Systematically measuring or analyzing whether the artifact satisfies objectives, requirements, and research claims. |
| Reference point | A baseline, current process, benchmark, gold standard, comparison condition, before-and-after state, or acceptance criterion used to interpret results. |
| Provisional originality | An initial evidence-supported claim that a concept may be new or meaningfully different, requiring confirmation through broader review. |
| Contribution type | A provisional classification of the expected contribution as invention, improvement, adaptation, or another justified category. |
| Expected research contribution | The knowledge, evidence, reusable method, dataset, architecture, design principle, evaluation protocol, or validated capability the research is expected, but has not yet proven, to contribute. |
| Participant vulnerability | A condition that may limit a person's ability to understand, freely decide, decline, withdraw, or protect their interests in research. |
| Research integrity | Honest, transparent, traceable, and responsible conduct in evidence collection, data handling, analysis, attribution, authorship, and reporting. |
| Feasibility | The practical ability to complete the study within constraints involving time, cost, skills, equipment, data, participants, approvals, deployment access, and risk controls. |

---

# 5. Core Principles

1. **Start with a meaningful problem, not a technology.** Technology is selected after the group understands what problem matters and what capability is required.
2. **Use the Problem Bank for disciplined exploration.** Record problem opportunities consistently before investing in full validation or concept design.
3. **Identify stakeholders, context, and the current process before finalizing the problem.** The problem must be situated in real users, workflows, conditions, and available research access.
4. **Discovery signals are not automatically validation evidence.** News, public discussion, social media, and preliminary conversations may reveal problems but usually require corroboration.
5. **Problem evidence is different from SDG or policy relevance.** Broader alignment can justify significance but cannot prove a local problem.
6. **Problem existence is different from problem magnitude.** Evidence that a problem occurs does not automatically show it is frequent, severe, costly, risky, or important enough to study.
7. **Evidence should match the scope of the claim.** National data cannot by itself prove an institution-specific condition, and one interview cannot prove widespread prevalence.
8. **Contradictory evidence must be retained and investigated.** It may narrow the claim, reveal boundary conditions, or require rejection.
9. **A feature gap is not automatically a research gap.** A missing dashboard, notification, or feature becomes researchable only when connected to a meaningful uncertainty that can be investigated.
10. **Technical difficulty is not automatically research worthiness.** The concept should address an intellectual uncertainty and produce evidence or knowledge beyond completing the artifact.
11. **The research question should precede technology selection.** The group should know what it seeks to determine before selecting the artifact or emerging technology.
12. **Research design should follow the research question.** Purpose, data, participants, measures, methods, and analysis should be aligned.
13. **Requirements should constrain the solution.** Functional, quality, contextual, ethical, data, and operational requirements determine which technical options are appropriate.
14. **Emerging technology must be justified and evaluable.** Its necessity, expected advantage, feasibility, and risks must be explicit.
15. **Demonstration is different from evaluation.** Showing that a prototype runs is not the same as producing evidence that it works well or improves on a reference condition.
16. **Failure and boundary conditions are research results.** Evaluation should examine deviations, limitations, and contexts where expectations are not met.
17. **Participant ethics, privacy, safety, security, fairness, and integrity are cross-cutting.** They must be reviewed throughout discovery, data planning, design, evaluation, and reporting.
18. **Public availability does not automatically eliminate ethical duties.** Online content must be considered in context, especially when individuals or vulnerable groups may be identifiable.
19. **Gates determine eligibility; scores rank eligible concepts.** Numerical strengths cannot compensate for a failed critical gate.
20. **Originality and contribution remain provisional at the concept stage.** The group should avoid claiming that either has already been established.

---

# 6. Framework Overview

## 6.1 Preliminary stage - Problem Bank

The Problem Bank is a structured inventory of potential real-world problems. It allows the group to explore broadly while preventing premature investment in solutions, research titles, or technologies.

### Problem Bank activities

- Explore priority application domains one at a time.
- Gather problem signals from scholarly, official, institutional, professional, community, news, and relevant public online sources.
- Normalize each signal into a technology-neutral problem entry.
- Identify possible duplication or overlap among entries.
- Label evidence by type and scope.
- Record uncertainty, conflicting evidence, access status, and ethical sensitivity.
- Assign a working status and next action.

### Required fields

A Problem Bank entry should capture:

- problem ID;
- application domain;
- stakeholder group;
- context or location;
- current process;
- candidate problem;
- preliminary consequences;
- available source or signal;
- evidence classification and scope;
- magnitude status;
- conflicting evidence, if any;
- evidence reachability;
- stakeholder or data-access status;
- ethical sensitivity;
- working status and next action.

### Access statuses

| Status | Meaning at the Problem Bank stage |
|---|---|
| Confirmed | A relevant stakeholder, site, dataset, or evidence holder has confirmed potential access. |
| Likely | Access appears realistic but has not been formally confirmed. |
| Unconfirmed | No confirmation exists yet, but a plausible access path remains. |
| Difficult | Access may be possible but depends on substantial approvals, coordination, cost, or timing. |
| Blocked | No realistic or ethical access path is currently identifiable. |

Unconfirmed access does not automatically remove an entry. A problem may remain in the bank when credible evidence is reachable and the access uncertainty is explicitly recorded. Blocked access normally requires deferral unless the concept can be responsibly reformulated around obtainable evidence.

### Working statuses

| Status | Meaning |
|---|---|
| Investigate | Promising but requires further clarification or evidence. |
| Ready for Problem Brief | Specific, consequential, and supported enough to receive Phase A work. |
| Retain as backup | Plausible but currently lower priority than other entries. |
| Defer | Evidence, access, scope, timing, or ethical conditions are currently inadequate but may change. |
| Remove | Duplicated, unsupported, outside scope, not meaningful, or clearly impractical. |

### Shortlisting filter

A problem may move to Phase A when:

- it describes a concrete undesirable condition rather than a broad topic;
- identifiable stakeholders and a context are visible;
- at least one credible evidence path is reachable;
- consequences appear meaningful enough to investigate;
- the problem may support a Computing research inquiry without assuming a technology;
- no obvious and unresolvable ethical or practical barrier is already known.

> **Important**  
> The shortlisting filter is not a fifth formal gate. It controls research effort before the group prepares full Problem Briefs.

**Required output:** Problem Bank Register.

## 6.2 Six-phase framework

| Phase | Main decision | Required output | Formal gate |
|---|---|---|---|
| A - Problem Discovery | Can the group describe a concrete problem in a real context? | Problem Brief | None |
| B - Problem Validation | Does the problem exist, matter, and appear ethically and practically investigable? | Evidence and Impact Brief | Gate 1 |
| C - Research Opportunity | Is there a defensible unknown and answerable research question? | Gap Statement and Research Question | Gate 2 |
| D - Solution Formulation | What objectives, requirements, artifact, and technology are justified? | Requirements and Proposed-Solution Brief | None |
| E - Evaluation Design | Can the research question be answered with obtainable evidence and a credible method? | Evaluation Protocol | Gate 3 |
| F - Relevance and Feasibility | Is the complete concept responsible, worthwhile, and executable? | Completed Concept Package | Gate 4 |

## 6.3 Detailed logic

```text
Explore application domains
        ↓
Build and maintain Problem Bank
        ↓
Apply shortlisting filter
        ↓
Stakeholders + context + current process
        ↓
Candidate problem + preliminary consequences
        ↓
Problem evidence + magnitude + access + early ethics
        ↓
Gate 1: Problem Validity
        ↓
Existing solutions + literature + limitations
        ↓
Research gap + intellectual uncertainty + research question
        ↓
Research purpose + preliminary methodological direction
        ↓
Gate 2: Research Worthiness
        ↓
Solution objectives + requirements
        ↓
Artifact options + technology selection + contribution type
        ↓
Demonstration plan + evaluation plan
        ↓
Gate 3: Evaluability
        ↓
Expected contribution + relevance + feasibility + final ethics/integrity review
        ↓
Gate 4: Final Eligibility
        ↓
Score eligible concepts + adviser/stakeholder review + selection
```

## 6.4 Iteration rule

If evidence, research gap, methodological alignment, evaluability, ethics, privacy, security, safety, access, integrity, or feasibility is inadequate, the concept returns to the relevant earlier stage. The group should record what failed, why it failed, what changed, and which evidence justified the new decision.

## 6.5 Decision discipline

At every stage, record one of the following:

- **Continue:** current requirements are met.
- **Revise:** return to the relevant earlier activity with a defined correction.
- **Defer:** retain the work but pause until a dependency or condition changes.
- **Reject or remove:** stop because the underlying problem, research opportunity, ethics, or feasibility is not defensible.

---

# 7. Phase A - Problem Discovery

**Purpose:** Convert a shortlisted Problem Bank entry into a clear description of a meaningful real-world problem in a defined context, without designing a technology first.

## Key questions

- Where does the issue occur?
- Who experiences, influences, or is affected by it?
- What is the current process or situation?
- What specifically is undesirable, inefficient, risky, inaccurate, inaccessible, delayed, or unmet?
- What consequences appear to result?
- Which statements are observed, documented, inferred, or still uncertain?
- Who may later provide validation evidence, data, access, or expert review?

## Typical activities

- Select an entry that passed the Problem Bank shortlisting filter.
- Map the stakeholder, setting, current workflow, handoffs, tools, and decision points.
- Review the original discovery sources and check whether they support the wording used.
- Conduct preliminary stakeholder conversations or observation when available and appropriate.
- Identify relevant institutional documents, records, or evidence holders.
- Write the problem statement before suggesting technical interventions.
- Record assumptions, possible alternative interpretations, and evidence still needed.

## Evidence or sources to use

- Initial stakeholder conversations.
- Process observations.
- Institutional documents or public records.
- Official sector reports used as background.
- Local news or public discussion used as discovery signals.
- Preliminary scholarly search used to understand terminology and context.

## Required output

> **Problem Brief**  
> A concise brief stating: Problem Bank ID + stakeholder + context + current process + candidate problem + preliminary consequences + discovery evidence + assumptions + evidence needed + access status.

## Quality criteria

- The problem is specific enough to investigate.
- Stakeholders and the context are identifiable.
- The current process is described rather than assumed.
- The problem is expressed without assuming a particular technology.
- Observed facts are distinguishable from preliminary interpretations.
- Consequences are plausible but not exaggerated beyond the evidence.
- Evidence, access, and ethical uncertainties are visible.

## Common mistakes

- Beginning with “We want to use AI, IoT, blockchain, or another technology.”
- Treating a broad topic such as waste management or healthcare as a problem statement.
- Writing the proposed solution inside the problem statement.
- Ignoring the current process or existing stakeholder practices.
- Treating one highly visible incident as proof of a widespread condition.
- Removing a potentially important problem only because stakeholder access is not yet confirmed.
- Concealing uncertainty to make an entry appear stronger.

## Decision

Continue to Phase B only when the group can describe a concrete candidate problem in a real context and can identify plausible evidence paths for validation.

## Illustrative example

**Application domain:** Agriculture.  
**Stakeholders and context:** Small-scale vegetable farmers in a selected locality.  
**Current process:** Visual inspection of plant leaves with consultation or manual references when symptoms are uncertain.  
**Candidate problem:** Some visually similar symptoms may be difficult to distinguish under field conditions, potentially delaying an appropriate response.  
**Current evidence status:** Preliminary only. The group has not yet established frequency, severity, local prevalence, or the suitability of a Computing intervention.

---

# 8. Phase B - Problem Validation

**Purpose:** Determine whether the candidate problem exists in the claimed context, whether it is significant enough to investigate, and whether the group can ethically and practically study it.

## Key questions

- What credible evidence shows that the problem exists?
- What evidence shows its frequency, severity, cost, risk, delay, error, or other impact?
- Does the evidence match the claimed population, location, period, and process?
- What evidence contradicts, narrows, or offers an alternative explanation?
- Can the group obtain the required site, participants, records, measurements, or expert validation?
- Are the data and procedures ethically and legally obtainable?
- Would the claim remain valid if it were narrowed?

## Typical activities

- Create Evidence Cards for important sources and claims.
- Separate discovery signals, contextual evidence, and validation evidence.
- Separate problem-existence evidence from magnitude evidence.
- Triangulate records, observations, stakeholder accounts, literature, and measurements when appropriate.
- Search deliberately for contrary evidence and alternative explanations.
- Assess source credibility, scope, definitions, dates, and limitations.
- Record stakeholder, data, site, and expert-access status.
- Conduct an early participant-ethics, privacy, safety, and approval screen.
- Revise the problem statement when evidence supports a narrower or different claim.

## Evidence or sources to use

- Local institutional records and measurements.
- Government statistics and official datasets.
- Peer-reviewed literature.
- Structured interviews, surveys, or focus groups when methodologically appropriate.
- Direct observations or pilot measurements conducted under an approved protocol where required.
- Domain-expert or stakeholder validation.
- News and online sources only within their defensible scope and with corroboration for central claims.

## Required outputs

1. **Evidence Cards** documenting the strongest sources and their limitations.
2. **Evidence and Impact Brief** synthesizing problem existence, magnitude, evidence scope, contrary evidence, access conditions, and early ethical constraints.

## Quality criteria

- At least one credible line of evidence directly matches the claimed context.
- Problem existence and problem magnitude are evaluated separately.
- Claims are proportional to the strength and scope of the evidence.
- Contrary evidence and reasonable alternative explanations are addressed.
- Important source definitions and limitations are understood.
- Data, stakeholder, site, and evaluation access appear realistic or have credible confirmation plans.
- No known ethical or legal barrier makes the investigation irresponsible or impossible.

## Common mistakes

- Using an SDG or national statistic as the only proof of a local problem.
- Treating an anecdote, viral post, or isolated incident as evidence of prevalence.
- Counting several sources that repeat the same underlying claim as independent evidence.
- Ignoring evidence that challenges the preferred interpretation.
- Collecting personal or sensitive data before considering consent, purpose, minimization, security, retention, and approval.
- Claiming that access is confirmed when it is merely assumed.
- Exaggerating magnitude beyond what the evidence supports.

## Decision

Apply **Gate 1 - Problem Validity**. A candidate that does not pass should be revised, deferred, or rejected before literature-heavy solution work continues.

## Illustrative example

Suppose local interviews and agricultural-extension records support that selected farmers experience difficulty distinguishing visually similar symptoms, but the evidence covers only one municipality. The problem statement should remain local. Regional or national studies may provide context but should not silently expand the local claim.

---

# 9. Phase C - Research Opportunity

**Purpose:** Determine what existing work already knows, what meaningful limitation remains, and whether the concept contains a genuine research uncertainty rather than only a missing software feature or routine implementation task.

## Key questions

- How is the problem currently handled?
- What systems, methods, algorithms, products, datasets, standards, and studies already exist?
- What relevant limitations remain?
- What is unknown, untested, inconsistent, or insufficiently established?
- Is the uncertainty consequential to the validated problem?
- What focused question could the study answer?
- What type of research purpose does the question imply?
- Would answering the question generate reusable knowledge, evidence, or capability?
- Why is the work not merely routine design?
- Why does the concept appear provisionally original?

## Typical activities

- Conduct a structured state-of-the-art and prior-art review.
- Compare approaches by context, data, performance, cost, connectivity, hardware, usability, privacy, robustness, fairness, or other relevant dimensions.
- Review current stakeholder practice and nonacademic solutions where relevant.
- Separate product-feature gaps from research gaps.
- Identify the intellectual uncertainty explicitly.
- Formulate an answerable research question rather than a development instruction.
- Classify the likely research purpose: exploratory, descriptive, relational/predictive, comparative, causal/explanatory, evaluative, or design-oriented.
- Draft a preliminary methodological direction without locking the full proposal design prematurely.
- State provisional originality cautiously and identify further searches needed.

## Evidence or sources to use

- Recent peer-reviewed surveys, systematic reviews, or strong state-of-the-art papers when available.
- Primary peer-reviewed studies directly related to the proposed limitation.
- Official technical documentation, standards, datasets, and benchmark reports.
- Prior theses or institutional studies where relevant.
- Existing commercial or open-source solutions forming part of current practice.
- Patent or prior-art sources when originality depends on implementation novelty.

## Required output

> **Gap Statement and Research Question Brief**  
> A concise document summarizing existing approaches, the limitation that matters, the research gap, the intellectual uncertainty, the answerable question, the likely research purpose, the preliminary methodological direction, the routine-design test, and the provisional originality claim.

## Quality criteria

- The gap is supported by evidence from existing work.
- The group can state clearly what is already known and what remains unknown.
- The uncertainty matters to the validated problem and stakeholders.
- The question can generate evidence and is not simply “How can we develop...?”
- The likely research purpose is consistent with the wording of the question.
- The preliminary methodological direction could reasonably answer the question.
- The expected result extends beyond possession of a functioning prototype.
- Originality remains provisional.

## Routine-design test

Ask all of the following:

1. Is the problem already well understood?
2. Is the proposed approach already established for materially similar conditions?
3. Are expected results largely predictable from existing knowledge?
4. Would completion produce only a situated application, with little reusable evidence or knowledge?
5. Is the main challenge implementation effort rather than intellectual uncertainty?

Several “yes” answers indicate a risk of routine design. The group should identify a defensible unknown, strengthen the evaluation claim, narrow the question, or reconsider the concept.

## Common mistakes

- Equating a missing notification, dashboard, integration, or mobile version with a research gap.
- Using only old or non-scholarly comparisons for a technical novelty claim.
- Calling a local deployment original only because it has not been built in that location.
- Writing a question that merely restates the development task.
- Forcing a hypothesis onto a genuinely exploratory question.
- Claiming “no study has done this” after a small or undocumented search.
- Mistaking technical complexity for research contribution.

## Decision

Apply **Gate 2 - Research Worthiness**. If the concept lacks a defensible unknown, aligned question, or expected knowledge contribution, revise the gap or reconsider the concept.

## Illustrative example

**Feature gap:** An existing crop-disease application lacks offline notifications.  
**Possible research gap:** Existing work may not have established whether a lightweight, locally relevant model can maintain predefined classification performance and inference time on lower-cost phones under specified field-image conditions.  
**Likely purpose:** Comparative/evaluative and design-oriented.  
**Intellectual uncertainty:** Whether device and field constraints allow the approach to meet defined performance criteria.

---

# 10. Phase D - Solution Formulation

**Purpose:** Translate the validated problem and research question into measurable objectives and requirements, then select an artifact and technologies that satisfy those requirements.

## Key questions

- What must an effective solution achieve?
- What must the artifact do, and how well must it perform?
- What contextual constraints matter, such as offline use, local language, cost, device limitations, connectivity, environment, accessibility, or institutional workflow?
- Which Computing area and artifact type best fit the question?
- Which technical options are available?
- Could a simpler or more established approach answer the question adequately?
- What technology is appropriate, and what emerging component is actually necessary?
- What new risks does the proposed technology introduce?
- Is the expected contribution invention, improvement, adaptation, or another justified form?

## Typical activities

- Write solution objectives before selecting technologies.
- Define functional, quality, contextual, data, ethical, safety, security, accessibility, and interoperability requirements.
- Trace each important requirement to problem or research evidence.
- Compare multiple artifact and technical options.
- Include at least one simpler or more established alternative where realistic.
- Define the artifact type and high-level architecture.
- Justify each major technology against a requirement or research uncertainty.
- Classify the provisional contribution type.
- Limit scope to what can be built and evaluated within the project period.
- State excluded features and out-of-scope claims.

## Evidence or sources to use

- Requirements evidence from stakeholders and the current process.
- Research-gap and technical literature.
- Official platform, device, and interoperability documentation.
- Relevant technical standards.
- Applicable quality and technology-risk frameworks.
- Actual resource, equipment, and team-skill information.

## Required output

> **Requirements and Proposed-Solution Brief**  
> A concise specification of solution objectives, measurable requirements, artifact options, selected artifact, high-level architecture, technology choices, simpler alternatives considered, emerging-technology justification, provisional contribution type, scope, excluded features, and introduced risks.

## Quality criteria

- Each major technology maps to at least one requirement or research need.
- Requirements are traceable to evidence rather than preference.
- A simpler approach has been considered fairly.
- Expected technical advantages are measurable.
- Contribution classification is plausible but provisional.
- Scope boundaries and excluded features are explicit.
- Risks introduced by the artifact and technology are identified.
- The design remains compatible with the planned evaluation conditions.

## Common mistakes

- Adding AI, blockchain, AR/VR, IoT, or another technology only to appear innovative.
- Treating a large feature list as evidence of research quality.
- Designing a production-scale platform when a research prototype would answer the question.
- Choosing architecture before understanding the evidence and evaluation needs.
- Comparing the preferred technology only with obviously unsuitable alternatives.
- Claiming invention when the work is more accurately an improvement or adaptation.

## Decision

Proceed only when the proposed artifact and technologies are necessary, proportionate, traceable, and testable within the intended context.

## Illustrative example

**Requirement:** Run on lower-cost Android hardware with intermittent connectivity.  
**Artifact:** Mobile classification research prototype.  
**Emerging component:** Lightweight edge AI.  
**Justification:** Edge inference addresses the connectivity and latency requirements. The study must still test whether the constrained model meets defined classification and inference-time criteria. Ordinary interface and database components remain supporting elements rather than claimed innovations.

---

# 11. Phase E - Evaluation Design

**Purpose:** Establish before development how the study will demonstrate functionality and produce credible evidence that answers the research question.

## Key questions

- What scenario will demonstrate that the artifact functions?
- What research design best matches the question and purpose?
- What baseline, benchmark, current process, gold standard, comparison condition, or acceptance criterion will be used?
- What participants, datasets, devices, sites, cases, or conditions are required?
- Which technical, user, process, or impact measures matter?
- How will abstract concepts be operationalized and measured?
- What analysis will support the intended conclusion?
- What failure cases, deviations, and boundary conditions will be examined?
- What validity, bias, privacy, safety, security, and fairness controls are required?
- What approvals, consent procedures, or data agreements are needed?

## Typical activities

- Define a demonstration scenario separately from the evaluation protocol.
- Confirm alignment among question, purpose, design, evidence, sampling, measures, and analysis.
- Operationalize comparative terms such as faster, more accurate, cheaper, safer, more usable, or more robust.
- Select a defensible reference point or acceptance criterion.
- Identify datasets, participants, experimental conditions, devices, test cases, and analysis methods.
- Plan appropriate sampling or case-selection logic.
- Predefine material exclusion rules and data-quality checks.
- Plan error, failure, subgroup, robustness, and boundary-condition analysis where relevant.
- Identify threats to internal validity, external validity, construct validity, and conclusion validity as appropriate.
- Complete the participant-ethics, privacy, security, and data-management plan.

## Evidence or sources to use

- Relevant technical standards and benchmarks.
- Ground-truth labels or expert references.
- Existing-system or current-process data.
- Validated instruments or justified researcher-developed measures.
- User-testing protocols when people interact with the artifact.
- Technology-specific evaluation literature.
- Institutional ethics, privacy, data, and security requirements.

## Required output

> **Evaluation Protocol**  
> A pre-development plan specifying the research design, demonstration scenario, reference condition, participants or data, sampling or case selection, measures, metrics, procedure, analysis, acceptance criteria, exclusions, failure analysis, validity controls, ethics, privacy, and required approvals.

## Quality criteria

- The research question can be answered from the planned evidence.
- Research purpose, design, methods, measures, and analysis are aligned.
- Metrics and constructs are operationally defined rather than vague.
- A defensible reference point or acceptance criterion exists.
- Required data, participants, experts, devices, sites, and testing conditions are obtainable.
- Failure and boundary-condition analysis is planned where material.
- Ethical, privacy, bias, safety, security, and fairness concerns are addressed.
- The evaluation does not claim more than the design can support.

## Common mistakes

- Treating successful execution as proof of effectiveness.
- Using only user satisfaction to evaluate a technical-performance claim.
- Measuring accuracy while ignoring class imbalance, error costs, or relevant subgroup performance.
- Claiming causation from a design that can establish only association.
- Claiming improvement without a comparison or reference condition.
- Selecting convenient participants without considering fairness, relevance, or power relationships.
- Changing measures or exclusions after seeing results without disclosure.
- Planning evaluation only after development is complete.

## Decision

Apply **Gate 3 - Evaluability**. If the question cannot be answered with obtainable data and a credible, ethical method, revise the question, scope, requirements, artifact, or evaluation design.

## Illustrative example

**Demonstration:** The phone classifies a captured leaf image offline.  
**Evaluation:** Compare model outputs with expert-validated labels; measure appropriate classification metrics, inference time on selected lower-cost devices, and predefined failure cases under defined field-image conditions. Record where performance falls below acceptance criteria and whether those failures indicate important boundary conditions.

---

# 12. Phase F - Relevance and Feasibility

**Purpose:** Determine whether the complete, evaluable concept is worth selecting, responsibly executable, aligned with broader priorities where appropriate, and likely to produce a useful contribution.

## Key questions

- What knowledge, evidence, or reusable capability is the study expected to contribute?
- What is the provisional contribution type and artifact or knowledge output?
- Which SDG target, if any, is meaningfully connected to the validated problem?
- Which Philippine, local, sectoral, or institutional priorities genuinely apply?
- Can the group complete development and evaluation within the available time, cost, skills, equipment, and infrastructure?
- Are data, participant, site, expert, and deployment access confirmed or supported by credible plans?
- What institutional approvals or agreements are required?
- Can participant ethics, privacy, safety, security, fairness, and integrity risks be reasonably controlled?
- Is the expected conclusion appropriately limited to the proposed design and evidence?

## Typical activities

- Write the expected contribution as provisional rather than proven.
- Classify the contribution as invention, improvement, adaptation, or another justified category.
- Identify the expected reusable output beyond the prototype.
- Map the problem to a specific SDG target only where a defensible mechanism exists.
- Check current national, sectoral, local, or institutional priorities where relevant.
- Estimate development, data preparation, labeling, recruitment, evaluation, analysis, and documentation effort.
- Confirm equipment, skills, software, site, data, participant, expert, and approval dependencies.
- Define a data-management and research-integrity plan.
- Apply the final ethics, privacy, safety, security, and fairness review.
- Prepare fallback, reduction, or exit conditions for high-risk dependencies.

## Evidence or sources to use

- United Nations SDG goals and targets.
- DOST HNRDA and relevant DOST-PCIEERD priorities.
- Local institutional plans and policies.
- Actual budget, schedule, team-skill inventory, equipment availability, and access records.
- Applicable research ethics, data protection, safety, and security requirements.
- Stakeholder, expert, or adviser feedback.

## Required output

> **Completed Concept Package**  
> Completed Concept Canvas + gate results + screening score when eligible + feasibility notes + expected contribution + contribution type + alignment statement + ethics/integrity record + final recommendation.

## Quality criteria

- The expected contribution is more than “we will build an application.”
- The contribution type and knowledge output are plausible and clearly stated.
- SDG or policy alignment explains a specific mechanism and remains proportional to the study.
- Feasibility estimates reflect the actual project period and team capability.
- Critical access and approval dependencies have confirmation, owners, timelines, and fallback plans.
- Participant, data, technology, and reporting risks can be reasonably controlled.
- No unresolved issue makes the study irresponsible, unlawful, or impractical.

## Common mistakes

- Claiming several SDGs without a target-level connection.
- Using national alignment as a substitute for a research gap.
- Underestimating data preparation, labeling, recruitment, hardware, approval, or evaluation effort.
- Treating permission to access a site as permission to use all available data.
- Ignoring authorship, data provenance, or reporting responsibilities.
- Calling the concept original before sufficient review.

## Decision

Apply **Gate 4 - Final Eligibility**. Only concepts that pass all four gates proceed to numerical ranking and final adviser/stakeholder review.

## Illustrative example

**Expected contribution:** Evidence about whether a lightweight edge-AI approach can meet predefined classification and latency criteria on lower-cost phones under selected local field conditions, accompanied where feasible by a documented evaluation protocol or responsibly governed dataset.  
**Contribution type:** Potential adaptation or improvement, subject to broader review.  
**Alignment:** SDG 2 may be relevant only if the validated problem and target connection concern sustainable agricultural productivity. The SDG claim must remain proportionate to the actual scope.

---

# 13. Gate System

Gates are mandatory decision points. They determine whether a concept is eligible to continue. The scoring system must never compensate for a failed critical gate.

For every gate, record one result:

- **PASS:** Eligible to continue.
- **REVISE:** Return to the relevant earlier phase with a specified correction.
- **FAIL:** Defer or reject unless the underlying constraint changes.

## Gate 1 - Problem Validity

Pass only when:

- [ ] Credible evidence supports the existence of the problem.
- [ ] Relevant stakeholders and context are identifiable.
- [ ] The current process is sufficiently understood.
- [ ] The problem appears significant enough to investigate.
- [ ] At least one important line of evidence directly matches the proposed context and scope.
- [ ] Problem-existence evidence and magnitude evidence are distinguished.
- [ ] Discovery signals are not being treated as validation evidence without justification.
- [ ] Material conflicting evidence and alternative explanations have been considered.
- [ ] Evidence, stakeholder, data, site, and expert-access statuses are recorded honestly.
- [ ] Investigation appears ethically, legally, and practically possible.

**Required record:** Result + evidence-based reason + required revision + responsible person + target date.

## Gate 2 - Research Worthiness

Pass only when:

- [ ] Existing knowledge, practice, products, and solutions have been examined sufficiently for the concept stage.
- [ ] The gap is more than a missing application feature.
- [ ] A meaningful intellectual uncertainty is stated.
- [ ] The research question is focused and answerable.
- [ ] The likely research purpose is identified.
- [ ] The preliminary methodological direction is compatible with the question.
- [ ] The work is distinguishable from routine design.
- [ ] The question could generate reusable knowledge, evidence, or capability.
- [ ] Provisional originality is supported by the initial review and stated cautiously.
- [ ] Further literature or prior-art searches still needed are documented.

**Required record:** Result + evidence-based reason + routine-design finding + required revision + responsible person + target date.

## Gate 3 - Evaluability

Pass only when:

- [ ] The expected outcome or claim is measurable or otherwise systematically analyzable.
- [ ] The research design can answer the research question.
- [ ] A defensible baseline, benchmark, gold standard, comparison, or acceptance criterion exists where required.
- [ ] Required data, participants, labels, experts, devices, sites, or test cases are obtainable.
- [ ] Sampling or case-selection logic fits the intended conclusion.
- [ ] Measures and metrics are defined and valid for the claim.
- [ ] The proposed analysis fits the data and design.
- [ ] Failure cases, deviations, and boundary conditions will be examined where material.
- [ ] Relevant validity, bias, privacy, safety, security, and fairness controls are planned.
- [ ] The evidence produced will not be used to support a stronger conclusion than the design permits.

**Required record:** Result + methodological-alignment reason + required revision + responsible person + target date.

## Gate 4 - Final Eligibility

Pass only when:

- [ ] Required data, stakeholder, site, expert, equipment, and evaluation access are realistically available.
- [ ] Required institutional approvals or agreements are obtainable within the schedule.
- [ ] The scope can be completed within the project period.
- [ ] The team has or can obtain the necessary skills and resources.
- [ ] The technology is justified rather than decorative.
- [ ] The artifact can be tested under conditions relevant to the research question.
- [ ] The expected contribution extends beyond building the artifact.
- [ ] Contribution type and expected knowledge output are stated provisionally.
- [ ] Participation is voluntary and informed where required.
- [ ] Participants can decline or withdraw without inappropriate consequences.
- [ ] Risks are minimized and expected benefits justify remaining burdens.
- [ ] Participant selection is fair and vulnerable groups receive appropriate protection.
- [ ] Privacy, confidentiality, security, retention, and disposal controls are adequate.
- [ ] Online or social-media data use is contextually and ethically justified.
- [ ] Research-integrity, data-provenance, attribution, and reporting controls are in place.
- [ ] No unresolved ethical, legal, safety, security, or feasibility issue makes the study irresponsible or impractical.

**Required record:** Result + final eligibility reason + unresolved dependencies + required revision + responsible person + target date.

> **Non-negotiable rule**  
> Gates determine eligibility; scores help rank eligible concepts.

---

# 14. Screening and Ranking System

Apply the weighted screening matrix only after a concept passes all four gates. Its purpose is comparative ranking, not automatic approval.

## 14.1 Criteria and weights

| Criterion | Weight | What the score should reflect |
|---|---:|---|
| Problem significance and stakeholder relevance | 15 | How meaningful and important is the validated problem to the identified stakeholders? |
| Strength and appropriateness of evidence | 15 | How credible, sufficient, direct, current, and scope-matched is the evidence? |
| Research gap and question | 15 | How clear and defensible is the unknown, and can the question produce evidence? |
| Expected originality and contribution | 15 | How plausible and useful are the provisional originality, contribution type, and expected knowledge output? |
| Solution and technology fit | 10 | How well do the artifact and technologies satisfy evidence-based requirements and research needs? |
| Feasibility | 10 | Can the group obtain the time, skills, equipment, data, participants, approvals, and evaluation access? |
| Evaluation quality and measurability | 10 | Can the concept be evaluated with aligned methods, credible metrics, reference conditions, and analysis? |
| Ethics, privacy, safety, security, and integrity | 5 | Can material participant, data, technology, and reporting risks be identified and reasonably controlled? |
| SDG, national, local, or institutional alignment | 5 | Is broader alignment meaningful, specific, and proportionate to the study? |
| **Total** | **100** | |

## 14.2 Rating scale

| Score | Interpretation | Minimum evidence expectation |
|---:|---|---|
| 1 | Very weak or unsupported | Little or no defensible evidence; major claim problems remain. |
| 2 | Weak; major refinement required | Some support exists, but important evidence, alignment, or feasibility weaknesses remain. |
| 3 | Adequate but still needs refinement | Minimum support is present; limitations and improvement needs are clearly recorded. |
| 4 | Strong and well supported | Multiple relevant lines of evidence support the rating; limitations are controlled or manageable. |
| 5 | Very strong, clear, and well supported | Evidence is unusually direct, sufficient, coherent, and well matched to the concept-stage claim. |

A score of 4 or 5 must cite specific evidence in the screening sheet. A rating should not be based only on enthusiasm, technical novelty, or adviser preference.

## 14.3 Weighted-score formula

```text
Weighted contribution = (criterion score ÷ 5) × criterion weight
Total score = sum of all weighted contributions
```

Example: A score of 4 on a criterion weighted 15 contributes `(4 ÷ 5) × 15 = 12` points.

## 14.4 How to handle disagreements

- Score independently before group discussion when possible.
- Require evidence for ratings of 4 or 5.
- Discuss the largest rating differences first.
- Identify whether disagreement concerns evidence, interpretation, risk tolerance, or preference.
- Record the rationale for the agreed score.
- Retain meaningful minority concerns in the review record.
- Do not change a gate result merely to keep a preferred concept in contention.
- Use adviser and stakeholder review after ranking; do not treat the matrix as a substitute for judgment.

## 14.5 Interpretation rule

The total score is comparative rather than absolute. A score does not guarantee selection, publication, approval, originality, or successful completion. The group should consider score differences together with uncertainty, dependency risk, adviser feedback, stakeholder value, and portfolio balance.

---

# 15. Evidence and Source Quality Guidelines

Concept quality depends on evidence quality. Sources should be selected according to the claim being made, and important claims should be verified against original sources whenever possible.

## 15.1 Evidence classification

| Classification | Purpose | Examples | What it cannot establish alone |
|---|---|---|---|
| Discovery signal | Reveals that a problem may warrant investigation | Public complaint, professional post, local news report, informal conversation, early observation | Prevalence, magnitude, causation, or a research gap |
| Contextual evidence | Establishes wider background, sector conditions, or policy relevance | National statistics, sector reports, policy documents, broad literature | A different or narrower local condition without direct support |
| Validation evidence | Directly supports the stated problem, population, process, context, magnitude, or comparison | Local records, defined observations, stakeholder study, scope-matched official data, validated measurements | Claims outside its population, period, variables, or conditions |

The same source may serve different roles for different claims. The Evidence Card must state the exact claim for which the source is being used.

## 15.2 Source types and cautions

| Evidence type | Typical use | Main caution |
|---|---|---|
| Peer-reviewed research | State of the art, performance, research gaps, theories, and methods | One paper rarely proves that a gap exists across the literature. |
| Official government data or reports | Population conditions, trends, policy context, and administrative measures | National evidence cannot alone validate an institution-specific problem. |
| Institutional records | Local frequency, errors, delays, costs, incidents, and service data | Check permission, definitions, completeness, missingness, and privacy. |
| Direct observation or measurement | Current process and local performance | Use a defined protocol and avoid overgeneralizing from a small or convenient sample. |
| Stakeholder interviews or surveys | Experience, requirements, workflow, perceived impact, and meaning | Perceptions are valuable but may not substitute for objective performance evidence. |
| Technical standards | Requirements, quality characteristics, benchmarks, and evaluation criteria | Use only provisions relevant to the question and verify the applicable edition. |
| Commercial or open-source products | Current practice, features, architecture, and implementation comparison | Marketing claims are not independent scientific evidence. |
| News or industry reports | Recent events, discovery, and emerging context | Trace central claims to original data or official sources where possible. |
| Social-media or community content | Discovery, lived experience, terminology, and emerging concerns | Public visibility does not prove representativeness or remove ethical obligations. |
| AI-generated summaries | Search assistance, brainstorming, and preliminary synthesis | Verify every important claim against the original source; do not cite the summary as the academic foundation. |

## 15.3 Evidence-scope rule

> **Evidence must match the scope of the claim.**  
> If the claim is local, include local evidence. If it is national, use evidence supporting national scope. Broader evidence may provide context but should not silently be treated as proof of a narrower, different, or more specific population.

Record at least:

- population or stakeholder group;
- location or institution;
- period covered;
- process, event, or variable measured;
- data-collection method;
- material exclusions or missingness;
- appropriate and inappropriate uses of the evidence.

## 15.4 Triangulation and independence

Triangulation combines meaningfully different evidence lines to test whether a claim remains credible across sources or methods. Three articles repeating the same press release do not constitute three independent evidence lines.

When practical, combine two or more of the following:

- objective records or measurements;
- stakeholder or expert accounts;
- direct observation;
- peer-reviewed research;
- official data;
- current-process documentation.

Triangulation does not require agreement. Disagreement may expose differences in definitions, populations, periods, incentives, or conditions.

## 15.5 Conflicting-evidence rule

The group must not remove or hide credible evidence merely because it weakens a preferred problem or concept. Record:

- the conflicting source or observation;
- the claim it challenges;
- possible reasons for the difference;
- whether the main claim should be retained, narrowed, reframed, or rejected;
- what further evidence could resolve the uncertainty.

## 15.6 Online and social-media evidence

Online content may reveal current concerns not yet represented in formal records. Use it carefully:

- Treat individual posts primarily as discovery signals unless a defensible method supports stronger use.
- Distinguish public, restricted, private, and closed-group contexts.
- Do not assume that platform access equals participant consent.
- Avoid unnecessary collection of names, usernames, images, or searchable quotations.
- Consider whether paraphrasing, aggregation, permission, or omission is needed to reduce identification risk.
- Record how posts were selected; do not present a convenient sample as representative.
- Verify factual claims through stronger sources when they are central to Gate 1.
- Seek adviser or ethics-review guidance when people, sensitive topics, vulnerable groups, or private communities are involved.

## 15.7 Source hierarchy for research-gap claims

1. Begin with recent peer-reviewed surveys, systematic reviews, or strong state-of-the-art papers when available.
2. Search recent primary studies directly testing the most relevant approaches.
3. Check technical standards, official documentation, datasets, and benchmark reports where the gap is technical.
4. Review local studies and implementations when the concept depends on Philippine or local conditions.
5. Examine current products, open-source projects, and services to understand practice.
6. Use patent or prior-art searches when originality depends on implementation novelty.
7. Document databases, keywords, date ranges, inclusion logic, and important search limitations.

## 15.8 Evidence update rule

Evidence can become stale. Record the date each source or dependency was last checked. Recheck time-sensitive laws, policies, software capabilities, datasets, prices, access conditions, standards, and institutional procedures before final proposal submission.

---

# 16. Participant Ethics, Privacy, and Research Integrity

Ethics is not a final form to complete after the design is finished. It shapes which problems may be studied, which data may be collected, who may participate, how the artifact behaves, and what may be reported.

## 16.1 Respect for persons

Where informed consent is required, prospective participants should receive understandable information about:

- the study's general purpose;
- expected activities, duration, and procedures;
- foreseeable risks or discomforts;
- expected benefits, if any;
- data to be collected and how they will be used;
- confidentiality and its limits;
- recording of voices, images, screens, locations, or behavior;
- incentives, costs, or compensation;
- the right to decline or withdraw without inappropriate penalty;
- whom to contact for questions or concerns.

Consent should be an ongoing process, not merely a signature. When participants have limited autonomy or capacity, appropriate assent, guardian permission, and additional protection may be required under institutional rules.

## 16.2 Beneficence and risk proportionality

Identify foreseeable physical, psychological, social, reputational, economic, informational, legal, accessibility, and cybersecurity risks as relevant. Reduce data collection and intervention burden to what the research question actually requires.

Potential social value does not automatically justify avoidable risk. High-risk designs should be revised, independently reviewed, or rejected when protections are inadequate.

## 16.3 Justice and fair selection

Participant groups should be chosen because they are relevant to the research question, not merely because they are easy to recruit or less able to refuse. Consider:

- students recruited by their instructors;
- employees recruited by supervisors;
- patients or clients dependent on services;
- minors or other protected populations;
- communities with limited bargaining power;
- groups bearing risk while others receive the expected benefits.

Provide a credible alternative when participation is connected to course credit, employment, service access, or another power relationship.

## 16.4 Privacy, confidentiality, and data lifecycle

Plan the complete data lifecycle before collection:

1. **Purpose:** Why is each data element necessary?
2. **Collection:** What is the minimum data needed?
3. **Access:** Who can view, edit, export, or link it?
4. **Storage:** Where and how will it be secured?
5. **Linkage:** Can records be combined to re-identify people?
6. **Use:** Which analyses and artifact functions are authorized?
7. **Sharing:** What may be shared, with whom, and under what safeguards?
8. **Retention:** How long will data be kept?
9. **Disposal:** How will copies, backups, and derived files be handled?
10. **Incident response:** What happens if data are lost, exposed, or misused?

Anonymization claims should be cautious. Removing names may not prevent identification when locations, dates, roles, images, or rare characteristics remain.

## 16.5 Online research

For forums, social networks, chat groups, messaging channels, platform logs, and other digital environments, examine:

- whether the space is public, restricted, private, or contextually sensitive;
- reasonable participant expectations;
- whether users are identifiable directly or through search;
- whether observation, quotation, or recording changes risk;
- whether nonparticipants may be captured;
- whether platform terms, institutional policies, consent, or permission apply;
- whether paraphrasing or aggregation can preserve meaning while reducing harm.

## 16.6 Research integrity

The group must:

- keep traceable source, evidence, analysis, and decision records;
- preserve raw or original data according to approved requirements;
- document cleaning, exclusions, label changes, transformations, and corrections;
- avoid fabrication, falsification, plagiarism, and inappropriate manipulation;
- avoid selecting only results that support the preferred claim;
- disclose material protocol deviations and limitations;
- distinguish confirmatory analyses from exploratory analyses added later;
- assign authorship and credit according to actual contribution;
- report null, negative, or unexpected results honestly;
- maintain code, model, dataset, and document versions sufficient for review.

## 16.7 Ethics and integrity decision

Record one of the following at each relevant phase:

- **Clear at this stage:** No material unresolved concern is known.
- **Controls required:** Risks are manageable with specified controls.
- **Review or approval required:** Work cannot proceed until the appropriate body or authority reviews it.
- **Redesign required:** The current question, data, participants, artifact, or evaluation creates unacceptable or unnecessary risk.
- **Do not proceed:** The risk or legal/ethical barrier cannot be responsibly controlled.

This framework does not itself determine whether a project is exempt from institutional ethics review. Follow the applicable institutional process.

---

# 17. Required Documentation

| Stage | Required output | Purpose |
|---|---|---|
| Preliminary | Problem Bank Register | Records potential problems consistently and controls shortlisting effort. |
| Phase A | Problem Brief | Captures stakeholder, context, current process, candidate problem, preliminary consequences, assumptions, evidence needs, and access status. |
| Phase B | Evidence Cards | Records exact claims, source roles, scope, strength, limitations, conflicts, and ethical considerations. |
| Phase B | Evidence and Impact Brief | Validates problem existence, magnitude, scope, access, and early ethical/privacy feasibility. |
| Phase C | Gap Statement and Research Question Brief | Summarizes existing approaches, limitation, gap, intellectual uncertainty, question, purpose, methodological direction, routine-design test, and provisional originality. |
| Phase D | Requirements and Proposed-Solution Brief | Defines objectives, requirements, alternatives, artifact, architecture, scope, technology justification, contribution type, and risks. |
| Phase E | Evaluation Protocol | Predefines design, demonstration, reference condition, participants/data, sampling, measures, analysis, acceptance criteria, exclusions, and controls. |
| Cross-cutting | Methodological and Ethics Alignment Record | Checks question-design alignment, consent, fairness, privacy, online-data use, approval, and integrity. |
| Phase F | Concept Canvas and feasibility package | Combines expected contribution, alignment, feasibility, risks, and the final concept summary. |
| Decision | Gate Checklist and Screening Sheet | Records eligibility and comparative ranking. |
| Review | Adviser/Stakeholder Review Record | Documents external feedback, decisions, and required revisions. |
| Iteration | Decision and Change Log | Records what failed or changed, contrary evidence, affected phase or gate, decision owner, and revision basis. |

## Documentation rule

Do not duplicate information unnecessarily. Evidence Cards should feed the Evidence and Impact Brief; phase briefs should feed the Concept Canvas; and the Canvas should summarize rather than replace the supporting records.

---

# 18. Worked Example

The following example illustrates how the framework transforms an initial observation into a researchable concept. It is not evidence that the problem exists in any actual locality. A group using this topic must conduct its own validation.

## 18.1 Preliminary Problem Bank entry

| Field | Illustrative entry |
|---|---|
| Problem Bank ID | AGR-01 |
| Domain | Small-scale crop production and postharvest handling |
| Potential stakeholders | Farmers, cooperative staff, agricultural technicians, and produce buyers in a selected locality |
| Current process | Crop-condition and handling decisions are recorded through paper notes, memory, or informal messages. |
| Candidate problem | Records may be incomplete or delayed, making it difficult to identify patterns and support timely decisions. |
| Preliminary consequence | Possible avoidable loss, inconsistent decisions, weak traceability, or delayed response |
| Discovery signal | Informal stakeholder observation and a local discussion |
| Evidence classification | Discovery only; not yet validated |
| Stakeholder access | Likely, subject to formal confirmation |
| Working status | Investigate |

The entry does not name a preferred technology. It records a problem opportunity and the evidence still needed.

## 18.2 Phase-by-phase development

| Phase | Illustrative development | Evidence or decision still required |
|---|---|---|
| A - Problem Discovery | Define the specific locality, stakeholder group, crop activity, decision, current process, and suspected breakdown. | Confirm who experiences the problem and whether the group can access the setting responsibly. |
| B - Problem Validation | Examine records, observations, interviews, and relevant reports to determine occurrence, frequency, consequences, variation, and existing workarounds. | Separate direct local evidence from contextual literature; record contrary evidence and limitations. |
| C - Research Opportunity | Review comparable systems and studies. Identify what remains uncertain about timely, reliable, or context-appropriate decision support. | Establish a genuine knowledge gap, not merely a missing app; formulate an answerable research question. |
| D - Solution Formulation | Derive requirements such as offline operation, low-cost input, usable records, understandable outputs, and appropriate security. Compare multiple artifact options before choosing one. | Justify the selected artifact and technology against requirements and alternatives. |
| E - Evaluation Design | Predefine demonstration conditions, baseline or comparator, measures, participants or datasets, analysis, and acceptance criteria. | Show that evidence can answer the research question and that success is not defined after seeing results. |
| F - Relevance and Feasibility | Verify access, schedule, skills, cost, equipment, data, approvals, ethical controls, maintenance implications, and expected contribution. | Narrow or reject the concept if access, ethics, measurement, or completion risk is unacceptable. |

## 18.3 From weak to stronger formulation

**Weak formulation:**

> Develop an AI application for farmers.

This statement begins with a technology, does not define the stakeholder problem or research uncertainty, and provides no basis for evaluation.

**Stronger provisional formulation:**

> Investigate whether a specified low-cost decision-support artifact, designed for the documented constraints of a defined farming context, improves a predefined decision outcome compared with the current process, and identify the conditions under which its performance is acceptable or inadequate.

The stronger formulation is still provisional. The exact artifact, variables, comparator, population, and claim must be determined from evidence gathered during the phases.

## 18.4 Why the example may become research-worthy

The concept may qualify as research if the group can show all of the following:

- the problem is real, consequential, and bounded;
- existing approaches are insufficient in a clearly defined way;
- meaningful uncertainty remains about the design or its effects;
- the question can be answered with credible evidence;
- the solution choice follows from requirements rather than fashion;
- the expected contribution extends beyond producing one local software instance;
- the work can be conducted ethically and feasibly.

If the only objective is to digitize an established process using a conventional implementation with no meaningful uncertainty or reusable contribution, the activity may be a valuable development project but not a sufficiently strong research concept.

---

# 19. Group Usage Procedure

## 19.1 Recommended sequence

1. Agree on broad domains or stakeholder settings worth exploring.
2. Add candidate problems to the Problem Bank without assigning technologies.
3. Record the discovery signal, source role, assumptions, stakeholder-access status, and evidence needs for every entry.
4. Apply the Problem Bank shortlisting filter and select a manageable set for deeper investigation.
5. Complete Phase A and produce a clear Problem Brief.
6. Complete Phase B, prepare Evidence Cards and an Evidence and Impact Brief, and decide Gate 1.
7. Complete Phase C, including the literature and prior-art review, gap statement, intellectual-uncertainty statement, research question, methodological direction, and routine-design test; then decide Gate 2.
8. Complete Phase D by deriving objectives and requirements, comparing alternatives, selecting an artifact direction, justifying technology, and identifying the proposed contribution type.
9. Complete Phase E by predefining the demonstration and evaluation design; then decide Gate 3.
10. Complete Phase F by checking relevance, access, ethics, privacy, integrity, feasibility, resources, risks, and expected knowledge contribution; then decide Gate 4.
11. Return weak concepts to the phase where the weakness originated. Record the reason and revision.
12. Score only concepts that passed all four gates.
13. Compare sensitivity to disputed ratings and document the final decision.
14. Seek adviser, stakeholder, technical, and ethics input where appropriate.
15. Transfer the selected concept and its evidence trail into the formal proposal process.

## 19.2 Suggested group roles

Roles may be combined in small groups, but accountability should remain explicit.

| Role | Main responsibility |
|---|---|
| Process coordinator | Maintains phase order, schedules reviews, and ensures gate decisions are recorded. |
| Problem and stakeholder lead | Manages the Problem Bank, stakeholder mapping, current-process analysis, and access confirmation. |
| Evidence lead | Maintains Evidence Cards, source classification, claim traceability, triangulation, and conflicting-evidence records. |
| Literature and prior-art lead | Conducts and documents the search for comparable research, systems, standards, and intellectual property where relevant. |
| Methodology and evaluation lead | Checks question-design alignment, variables or constructs, sampling, measures, comparators, analysis, and acceptance criteria. |
| Technical lead | Develops requirements, alternatives, architecture options, technology justification, dependencies, and implementation risks. |
| Ethics, privacy, and integrity lead | Tracks consent, risk, fairness, online-data issues, data lifecycle, approvals, authorship, and reproducibility controls. |
| Documentation and version lead | Controls file versions, decision logs, references, change history, and the Concept Canvas. |

The group should rotate or cross-check roles when possible. No single member should be the only person who understands the evidence, methods, code, or decision basis.

## 19.3 Group decision protocol

For every gate and final selection:

1. Review the required documents before the meeting.
2. Let the responsible member present the evidence and its limitations.
3. Invite a designated reviewer to challenge assumptions and seek contrary evidence.
4. Discuss unresolved disagreement at the criterion level rather than averaging immediately.
5. Record a decision of **Pass**, **Revise**, **Defer**, or **Reject**, with reasons and responsible persons.
6. Record conditions that must be satisfied before the next review.
7. Update the Decision and Change Log and all affected documents.

## 19.4 Version and evidence control

- Give every candidate concept a stable identifier.
- Date every Evidence Card, gate decision, and major revision.
- Keep citations linked to the exact claims they support.
- Mark superseded claims without silently deleting their history.
- Record search dates, databases or repositories, search terms, and material inclusion or exclusion decisions.
- Recheck time-sensitive evidence before final selection and before proposal submission.
- Keep raw evidence separate from summaries and interpretations.
- Use consistent filenames and controlled access for sensitive files.

---

# 20. Final Workflow and Quick Reference

## 20.1 Official workflow

```text
Explore domains and stakeholders
        |
Build and shortlist the Problem Bank
        |
Phase A: Discover and define the problem
        |
Phase B: Validate existence, magnitude, scope, access, and early ethics
        |
Gate 1: Problem valid?
        |
Phase C: Establish existing work, gap, uncertainty, question, and methodological direction
        |
Gate 2: Research-worthy?
        |
Phase D: Derive objectives and requirements; compare solutions; justify artifact and technology
        |
Phase E: Design demonstration, measures, comparison, analysis, and acceptance criteria
        |
Gate 3: Evaluable?
        |
Phase F: Check relevance, contribution, ethics, privacy, access, resources, risks, and feasibility
        |
Gate 4: Eligible?
        |
Score and rank eligible concepts only
        |
Adviser and stakeholder review
        |
Select, revise, or return to an earlier phase
```

## 20.2 Current-stage rule

During Problem Bank work, the group should concentrate on:

- identifying real stakeholders and contexts;
- understanding current processes and pain points;
- collecting discovery signals without overstating them;
- recording evidence needs and access conditions;
- resisting premature commitment to an artifact or technology.

Technology exploration is acceptable for awareness, but it should not control which problem is selected.

## 20.3 Five alignment checks

Before final selection, read the concept from left to right:

1. **Problem alignment:** Does the evidence support the defined problem and consequence?
2. **Research alignment:** Does the gap create a meaningful and answerable uncertainty?
3. **Solution alignment:** Do requirements justify the artifact and technology?
4. **Evaluation alignment:** Can the planned evidence answer the research question and test the claimed contribution?
5. **Responsibility alignment:** Can the study be conducted ethically, legally, transparently, and feasibly in the intended context?

A serious break in any one alignment should trigger revision even when the total score is high.

## 20.4 Quick stop rules

Stop, defer, reject, or return the concept when:

- the problem cannot be supported beyond a discovery signal;
- the intended stakeholder or setting cannot be accessed credibly;
- the claimed gap is only a missing feature or an unsupported statement of novelty;
- the work is routine design with no meaningful uncertainty or transferable contribution;
- the research question cannot be answered using the available participants, data, measures, time, or resources;
- the technology is chosen first and cannot be justified against alternatives;
- the evaluation lacks a suitable comparator, measure, or analysis plan;
- ethical, legal, safety, privacy, security, or fairness risks cannot be controlled;
- critical dependencies or permissions remain unavailable;
- the proposed claim exceeds what the design can establish.

## 20.5 Final concept test

A concept is ready for formal proposal development only when the group can complete this statement with evidence:

> For **[defined stakeholders or setting]**, credible evidence indicates **[bounded problem and consequence]**. Existing approaches are limited because **[evidenced limitation]**, leaving uncertainty about **[research gap or question]**. We therefore propose to investigate **[artifact, intervention, method, or comparison]**, selected because **[requirements and alternatives analysis]**. We will evaluate it using **[design, data, measures, comparator, and analysis]**. The expected contribution is **[invention, improvement, adaptation, or other knowledge output]**. The work is relevant, ethical, privacy-aware, and feasible because **[key evidence and controls]**.

---

# 21. References

Bordens, K. S., & Abbott, B. B. (2018). *Research design and methods: A process approach* (10th ed.). McGraw-Hill Education. [Publisher page](https://www.mheducation.com/highered/product/research-designs-and-methods-bordens.html)

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75-105. [AIS eLibrary](https://aisel.aisnet.org/misq/vol28/iss1/6/)

International Organization for Standardization. (2023). *ISO/IEC 25010:2023: Systems and software engineering - Systems and software quality requirements and evaluation (SQuaRE) - Product quality model*. [ISO](https://www.iso.org/standard/78176.html)

Kothari, C. R. (2004). *Research methodology: Methods and techniques* (2nd rev. ed.). New Age International.

National Institute of Standards and Technology. (2023). *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*. [NIST](https://www.nist.gov/itl/ai-risk-management-framework)

National Privacy Commission. (2016). *Implementing rules and regulations of Republic Act No. 10173, known as the Data Privacy Act of 2012*. [National Privacy Commission](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/)

Organisation for Economic Co-operation and Development. (2015). *Frascati manual 2015: Guidelines for collecting and reporting data on research and experimental development*. OECD Publishing. [DOI](https://doi.org/10.1787/9789264239012-en)

Patten, M. L., & Newhart, M. (2018). *Understanding research methods: An overview of the essentials* (10th ed.). Routledge. [DOI](https://doi.org/10.4324/9781315213033)

Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007). A design science research methodology for information systems research. *Journal of Management Information Systems, 24*(3), 45-77. [DOI](https://doi.org/10.2753/MIS0742-1222240302)

Philippine Council for Industry, Energy and Emerging Technology Research and Development. (n.d.). *Work with us*. [DOST-PCIEERD](https://pcieerd.dost.gov.ph/work-with-us/)

Philippine Department of Science and Technology. (2022). *Harmonized National Research and Development Agenda 2022-2028*. [DOST](https://www.dost.gov.ph/knowledge-resources/downloads/file/5669-harmonized-national-r-d-agenda-2022-2028.html)

United Nations. (n.d.). *Sustainable Development Goals*. [United Nations](https://sdgs.un.org/goals)

Vaishnavi, V. K., & Kuechler, W., Jr. (2015). *Design science research methods and patterns: Innovating information and communication technology* (2nd ed.). CRC Press. [Publisher page](https://www.routledge.com/Design-Science-Research-Methods-and-Patterns-Innovating-Information-and-Communication-Technology-2nd-Edition/Vaishnavi-Vaishnavi-Kuechler/p/book/9781498715256)

## Framework authorship note

The named sources provide foundations for research methodology, DSR, evaluation quality, responsible technology, ethics, privacy, and public relevance. The specific preliminary stage, six phases, four gates, scoring matrix, labels, checklists, and templates in this guidebook are an original practical synthesis for concept-development use. They should not be attributed to a single source.

---

# Appendix A - Revised Concept Canvas

Complete one canvas for every concept that reaches Phase F. Use supporting documents for detail; do not compress uncertainty into unsupported one-line claims.

| Field | Required entry | Evidence or record reference |
|---|---|---|
| Concept identifier and version | Stable ID, title, date, and version | Decision and Change Log |
| Problem Bank origin | Problem Bank ID and shortlisting date | Problem Bank Register |
| Stakeholder and beneficiary | Direct, indirect, potentially excluded, and potentially affected groups | Stakeholder map |
| Context and boundary | Place, organization, process, platform, population, period, and exclusions | Problem Brief |
| Current process | How work or decisions currently occur | Process map or observation record |
| Validated problem | Precise problem statement without embedding a preferred solution | Evidence and Impact Brief |
| Consequence and magnitude | Frequency, severity, duration, reach, cost, delay, error, risk, or missed opportunity | Evidence Cards |
| Evidence classification | Discovery, contextual, and validation evidence used | Evidence register |
| Contrary or conflicting evidence | Material disagreement and its treatment | Conflict record |
| Existing approaches | Relevant research, tools, services, processes, standards, and workarounds | Literature/prior-art matrix |
| Research gap | What is insufficiently known, explained, designed, or evaluated | Gap Statement |
| Intellectual uncertainty | What outcome, relationship, mechanism, boundary, or design principle remains unknown | Research Question Brief |
| Research question | Primary answerable question and any necessary subquestions | Research Question Brief |
| Research purpose | Exploratory, descriptive, relational, causal, evaluative, design-oriented, or mixed | Alignment Record |
| Methodological direction | Provisional design, methods, sampling/data, and analysis logic | Alignment Record |
| Routine-design test | Why this is research rather than implementation alone | Research Question Brief |
| Research objectives | Specific, coherent, and assessable objectives | Proposed-Solution Brief |
| Requirements | Functional, quality, data, human, environmental, ethical, legal, and operational requirements | Requirements register |
| Alternatives considered | Plausible nontechnical and technical approaches | Alternatives matrix |
| Proposed artifact or intervention | Construct, model, method, framework, architecture, system, prototype, or other output | Proposed-Solution Brief |
| Technology justification | Why the selected technology fits better than alternatives | Technology decision record |
| Expected contribution | Invention, improvement, adaptation, evaluation evidence, design principle, method, dataset, or other output | Contribution statement |
| Demonstration | How use or operation will be shown in context | Evaluation Protocol |
| Evaluation design | Participants/data, comparator, measures, procedure, analysis, exclusions, and acceptance criteria | Evaluation Protocol |
| Validity and limitations | Main threats, assumptions, scope, and controls | Evaluation Protocol |
| Ethics and participant safeguards | Consent/permission, risk, fair selection, vulnerable groups, compensation, and withdrawal | Alignment Record |
| Privacy and data lifecycle | Necessity, collection, access, storage, linkage, sharing, retention, disposal, and incident response | Data management plan |
| Security, safety, and fairness | Foreseeable harms, misuse, failures, unequal effects, and controls | Risk register |
| Research integrity | Traceability, versioning, exclusions, deviations, authorship, reproducibility, and reporting | Integrity checklist |
| Relevance | Stakeholder value, Computing relevance, SDG/national/institutional alignment without overclaiming | Relevance brief |
| Feasibility | Access, skills, schedule, budget, equipment, data, approvals, and dependencies | Feasibility package |
| Gate outcomes | Gate 1 through Gate 4 decisions and conditions | Gate Checklist |
| Screening result | Criterion scores, evidence notes, total, disagreements, and sensitivity | Screening Sheet |
| Final decision | Select, revise, defer, or reject, with reason and next action | Decision and Change Log |

---

# Appendix B - Gate Checklist

## Gate 1 - Problem Validity

- [ ] Stakeholder, context, and current process are clearly identified.
- [ ] The problem statement does not assume a preferred solution.
- [ ] Evidence supports that the problem occurs in the defined context.
- [ ] Evidence of occurrence is separated from evidence of magnitude.
- [ ] Consequences and affected stakeholders are documented.
- [ ] Discovery, contextual, and validation evidence are labeled correctly.
- [ ] Evidence limitations, uncertainty, and material conflicts are recorded.
- [ ] Stakeholder or setting access is sufficiently credible for the next phase.
- [ ] Early ethics, privacy, safety, fairness, and permission concerns have been screened.

**Decision:** [ ] Pass  [ ] Revise  [ ] Defer  [ ] Reject  
**Conditions or reasons:**  
**Decision date and reviewers:**

## Gate 2 - Research Worthiness

- [ ] The literature and prior-art search is broad and traceable enough for concept screening.
- [ ] Existing approaches and workarounds are summarized fairly.
- [ ] The gap is a knowledge, design, evaluation, context, or theory gap rather than a missing feature alone.
- [ ] A meaningful intellectual uncertainty is stated.
- [ ] The primary research question is clear, bounded, and answerable.
- [ ] Research purpose and provisional methodological direction fit the question.
- [ ] The routine-design test has been completed.
- [ ] Provisional originality and contribution are stated cautiously.
- [ ] The expected claim is proportionate to the proposed evidence.

**Decision:** [ ] Pass  [ ] Revise  [ ] Defer  [ ] Reject  
**Conditions or reasons:**  
**Decision date and reviewers:**

## Gate 3 - Evaluability

- [ ] Demonstration and evaluation are distinguished.
- [ ] The reference condition, baseline, benchmark, or comparator is justified.
- [ ] Participants, cases, datasets, or test environments are appropriate and accessible.
- [ ] Measures correspond to the research question and claimed contribution.
- [ ] Instruments or metrics are sufficiently valid, reliable, and interpretable for the intended use.
- [ ] The sampling or case-selection logic is defensible.
- [ ] Procedures, exclusions, missing-data handling, and analysis are predefined at an appropriate level.
- [ ] Acceptance criteria are defined before results are known.
- [ ] Main validity threats, confounds, bias, and controls are identified.
- [ ] Evaluation risks and participant burden are proportionate and manageable.

**Decision:** [ ] Pass  [ ] Revise  [ ] Defer  [ ] Reject  
**Conditions or reasons:**  
**Decision date and reviewers:**

## Gate 4 - Final Eligibility

- [ ] The problem, question, objectives, requirements, solution, and evaluation form a coherent chain.
- [ ] Technology is justified against requirements and alternatives.
- [ ] Expected contribution is identifiable beyond the artifact instance.
- [ ] Computing relevance is clear.
- [ ] Stakeholder, SDG, national, or institutional relevance is specific and not overstated.
- [ ] Access to stakeholders, participants, data, facilities, and permissions is credible.
- [ ] Ethics, consent, privacy, security, safety, fairness, and online-data controls are acceptable.
- [ ] Research-integrity and data-management arrangements are credible.
- [ ] Skills, time, budget, equipment, dependencies, and maintenance implications are manageable.
- [ ] Critical risks have owners, controls, contingencies, and stop conditions.
- [ ] All unresolved assumptions are visible and acceptable for proposal development.

**Decision:** [ ] Pass  [ ] Revise  [ ] Defer  [ ] Reject  
**Conditions or reasons:**  
**Decision date and reviewers:**

---

# Appendix C - Screening and Ranking Sheet

Complete this sheet only after all four gates have passed.

| Criterion | Weight | Rating (1-5) | Weighted points | Evidence and justification | Confidence/limitations |
|---|---:|---:|---:|---|---|
| Problem significance and stakeholder relevance | 15 |  |  |  |  |
| Strength and appropriateness of evidence | 15 |  |  |  |  |
| Research gap and question | 15 |  |  |  |  |
| Expected originality and contribution | 15 |  |  |  |  |
| Solution and technology fit | 10 |  |  |  |  |
| Feasibility | 10 |  |  |  |  |
| Evaluation quality and measurability | 10 |  |  |  |  |
| Ethics, privacy, safety, security, and integrity | 5 |  |  |  |  |
| SDG, national, local, or institutional alignment | 5 |  |  |  |  |
| **Total** | **100** |  | **/100** |  |  |

For each criterion:

```text
Weighted points = (rating / 5) x criterion weight
```

**Gate status:** G1 [ ]  G2 [ ]  G3 [ ]  G4 [ ]  
**Disputed ratings and tested alternatives:**  
**Sensitivity result:**  
**Final rank:**  
**Decision:** [ ] Select  [ ] Revise  [ ] Defer  [ ] Reject  
**Decision basis and next action:**

---

# Appendix D - Problem Bank Template

Use one row for every candidate problem. Add links or identifiers rather than placing sensitive raw information in the register.

| ID | Date added | Domain/setting | Stakeholders | Current process | Candidate problem | Preliminary consequence | Discovery signal/source | Evidence class | Evidence needed | Access status | Ethics/privacy flags | Working status | Owner/next action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Problem Bank status guide

| Status | Meaning | Normal next action |
|---|---|---|
| Investigate | Interesting but insufficiently understood | Gather discovery and contextual evidence. |
| Ready | Meets the shortlisting filter for Phase A | Assign an owner and prepare a Problem Brief. |
| Retain | Worth keeping but not a current priority | Record the reason and a review date or trigger. |
| Defer | Temporarily blocked by access, timing, dependency, or evidence | Record the blocker and condition for reopening. |
| Remove | Duplicated, disproved, out of scope, unacceptable, or no longer relevant | Preserve the reason in the register. |

## Shortlisting questions

- [ ] Is there an identifiable stakeholder, context, and current process?
- [ ] Is the entry a problem opportunity rather than a predetermined solution?
- [ ] Is there at least one traceable discovery signal?
- [ ] Is the possible consequence meaningful enough to investigate?
- [ ] Is a plausible Computing research connection present without forcing a technology?
- [ ] Is access at least **Likely**, or is there a credible plan to confirm it?
- [ ] Are there no obvious uncontrollable ethical, legal, privacy, or safety barriers?
- [ ] Can the next evidence-gathering step be completed with available time and resources?

---

# Appendix E - Evidence Card Template

Create a separate card for every material claim or tightly related group of claims.

| Field | Entry |
|---|---|
| Evidence Card ID |  |
| Concept/Problem Bank ID |  |
| Claim supported or challenged |  |
| Evidence classification | [ ] Discovery  [ ] Contextual  [ ] Validation |
| Source type |  |
| Full citation or record link |  |
| Date published/produced |  |
| Date accessed/collected |  |
| Population, setting, and period |  |
| Method or origin of the evidence |  |
| Key finding in the group's own words |  |
| Directness to the local claim | [ ] High  [ ] Moderate  [ ] Low |
| Source credibility and independence |  |
| Strength and precision |  |
| Limitations, uncertainty, or bias |  |
| Conflicting or corroborating evidence |  |
| Ethical/privacy restrictions |  |
| Permitted use, quotation, or sharing |  |
| Decision affected |  |
| Reviewer and review date |  |

## Evidence Card quality check

- [ ] The wording distinguishes what the source reports from the group's interpretation.
- [ ] The claim does not exceed the source's population, setting, period, or method.
- [ ] Discovery evidence is not presented as validation evidence.
- [ ] Magnitude claims include an interpretable denominator, comparison, or baseline when needed.
- [ ] Material conflicting evidence is linked rather than omitted.
- [ ] Social or online content is handled according to context, consent, identifiability, and platform restrictions.
- [ ] Direct quotations are used only when necessary and permitted; otherwise the evidence is summarized accurately.
- [ ] Sensitive information is minimized and stored in the appropriate protected location.

---

# Appendix F - Methodological and Ethics Alignment Record

## F.1 Research alignment

| Element | Planned entry | Why it fits / limitation |
|---|---|---|
| Primary research question |  |  |
| Research purpose |  |  |
| Unit of analysis |  |  |
| Population, cases, setting, or dataset |  |  |
| Key constructs or variables |  |  |
| Provisional research design |  |  |
| Data or evidence required |  |  |
| Sampling or case-selection approach |  |  |
| Methods and instruments |  |  |
| Comparator or reference condition |  |  |
| Analysis approach |  |  |
| Claim the design can support |  |  |
| Claim the design cannot support |  |  |
| Main validity threats and controls |  |  |
| Acceptance criteria or decision rules |  |  |

## F.2 Ethics, privacy, safety, and fairness

| Question | Response, control, or record reference |
|---|---|
| Who participates directly or is represented in the data? |  |
| Who may benefit, carry burden, be excluded, or be harmed? |  |
| Is consent, assent, organizational permission, platform permission, or formal review required? |  |
| How will participation remain voluntary and withdrawal be handled? |  |
| Are incentives, power relationships, or recruitment practices appropriate? |  |
| What is the minimum necessary data? |  |
| Are data public, private, restricted, sensitive, or reasonably expected to be private? |  |
| How will collection, access, storage, linkage, sharing, retention, disposal, and incidents be controlled? |  |
| Could the artifact or study create unequal error, exclusion, surveillance, misuse, or other unfair effects? |  |
| What security, safety, reliability, and fallback controls are required? |  |
| How will participant burden and foreseeable risk be minimized? |  |
| What approval, consultation, or monitoring is required before proceeding? |  |

## F.3 Research-integrity readiness

- [ ] Sources, data, code, analyses, and decisions are traceable.
- [ ] Inclusion, exclusion, cleaning, transformation, and labeling rules are documented.
- [ ] Exploratory and confirmatory analyses will be distinguished.
- [ ] Deviations, corrections, negative findings, and limitations will be reported.
- [ ] Authorship, contribution, and acknowledgment expectations are agreed.
- [ ] Versions and dependencies can be identified and reproduced to an appropriate degree.
- [ ] Conflicts of interest or competing commitments are disclosed and managed.

**Overall status:** [ ] Clear at this stage  [ ] Controls required  [ ] Review/approval required  [ ] Redesign required  [ ] Do not proceed  
**Required action, owner, and due condition:**

---

# Appendix G - Decision and Change Log

Use this log whenever a claim, phase output, gate result, score, scope, method, artifact, evaluation, risk control, or final decision changes.

| Entry ID | Date | Concept/version | Trigger or new evidence | Decision or change | Reason and alternatives considered | Affected phase/gate/document | Owner | Follow-up condition | Reviewer |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

## Minimum decision record

Every material decision should answer:

1. What was believed or planned before the decision?
2. What evidence, constraint, review, or disagreement triggered reconsideration?
3. What options were considered?
4. What was selected, revised, deferred, or rejected?
5. Why was that action proportionate to the evidence?
6. Which documents, gates, scores, risks, and next actions must now change?

---

**End of framework**
