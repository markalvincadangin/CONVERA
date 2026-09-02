# UI/UX Design Framework

A reusable, evidence-informed framework for designing usable, accessible, consistent, and user-centered digital products.

---

## 1. UI/UX Design Philosophy

### Core principle

> Design for the user's goals, not for the interface itself.

A good UI/UX should be:

- Useful — solves a real user problem.
- Usable — users can complete tasks efficiently.
- Learnable — users can understand how to use it.
- Accessible — usable by people with different abilities.
- Consistent — similar things behave and look similar.
- Clear — information and actions are easy to understand.
- Efficient — minimizes unnecessary effort.
- Trustworthy — communicates status, errors, privacy, and consequences honestly.
- Delightful — pleasant without sacrificing usability.

### Golden rule

Every design decision should answer:

1. Who is this for?
2. What are they trying to accomplish?
3. What problem does this solve?
4. What evidence supports this decision?
5. Does this make the task easier or harder?

---

# 2. UI/UX Design Process

Use an iterative process:

```text
Understand
   ↓
Research
   ↓
Empathize
   ↓
Define
   ↓
Ideate
   ↓
Structure
   ↓
Wireframe
   ↓
Prototype
   ↓
Test
   ↓
Measure
   ↓
Improve
   ↺
```

Do not treat UI design as a one-time visual activity.

---

# 3. Understand the Product

Before designing screens, understand:

- Product purpose
- Target users
- User problems
- Business/project goals
- Main features
- User tasks
- Constraints
- Platform
- Technical limitations
- Accessibility requirements
- Data requirements
- Security/privacy considerations

### Product questions

- What problem does the product solve?
- Who experiences this problem?
- What is the user's primary goal?
- What are the most important tasks?
- What actions are high-risk?
- What information does the user need?
- What information does the system need from the user?

---

# 4. User Research

Research should reduce assumptions.

### Possible research methods

- Interviews
- Surveys
- Observation
- Contextual inquiry
- Competitor analysis
- Existing-data analysis
- Usability testing
- Heuristic evaluation

### Research outputs

Produce:

- User needs
- Pain points
- Goals
- Behaviors
- Constraints
- Common tasks
- Frustrations
- Expectations
- Opportunities

### Common mistake

Do not ask only:

> "What features do you want?"

Also ask:

> "What are you trying to accomplish?"

---

# 5. Empathy

Understand the user's perspective.

### Empathy framework

| Area | Questions |
|---|---|
| Says | What does the user say? |
| Thinks | What are they thinking? |
| Does | What do they actually do? |
| Feels | What emotions or frustrations occur? |
| Needs | What must they accomplish? |
| Pain points | What makes the task difficult? |

Avoid designing based solely on what designers assume users need.

---

# 6. Define the Problem

Convert research findings into a clear problem statement.

### Problem statement template

> [User] needs a way to [goal] because [underlying problem].

### Good problem statement

- User-centered
- Specific
- Evidence-based
- Actionable
- Not prematurely tied to a solution

### Avoid

> "We need an AI dashboard."

Prefer:

> "Users need a faster way to identify the information required to make a decision."

---

# 7. User Personas

Create personas from actual research where possible.

### Persona template

```text
Name:
Role:
Background:
Goals:
Needs:
Pain Points:
Behaviors:
Technical Comfort:
Environment:
Common Tasks:
Motivations:
Frustrations:
```

Do not create unnecessary fictional details that are unsupported by research.

---

# 8. User Goals and Tasks

Separate:

### User goal

The desired outcome.

Example:

> "I want to know whether my payment was successful."

### User task

The actions needed to reach the goal.

Example:

1. Open transaction history.
2. Find the transaction.
3. Check its status.

Design should prioritize important user goals and tasks.

---

# 9. Information Architecture

Information Architecture (IA) determines how information is organized.

### IA principles

- Group related information.
- Use meaningful labels.
- Establish clear hierarchy.
- Avoid unnecessary categories.
- Make important information easy to find.
- Use familiar terminology.
- Keep navigation predictable.

### Example

```text
Dashboard
├── Overview
├── Transactions
├── Reports
├── Notifications
└── Settings
```

---

# 10. Navigation Design

Navigation should answer:

> "Where am I, where can I go, and how do I get back?"

### Navigation rules

- Use consistent navigation.
- Highlight the current location.
- Keep labels understandable.
- Avoid excessive navigation levels.
- Provide obvious ways to go back.
- Prioritize frequent destinations.

