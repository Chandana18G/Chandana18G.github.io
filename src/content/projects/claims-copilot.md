---
title: "Claims Copilot: Responsible Generative AI for Motor Insurance"
date: 2026-06-01
status: completed
summary: "Should a generative-AI copilot be trusted with motor insurance claims? A Responsible AI assessment through five ethical lenses, the EU AI Act and GDPR, risk and governance, backed by a fairness audit and an automation-bias simulation."
tags: [responsible-ai, ai-ethics, fairness, ai-governance, insurance, genai]
stack: [Python, NumPy, SciPy, scikit-learn, matplotlib]
github: https://github.com/Chandana18G/motor-claims-copilot
image: /images/projects/claims-copilot/architecture.webp
imageAlt: "Diagram of one claim's journey. Claim intake and document processing feed a generative AI draft grounded in the policy wording and a separate statistical fraud indicator. An adjuster accepts, edits or overrides the draft, with high-value or fraud-flagged claims going to a supervisor. Only the human decision reaches the claimant, and every step is written to an immutable audit log. The AI cannot approve, pay or contact the claimant."
highlights: ["Five ethical lenses, one verdict", "Hidden proxy bias: 1.36× (synthetic)", "Override rate: no signal of harm"]
featured: true
---

## Problem

A generative-AI Claims Copilot could take a real bottleneck off motor insurance adjusters. Today
they work through police reports, repair estimates, medical documentation and the policy wording,
and write a rationale largely from scratch for every claim.

But the claimant, and any third party such as the other driver, never interacts with the AI and
has almost no visibility into how it shaped their outcome. So the question this project answers is
not whether the system works, but **whether it should be trusted with a real claim, and under
what conditions**.

A system that is faster but less fair, or more efficient but less accountable, is not a neutral
trade-off. It **redistributes risk onto the people least able to see or contest it**.

## Data

The assessment examines the system's design and documentation. To test two of its central claims,
I ran small analyses on **synthetic claims**, generated so that the true answer is known. Fraud is
independent of where people live, but past investigators looked at one area more often, and that
area's cars are older and cheaper. The analyses show mechanisms, not rates for any real insurer;
validating them would need an insurer's audited claims.

## Approach

### The system assessed

<figure>
  <img src="/images/projects/claims-copilot/architecture.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Diagram of one claim's journey: intake, document processing, a generative AI draft grounded in policy wording, a separate fraud indicator, adjuster review with supervisor escalation, the human decision, and an immutable audit log." />
  <figcaption>One claim's journey: the AI prepares, only people decide.</figcaption>
</figure>

A claim comes in through the portal, email or phone, and the documents are checked for
completeness. A **separate statistical fraud model** scores the claim; keeping fraud detection
apart from text generation is a deliberate design decision. The generative AI, grounded in the
claimant's policy wording and the insurer's guidelines through retrieval-augmented generation,
drafts a summary, a recommendation and an evidence-citing rationale.

The adjuster accepts, edits or overrides the draft, and every override reason is logged.
High-value and fraud-flagged claims go to a supervisor. Only the human decision (approve, deny,
request information, or refer to the special investigations unit) reaches the claimant, and every
step is recorded in an immutable audit log.

The boundary is **architectural, not a policy promise**: the AI has no permission to approve a
claim, authorise a payout or contact the claimant.

### Stakeholders: who bears the risk

| Influence over the system | Operate it | Affected by it |
| --- | --- | --- |
| Executive and claims management, AI development team, compliance, DPO, risk management, internal audit | Claims adjusters and supervisors: they run it but did not design it | Claimants and third parties (the other driver, witnesses, treating physicians): no influence at all |

This asymmetry creates three tensions that run through the whole assessment:

- **Efficiency vs. fairness**
- **Fraud prevention vs. privacy**
- **Automation benefit vs. accountability.** The adjuster risks becoming a *moral crumple zone*,
  carrying full formal responsibility for a decision they did not really originate.

In every tension, the people with the least power absorb the cost when things tilt toward
efficiency.

### Ethics: five lenses, one convergence