### Common mistake

Do not hide essential actions simply to make the interface look minimal.

---

# 11. User Flows

Map how users complete important tasks.

### User flow example

```text
Start
  ↓
Login
  ↓
Dashboard
  ↓
Select Feature
  ↓
Enter Information
  ↓
Review
  ↓
Confirm
  ↓
Success
```

For every important flow identify:

- Entry point
- User action
- System response
- Decision point
- Error condition
- Recovery path
- Completion state

---

# 12. Wireframing

Wireframes focus on structure before visual polish.

### Low-fidelity wireframe

Focus on:

- Layout
- Hierarchy
- Navigation
- Content placement
- Main actions
- Information relationships

Do not spend excessive time on colors and decoration at this stage.

### High-fidelity prototype

Add:

- Typography
- Colors
- Components
- Icons
- Interaction states
- Realistic content
- Responsive behavior

---

# 13. Visual Hierarchy

Visual hierarchy tells users what to notice first, second, and third.

### Create hierarchy using

- Size
- Position
- Weight
- Contrast
- Spacing
- Color
- Grouping
- Typography

### Priority

```text
Primary information
        ↓
Primary action
        ↓
Supporting information
        ↓
Secondary actions
        ↓
Optional details
```

### Common mistake

If everything is emphasized, nothing is emphasized.

---

# 14. Color Framework

Color should communicate meaning, not merely decoration.

### Define semantic colors

```text
Primary
Secondary
Accent
Success
Warning
Error
Info
Background
Surface
Text Primary
Text Secondary
Border
Disabled
```

### Color rules

- Maintain sufficient contrast.
- Do not use color as the only indicator of meaning.
- Use semantic colors consistently.
- Reserve strong colors for important states.
- Avoid excessive color variation.

### Example

```text
Success → completed / valid
Warning → attention required
Error   → failed / invalid
Info    → neutral information
```

Always pair important color states with text, icons, or other cues.

---

# 15. Typography Framework

Typography should support readability and hierarchy.

### Define

- Font family
- Heading sizes
- Body size
- Label size
- Font weights
- Line height
- Letter spacing
- Text colors

### Example scale

```text
Display
H1
H2
H3
Body Large
Body
Body Small
Caption
Label
```

### Rules

- Use a limited number of typefaces.
- Establish a clear hierarchy.
- Avoid very small text.
- Use sufficient line height.
- Do not rely only on font weight to communicate meaning.

---

# 16. Iconography

Icons should improve recognition, not create ambiguity.

### Rules

- Use a consistent icon style.
- Use familiar symbols.
- Maintain consistent size and stroke treatment.
- Pair ambiguous icons with labels.
- Provide accessible names for icon-only controls.

### Common mistake

Using decorative icons where users expect actionable controls.

---

# 17. Gestalt Principles

Use Gestalt principles to help users perceive relationships.

### Proximity

Elements close together are perceived as related.

### Similarity

Similar visual treatment suggests similar function or category.

### Continuity / Alignment

Aligned elements create visual structure.

### Figure-Ground

Important content should be distinguishable from its background.

### Closure

Users mentally complete familiar incomplete shapes.

### Practical application

Use:

- Consistent spacing
- Alignment
- Grouping
- Visual containers
- Clear separation between unrelated content

---

# 18. Component Design System

Create reusable components instead of designing every element independently.

### Common components

- Button
- Input
- Select
- Checkbox
- Radio button
- Toggle
- Card
- Modal
- Alert
- Toast
- Table
- Tabs
- Navigation
- Breadcrumb
- Pagination
- Tooltip
- Badge

### Component states

Every interactive component should consider:

```text
Default
Hover
Focus
Active
Disabled
Loading
Success
Error
```

For touch interfaces, also consider pressed/touch states.

---

# 19. Interaction Design

Every interaction should have a clear relationship between:

```text
User Action
    ↓
System Response
    ↓
User Understanding
```

### Example

```text
User clicks "Save"
        ↓
Button shows loading state
        ↓
System saves data
        ↓
Success feedback appears
        ↓
User knows the action completed
```

---

# 20. Affordance

Affordance describes what an object allows a user to do.

### Actual affordance

What an element technically allows.

### Perceived affordance

What users believe they can do.

Good UI makes perceived and actual affordance closely match.

### Examples

- Button looks clickable.
- Text field looks editable.
- Slider looks draggable.
- Link looks like a link.

---

# 21. Feedback Framework

The system should communicate what is happening.

### Feedback types

| Situation | Feedback |
|---|---|
| Action started | Loading/progress |
| Action succeeded | Success message/state |
| Action failed | Error message |
| Data changed | Updated state |
| Destructive action | Confirmation |
| Background process | Progress/status |

### Feedback should be

- Timely
- Clear
- Relevant
- Understandable
- Proportional to the action

---

# 22. Nielsen's 10 Usability Heuristics

Use these as a core usability review framework.

1. **Visibility of System Status**
   - Keep users informed about what is happening.

2. **Match Between System and the Real World**
   - Use language and concepts familiar to users.

3. **User Control and Freedom**
   - Provide undo, cancel, back, and escape paths where appropriate.

4. **Consistency and Standards**
   - Follow platform and product conventions.

5. **Error Prevention**
   - Prevent errors before they happen.

6. **Recognition Rather Than Recall**
   - Show relevant information instead of forcing users to remember it.

7. **Flexibility and Efficiency of Use**
   - Support both beginners and experienced users.

8. **Aesthetic and Minimalist Design**
   - Avoid irrelevant information and unnecessary complexity.

9. **Help Users Recognize, Diagnose, and Recover from Errors**
   - Explain errors clearly and provide recovery actions.

10. **Help and Documentation**
   - Provide understandable assistance when needed.

---

# 23. Cognitive Load Framework

Cognitive load is the mental effort required to process information and complete a task.

### Types

#### Intrinsic load

Complexity inherent to the task.

#### Extraneous load

Unnecessary complexity caused by poor design.

#### Germane load

Mental effort used to understand and learn.

### UI goal

Reduce unnecessary cognitive load without oversimplifying important tasks.

---

# 24. Reducing Cognitive Load

Use:

- Progressive disclosure
- Familiar patterns
- Clear grouping
- Recognition instead of recall
- Good defaults
- Short and clear instructions
- Visual hierarchy
- Consistent components
- Step-by-step workflows
- Meaningful labels

Avoid:

- Too many choices
- Long unexplained forms
- Unnecessary animations
- Dense layouts
- Inconsistent terminology
- Hidden system status
- Ambiguous icons

---

# 25. Form Design Framework

Forms should minimize effort and errors.

### Rules

- Use clear labels.
- Group related fields.
- Use appropriate input types.
- Mark required fields clearly.
- Provide useful defaults when appropriate.
- Validate at the right time.
- Explain constraints.
- Preserve entered information after errors.
- Avoid asking for unnecessary information.

### Validation

Prefer:

> Password must contain at least 8 characters.

Instead of:

> Invalid input.

---

# 26. Error Handling Framework

Good error handling answers:

1. What happened?
2. Why did it happen?
3. What can the user do?

### Error structure

```text
Problem
↓
Explanation
↓
Recovery action
```

### Example

> We couldn't save your changes because the connection was lost. Check your connection and try again.

### Avoid

- "Error 500"
- "Invalid."
- Blaming the user
- Removing user input
- Showing technical details users do not need

---

# 27. Empty States

An empty state appears when there is no data or content.

### Types

- First-use empty state
- No-results state
- No-data state
- Completed state
- Error-related empty state

### Good empty state

```text
Title
Explanation
Optional illustration/icon
Primary action
```

Example:

> No transactions yet  
> Your completed transactions will appear here.  
> [Make a Transaction]

---

# 28. Loading States

Users should know when the system is working.

### Use

- Skeleton screens
- Spinners
- Progress indicators
- Button loading states
- Status messages

### Avoid

- Indefinite unexplained loading
- Blocking the entire UI unnecessarily
- Repeated animations without information

---

# 29. Accessibility Framework

Use accessibility as part of design from the beginning, not as a final patch.

WCAG organizes accessibility around four principles:

```text
Perceivable
Operable
Understandable
Robust
```

### Perceivable

Users must be able to perceive content.

Consider:

- Text alternatives
- Captions
- Contrast
- Resizable text
- Clear visual structure

### Operable

Users must be able to operate the interface.

Consider:

- Keyboard access
- Focus visibility
- Touch targets
- Avoiding inaccessible interactions
- Reasonable timing

### Understandable

Users should understand content and behavior.

Consider:

- Clear language
- Predictable navigation
- Helpful instructions
- Understandable errors

### Robust

Content should work reliably across technologies.