| Lens | What it surfaces |
| --- | --- |
| **Utilitarianism** | The efficiency gains are real, but an aggregate calculation breaks down when the harm of a false fraud flag and the benefit of speed fall on different groups. |
| **Deontology** | Because the AI can't communicate a decision, a human stays where the duty is discharged. But automation bias can violate that duty while formally respecting it. |
| **Virtue ethics** | What would a wise adjuster do with a fluent recommendation under caseload pressure? Design gives judgement a channel (logged overrides) but can't manufacture it. |
| **UDHR** | Art. 7 (equality): the fraud model may inherit uneven scrutiny. Art. 8 (remedy): the claimant's explanation is mediated twice. Art. 12 (privacy): health data becomes more exposed in a plain-language summary. |
| **Ubuntu** | Does the system sustain the insurer–adjuster–claimant relationship, or reduce it to rubber-stamping? |

Five different logics land on the same question: **does the claimant stay visible in the
process?**

### Regulation: a genuinely contested classification

- **EU AI Act.** Annex III lists insurance as high-risk only for risk assessment and pricing in
  *life and health* insurance. It names neither claims handling nor motor insurance, so I leave
  the classification open rather than assume high-risk status. If it is high-risk,
  **Art. 14(4)(b)** applies almost word for word: overseers must stay aware of automation bias
  when a system "provides recommendations for decisions to be taken by natural persons".
  **Art. 26** sets out the deployer's obligations.
- **GDPR.**
  - A **DPIA is very likely mandatory (Art. 35)**: scoring, special-category data and possibly
    automated decisions stack together.
  - **Art. 22** turns on the CJEU *SCHUFA* test: whether the adjuster's decision "draws strongly
    upon" the AI's draft. That depends on use, not design.
  - **Art. 25** (data protection by design) anchors the privacy safeguards.

### Risk landscape

<figure>
  <img src="/images/projects/claims-copilot/risk_matrix.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Qualitative risk matrix of likelihood against impact on claimants. Automation bias, the accountability gap and unfair fraud detection sit in the high tier; explainability, privacy misuse and prompt injection in the middle; hallucinated terms, mitigated by retrieval grounding, lowest." />
  <figcaption>Risks ranked by likelihood and impact on claimants (qualitative, not a measurement).</figcaption>
</figure>

1. **Automation bias** comes first. It is the precondition for other risks, and it is invisible
   in the audit log: an accepted recommendation looks the same whether it was scrutinised or
   rubber-stamped.
2. **The accountability gap** is a confirmed structural fact, and it leaves errors uncorrected.
3. **Unfair fraud detection** ranks high despite uncertain likelihood, because the harm is severe
   and falls on the most vulnerable.
4. **Explainability** and **privacy misuse** form the next tier.

## Results

### Human-in-the-loop is not human-in-control

Being *in the loop* means being positioned to step in; being *in control* means exercising
judgement strong enough to catch the system's mistakes. The workflow guarantees the first by
design, not the second. The adjuster sees the draft and the fraud flags before forming a view,
which anchors their judgement.

The same gap appears in explainability as **citation versus causation**: a rationale can cite a
real clause without that clause being why the model recommended what it did.

To test what monitoring can reveal, I simulated 2,000 possible worlds across wide ranges of AI
error (1–15%), review diligence (5–100%) and catch rate (60–95%).

- **The override rate had no relationship** with how many wrong drafts became decisions
  (ρ = −0.02). At a 3% override rate, anywhere from 0.05% to 13% of decisions rested on a
  wrong draft.
- **Unannounced re-review of accepted decisions tracked the harm** (ρ = 0.84). That is why the
  governance design monitors what was accepted, not just what was overridden.

<figure>
  <img src="/images/projects/claims-copilot/automation_bias.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two scatter plots over 2,000 simulated worlds. Left: override rate against the share of wrong drafts that became decisions shows no relationship, Spearman rho -0.02. Right: an estimate from re-reviewing 100 accepted decisions closely tracks the true share, rho 0.84." />
  <figcaption>A low override rate looks the same whether the AI is accurate or nobody is checking.</figcaption>
</figure>

### Fairness: averages hide who gets flagged

The right metric for a fraud model is the **false-positive rate by subgroup**, because a false
flag causes harm (delay, scrutiny, suspicion) even if the claim clears.