Consider:

- Semantic structure
- Valid implementation
- Assistive technology compatibility

---

# 30. Accessibility Rules

### Do

- Use sufficient contrast.
- Provide visible focus states.
- Use meaningful labels.
- Provide alternative text where appropriate.
- Make controls keyboard accessible.
- Use semantic HTML where applicable.
- Avoid color-only communication.
- Provide captions for relevant media.
- Maintain logical reading/order flow.

### Don't

- Hide focus indicators.
- Use tiny text.
- Depend entirely on color.
- Use icons without accessible names.
- Create keyboard traps.
- Put important information only in hover states.

---

# 31. Responsive Design

Design for different screen sizes and contexts.

### Consider

- Mobile
- Tablet
- Desktop
- Large screens

### Responsive principles

- Use flexible layouts.
- Avoid fixed-width assumptions.
- Prioritize content.
- Adapt navigation.
- Reflow dense content.
- Ensure controls remain usable.
- Test real breakpoints.

---

# 32. Mobile-First Considerations

For mobile interfaces:

- Prioritize essential actions.
- Minimize typing.
- Use appropriate input types.
- Keep controls touch-friendly.
- Avoid overly dense layouts.
- Respect thumb reach where practical.
- Use readable text.
- Avoid unnecessary horizontal scrolling.

---

# 33. Content and Microcopy

UX writing is part of the interface.

### Good microcopy is

- Clear
- Concise
- Specific
- Consistent
- Action-oriented
- Human-readable

### Buttons

Prefer:

> Save Changes

over:

> Submit

when the actual action is saving changes.

### Labels

Use the user's terminology whenever possible.

---

# 34. Buttons

### Button hierarchy

```text
Primary
Secondary
Tertiary / Ghost
Destructive
```

Use the primary button for the main action.

### Rules

- Use action-oriented labels.
- Keep button behavior predictable.
- Distinguish destructive actions.
- Show disabled/loading states where appropriate.
- Avoid too many primary buttons competing for attention.

---

# 35. Search

A search interface should help users find information efficiently.

Consider:

- Search placement
- Placeholder guidance
- Autocomplete
- Filters
- Sorting
- Recent searches where useful
- No-results states
- Typo tolerance when appropriate

### No-results state

Tell users:

- What was searched
- Whether there were results
- What they can try next

---

# 36. Tables and Data-Dense Interfaces

Tables should prioritize scanability.

### Rules

- Use clear column headings.
- Align values logically.
- Avoid unnecessary columns.
- Use consistent formatting.
- Support sorting when useful.
- Support filtering when needed.
- Make row actions understandable.
- Consider responsive alternatives on small screens.

---

# 37. Dashboard Design

A dashboard should answer important questions quickly.

### Dashboard hierarchy

```text
Key status / KPIs
        ↓
Important trends
        ↓
Recent activity
        ↓
Detailed information
        ↓
Secondary actions
```

Do not add charts simply because dashboards are expected to contain charts.

Every visualization should answer a useful question.

---

# 38. Notifications and Alerts

Not every message deserves the same visual intensity.

### Levels

```text
Informational
Success
Warning
Error
Critical
```

Use stronger interruption only when necessary.

### Avoid

- Excessive popups
- Notification spam
- Ambiguous severity
- Alerts without useful actions

---

# 39. Animation and Motion

Motion should support understanding.

### Appropriate uses

- Transition between states
- Showing cause and effect
- Indicating progress
- Directing attention
- Confirming interaction

### Avoid

- Decorative animation everywhere
- Long transitions
- Motion that blocks tasks
- Excessive movement

Provide reduced-motion considerations where appropriate.

---

# 40. Privacy and Trust

Interfaces should communicate:

- What data is collected
- Why it is needed
- What actions will happen
- Whether an action is reversible
- Security-sensitive states
- Permission requests

### Trust principles

- Be transparent.
- Avoid deceptive patterns.
- Don't hide important consequences.
- Don't manipulate users into unwanted actions.
- Make privacy choices understandable.

---

# 41. Design Consistency System

Define reusable standards for:

- Colors
- Typography
- Spacing
- Components
- Icons
- Borders
- Radius
- Shadows
- States
- Terminology
- Interaction patterns

### Consistency levels

```text
Product-wide consistency
        ↓
Feature consistency
        ↓
Component consistency
        ↓
Interaction consistency
```

Consistency should reduce learning effort, not prevent appropriate adaptation.

---

# 42. Spacing and Layout

Use a consistent spacing system.

Example:

```text
4
8
12
16
24
32
48
64
```

The exact scale can vary by project.

### Layout principles

- Align related content.
- Use whitespace intentionally.
- Establish consistent margins.
- Group related content.
- Separate unrelated sections.
- Avoid cramped interfaces.

---

# 43. Visual Density

Visual density should match the task.

### Low-density UI

Useful for:

- Simple consumer tasks
- First-time users
- Highly visual experiences

### High-density UI

Useful for:

- Professional dashboards
- Monitoring
- Data analysis
- Administrative systems

The goal is not maximum whitespace.

The goal is the right amount of information for the user's task.

---

# 44. Common UI/UX Mistakes

### 1. Designing for aesthetics first

Problem:

> The interface looks good but is difficult to use.

Fix:

Start with user goals and tasks.

### 2. Too much information

Problem:

> Users cannot identify priorities.

Fix:

Use hierarchy and progressive disclosure.

### 3. Inconsistent components

Problem:

> Similar controls behave differently.

Fix:

Create a component system.

### 4. Hidden system status

Problem:

> Users don't know whether an action worked.

Fix:

Provide timely feedback.

### 5. Generic errors

Problem:

> Users don't know what to do.

Fix:

Explain the problem and recovery path.

### 6. Color-only meaning

Problem:

> Some users cannot distinguish states.

Fix:

Combine color with text/icons/shape.

### 7. Too many features

Problem:

> Product becomes difficult to navigate.

Fix:

Prioritize essential tasks.

### 8. Designing without testing

Problem:

> Designers validate their own assumptions.

Fix:

Test with representative users.

### 9. Overusing modals

Problem:

> Users are repeatedly interrupted.

Fix:

Use inline feedback when possible.

### 10. Inconsistent terminology

Problem:

> Users must learn multiple names for the same thing.

Fix:

Create a content/terminology standard.

---

# 45. Usability Testing Framework

Testing validates whether the design works for users.

### Basic process

```text
Define objective
      ↓
Select participants
      ↓
Create realistic tasks
      ↓
Observe users
      ↓
Record problems
      ↓
Analyze
      ↓
Prioritize
      ↓
Improve
      ↓
Retest
```

---

# 46. Think-Aloud Testing

Ask users to verbalize their thoughts while completing tasks.

Observe:

- Expectations
- Confusion
- Misinterpretation
- Discoverability problems
- Errors
- Workarounds

Avoid leading the user toward the expected answer.

---

# 47. A/B Testing

Compare two variants.

```text
Version A
   vs.
Version B
```

Measure an appropriate outcome, such as:

- Task completion
- Conversion
- Error rate
- Engagement
- Time to completion

Use A/B testing when there is enough traffic and a measurable hypothesis.

---

# 48. Heatmaps

Heatmaps can help reveal patterns such as:

- Click concentration
- Attention patterns
- Scroll depth

Do not interpret heatmaps as direct proof of user intent. Combine them with other evidence.

---

# 49. Session Replays

Session recordings can reveal:

- Repeated clicks
- Hesitation
- Navigation problems
- Rage clicks
- Dead ends
- Unexpected behavior

Use appropriate privacy protections and avoid capturing sensitive information unnecessarily.

---

# 50. Remote Usability Testing

Remote testing can be:

- Moderated
- Unmoderated

Benefits:

- Broader participant access
- Faster testing
- Real-world environments

Limitations:

- Less control over environment
- Technical issues
- Potential observation limitations

---

# 51. Heuristic Evaluation

Review the interface against usability heuristics.

### Suggested process

1. Define scope.
2. Review each screen.
3. Identify heuristic violations.
4. Record evidence.
5. Assign severity.
6. Recommend improvements.
7. Retest.

### Severity example

```text
0 = Not a usability problem
1 = Cosmetic / low impact
2 = Minor usability problem
3 = Major usability problem
4 = Critical usability problem
```

---

# 52. Expert Testing vs User Testing

### Expert evaluation

Useful for:

- Early detection
- Fast review
- Consistency checks
- Heuristic problems

### User testing

Useful for:

- Discoverability
- Real-world workflows
- User expectations
- Actual task performance

### Best approach

Use both when possible.

---

# 53. Usability Testing Task Design

Good tasks should be:

- Realistic
- Goal-oriented
- Specific enough to understand
- Not overly instructional
- Measurable