| Fraud model | Honest area-B claimants flagged, relative to area A |
| --- | --- |
| Trained on biased investigation records | **7.6×** |
| Area and postcode removed | **1.36×** (95% CI 1.21–1.52): vehicle age and value act as proxies |
| Thresholds equalised on a 2,000-claim audited sample | **1.00×** |
| Retrained on that audited sample | 0.77×: overshoots in the other direction, unstable |

<figure>
  <img src="/images/projects/claims-copilot/fairness_fpr.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of false-positive rates by area with 95% confidence intervals. All features: 2.5% in area A vs 19.5% in area B, ratio 7.62. Area and postcode removed: ratio 1.36, still flagged. Thresholds equalised on an audit sample: ratio 1.00. Trained on a 2,000-claim audit sample: ratio 0.77, flagged in the other direction." />
  <figcaption>Removing the sensitive feature isn't enough; its proxies carry the bias.</figcaption>
</figure>

There is also a **feedback loop**: if a model is retrained on the outcomes of AI-influenced
investigations, today's flagging pattern becomes tomorrow's training label. The more uneven the
past scrutiny, the more unequal the model.

<figure>
  <img src="/images/projects/claims-copilot/feedback_loop.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Line chart: as extra past investigation in area B rises from 0 to 60 percentage points, the false-positive ratio rises to about 8 with all features and about 1.5 with area removed, and stays near 1.0 with behaviour features only." />
  <figcaption>Uneven past scrutiny becomes tomorrow's training label.</figcaption>
</figure>

As controls:
- The audit flagged 1 of 10 models trained on unbiased labels, its expected false-alarm rate.
- It flagged 4 of 10 models that see area directly even with unbiased labels.
- Sex, which carries no built-in bias, was never flagged.

### Privacy, security and sustainability

- **Grounding** in the claimant's policy fixes hallucinated coverage terms, but does nothing for
  automation bias or fairness.
- **Prompt injection:** a submitted document could hide text designed to reveal another
  claimant's data.
- **Access should match sensitivity**, and an AI summary needs the same protection as the medical
  record it came from.
- **Sustainability:** an illustrative estimate of roughly 10.6 kg CO₂e per model update, under
  stated assumptions. The main Green AI lever is a smaller, task-specific model.

### Governance: closing the accountability gap

No existing function owns GenAI-specific risk for this system. Four mechanisms close the gap:

1. **Ownership** across existing functions, plus a new coordinating AI Governance function, with a
   RACI across nine activities.
2. **Joint sign-off** by Legal & Compliance, the DPO, model risk and the AI Governance function.
3. **One monitoring programme:** override rates, subgroup fairness, access-log audits and
   unannounced review of *accepted* recommendations.
4. **Incident response** with defined triggers (fairness disparity, privacy incident, misleading
   rationale) and someone authorised to pause that part of the system.

### Path to deployment

1. **Pre-deployment validation:** subgroup fairness testing with pass/fail criteria set in
   advance, a scoped DPIA, rationale-vs-reasoning tests, prompt-injection security testing.
2. **Restricted pilot:** limited adjusters, special-category and fraud-flagged claims excluded at
   first, a lower escalation threshold.
3. **Limited rollout → full deployment → ongoing monitoring**, each stage earned by evidence.

The business case is reducing workload, but real oversight needs review time. **Review time is a
governance control to protect**, not a cost to flex against throughput targets.

### Verdict

> A plausible and defensible Responsible AI design, but responsible deployment is not yet
> confirmed until evidence, governance and monitoring requirements are demonstrated.

The design's strengths are real: architectural human authority, a separate fraud model, grounded
recommendations and an immutable log. But fairness, privacy, governance ownership and meaningful
oversight still have to be shown in practice.

The legal analysis, the five ethical lenses and the risk analysis each reach this conditional
answer independently. None of the conditions works alone: validation without ownership leaves no
one to act on what it finds, and governance without validation has nothing to act on.

## What I learned

- **Ethical frameworks are most useful when they disagree on method but converge on a
  question.** Five lenses pointed to the same test: does the claimant stay visible?
- **Oversight has to be measured, not assumed.** A human in the loop is a design property; a
  human in control is something only evidence from use can show.
- **Removing a sensitive feature does not remove its proxies.** Fairness must be measured per
  subgroup, on outcomes that aren't themselves biased.
- **Governance is part of the design.** A risk nobody owns is a risk nobody corrects, so
  ownership, sign-off and the authority to pause belong in the system from the start.