### Weak task

> Click the Settings button.

### Better task

> Change your notification preferences so that you no longer receive promotional notifications.

The second tests whether the user can accomplish a meaningful goal.

---

# 54. Usability Metrics

Useful metrics include:

### Task completion rate

```text
Completed tasks / Total tasks × 100
```

### Error rate

```text
Errors / Total task attempts
```

### Time on task

How long users take to complete a task.

### Satisfaction

Can be measured using questionnaires or rating scales.

### Other UX indicators

- Retention
- Churn
- Session duration
- User satisfaction
- Feature adoption
- Support requests

Choose metrics based on the product's goals.

---

# 55. UX Measurement Framework

Define:

```text
Goal
 ↓
User behavior
 ↓
Metric
 ↓
Target
 ↓
Observation
 ↓
Design change
 ↓
Retest
```

Example:

```text
Goal:
Reduce checkout difficulty.

Behavior:
Users complete checkout without assistance.

Metric:
Task completion rate + time on task.

Change:
Simplify checkout form.

Retest:
Compare results before and after.
```

---

# 56. Feedback Loop

UX should continuously improve.

```text
Design
 ↓
Build
 ↓
Test
 ↓
Measure
 ↓
Learn
 ↓
Improve
 ↺
```

Every major usability problem should become an input for the next design iteration.

---

# 57. UX Priority Framework

Not all problems deserve equal effort.

Prioritize based on:

```text
Impact × Frequency × Severity × Confidence
```

### High priority

- Blocks critical tasks
- Causes serious errors
- Affects many users
- Creates major confusion
- Creates accessibility barriers

### Lower priority

- Minor visual inconsistency
- Cosmetic issue
- Rare low-impact problem

---

# 58. Design Decision Framework

When choosing between design alternatives, evaluate:

| Criterion | Question |
|---|---|
| User value | Does this help users? |
| Usability | Is it easy to understand/use? |
| Accessibility | Can different users use it? |
| Consistency | Does it match the system? |
| Efficiency | Does it reduce effort? |
| Risk | Can it cause harmful mistakes? |
| Technical feasibility | Can it be implemented reliably? |
| Evidence | What supports the decision? |

Prefer evidence-backed decisions over personal preference.

---

# 59. UI/UX Design Review Checklist

## User

- [ ] Target users are defined.
- [ ] User goals are defined.
- [ ] Major pain points are identified.
- [ ] Important tasks are mapped.

## Information Architecture

- [ ] Information is logically grouped.
- [ ] Navigation is understandable.
- [ ] Labels use familiar terminology.
- [ ] Important content is easy to find.

## Visual Design

- [ ] Visual hierarchy is clear.
- [ ] Typography is readable.
- [ ] Colors are meaningful.
- [ ] Contrast is sufficient.
- [ ] Spacing is consistent.
- [ ] Components are visually consistent.

## Interaction

- [ ] Controls look interactive.
- [ ] System feedback is provided.
- [ ] Loading states exist.
- [ ] Success states exist.
- [ ] Error states exist.
- [ ] Empty states exist.
- [ ] Destructive actions are handled appropriately.

## Accessibility

- [ ] Keyboard access works where applicable.
- [ ] Focus states are visible.
- [ ] Color is not the only indicator.
- [ ] Text is readable.
- [ ] Images have appropriate alternatives.
- [ ] Interactive elements are accessible.
- [ ] Content order is logical.

## Usability

- [ ] Critical tasks are easy to complete.
- [ ] Errors are understandable.
- [ ] Users can recover from mistakes.
- [ ] Navigation is predictable.
- [ ] Cognitive load is reasonable.
- [ ] Users do not need to remember unnecessary information.

## Testing

- [ ] Representative users tested the design.
- [ ] Realistic tasks were used.
- [ ] Problems were documented.
- [ ] Problems were prioritized.
- [ ] Design was improved based on findings.
- [ ] Major changes were retested.

---

# 60. Project UI/UX Golden Rules

1. **User goals come before visual decoration.**
2. **Design from evidence, not assumptions.**
3. **Make important information easy to see.**
4. **Make actions understandable.**
5. **Provide feedback after meaningful actions.**
6. **Prevent errors whenever possible.**
7. **When errors happen, explain and help recover.**
8. **Prefer recognition over recall.**
9. **Use consistent patterns.**
10. **Reduce unnecessary cognitive load.**
11. **Design accessibility from the beginning.**
12. **Do not use color as the only source of meaning.**
13. **Use whitespace to create structure, not just decoration.**
14. **Don't make every element visually compete for attention.**
15. **Don't hide essential actions for the sake of minimalism.**
16. **Test with real users.**
17. **Measure important user outcomes.**
18. **Iterate based on evidence.**

---

# 61. Recommended Design Workflow

Use this workflow for a real project:

```text
PHASE 1 — DISCOVERY
├── Identify users
├── Identify problems
├── Research context
└── Define goals

PHASE 2 — UX DEFINITION
├── Personas
├── User goals
├── User tasks
├── Pain points
├── Problem statements
└── Requirements

PHASE 3 — STRUCTURE
├── Information architecture
├── Navigation
├── User flows
└── Screen inventory

PHASE 4 — WIREFRAME
├── Low-fidelity layouts
├── Content hierarchy
└── Interaction structure

PHASE 5 — DESIGN SYSTEM
├── Colors
├── Typography
├── Spacing
├── Icons
├── Components
└── States

PHASE 6 — PROTOTYPE
├── High-fidelity screens
├── Interactions
├── Responsive layouts
└── Accessibility

PHASE 7 — TEST
├── Usability testing
├── Heuristic evaluation
├── Accessibility review
└── Technical validation

PHASE 8 — IMPROVE
├── Analyze findings
├── Prioritize problems
├── Implement improvements
└── Retest

PHASE 9 — FINALIZE
├── Design documentation
├── Component documentation
├── UX rationale
└── Final QA
```

---

# 62. Project-Specific UI/UX Specification

Use this structure to convert the generic framework into the actual UI/UX specification for your project.

```text
PROJECT UI/UX
│
├── 1. Target Users
│
├── 2. User Personas
│
├── 3. User Goals
│
├── 4. Pain Points
│
├── 5. UX Requirements
│
├── 6. Information Architecture
│
├── 7. User Flows
│
├── 8. Screen Inventory
│
├── 9. Navigation Structure
│
├── 10. Design System
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Buttons
│   ├── Forms
│   ├── Cards
│   ├── Tables
│   └── Feedback States
│
├── 11. Accessibility Standards
│
├── 12. Nielsen Heuristic Requirements
│
├── 13. Responsive Rules
│
├── 14. Error / Empty / Loading States
│
├── 15. Usability Testing Plan
│
└── 16. Final UI/UX Checklist
```

---

# 63. Final UI/UX Standard

A screen is not "finished" simply because it looks good.

A screen is ready when:

```text
User Need
   +
Clear Structure
   +
Understandable Interaction
   +
Visual Hierarchy
   +
Accessibility
   +
Feedback
   +
Error Recovery
   +
Consistency
   +
Usability Testing
   =
Ready UI/UX
```

The ultimate standard is:

> **Can the intended user accomplish the intended task efficiently, clearly, accessibly, and confidently?**

If the answer is no, continue iterating.

---

# 64. Reference Standards and Research Basis

This framework is informed by established UI/UX guidance and standards, including:

- **Nielsen Norman Group — 10 Usability Heuristics for User Interface Design**
  - Used as the primary heuristic evaluation framework.

- **W3C Web Content Accessibility Guidelines (WCAG) 2.2**
  - Used as the accessibility foundation.
  - Organized around Perceivable, Operable, Understandable, and Robust principles.

- **Apple Human Interface Guidelines**
  - Used for principles including purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, and delight.

- **Material Design**
  - Used for practical accessibility, hierarchy, focus, writing, and interface design guidance.

---

# 65. Final Quick Reference

## UX

```text
Research
→ Empathize
→ Define
→ Ideate
→ Structure
→ Prototype
→ Test
→ Measure
→ Improve
```

## UI

```text
Hierarchy
→ Typography
→ Color
→ Spacing
→ Components
→ Interaction
→ States
→ Accessibility
→ Responsive Design
```

## Usability

```text
Visibility
Consistency
Control
Recognition
Error Prevention
Feedback
Efficiency
Recovery
Help
```

## Accessibility

```text
Perceivable
Operable
Understandable
Robust
```

## Testing

```text
Observe
→ Measure
→ Identify Problems
→ Prioritize
→ Improve
→ Retest
```

---

## Core Principle

> **Good UI makes the interface understandable. Good UX makes the entire experience effective. Great UI/UX makes the user's goal feel simple, clear, and achievable.**
