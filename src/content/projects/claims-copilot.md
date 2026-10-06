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
featured: false
---

## Problem

A generative-AI Claims Copilot could take a real bottleneck off motor insurance adjusters, who
today work through police reports, repair estimates, medical documentation and the policy
wording and write a rationale from scratch for every claim. But the claimant, and any third
party, never interacts with the AI and has almost no visibility into how it shaped their outcome.

So the question is not whether the system works, but **whether it should be trusted with a real
claim, and under what conditions**. A system that is faster but less fair, or more efficient
but less accountable, is not a neutral trade-off: it moves risk onto the people least able to
see or contest it.

## Data

The assessment examines the system's design and documentation. To test two of its central
claims, I ran small analyses on **synthetic claims**, generated so that the true answer is known:
fraud is independent of where people live, but past investigators looked at one area more often.
The analyses show mechanisms, not rates for any real insurer.

## Approach

<figure>
  <img src="/images/projects/claims-copilot/architecture.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Diagram of one claim's journey: intake, document processing, a generative AI draft grounded in policy wording, a separate fraud indicator, adjuster review with supervisor escalation, the human decision, and an immutable audit log." />
  <figcaption>The system assessed: the AI prepares, only people decide, and the boundary is architectural.</figcaption>
</figure>

- **Stakeholders.** I mapped who influences the system against who lives with its consequences.
  Claimants have no influence at all, which creates three tensions: efficiency vs. fairness,
  fraud prevention vs. privacy, and automation vs. accountability, where the adjuster risks
  becoming a *moral crumple zone*.
- **Five ethical lenses:**
  - **Utilitarianism:** speed benefits and false-flag harms fall on different people.
  - **Deontology:** automation bias can break the duty while formally respecting it.
  - **Virtue ethics:** design can support judgement but not create it.
  - **UDHR Art. 7, 8 and 12:** equality, effective remedy and privacy.
  - **Ubuntu:** whether the insurer–adjuster–claimant relationship survives.

  All five converge on one question: **does the claimant stay visible?**
- **Regulation.**
  - **EU AI Act:** whether this is high-risk is genuinely open, because Annex III names life and
    health pricing, not motor claims. If it is high-risk, Art. 14(4)(b) on automation bias
    applies directly.
  - **GDPR:** a DPIA is very likely mandatory (Art. 35). Art. 22 turns on the *SCHUFA* test,
    which depends on use, not design.
- **Risks, governance and a staged deployment plan**, with ownership spread across existing
  functions, a new AI Governance function and a RACI across nine activities.

## Results

**Human-in-the-loop is not human-in-control.** The workflow guarantees that a person *could*
step in; it can't guarantee they exercise independent judgement. To test what monitoring can
reveal, I simulated 2,000 possible worlds across wide ranges of AI error and review diligence.
The **override rate had no relationship** with how many wrong drafts became decisions
(ρ = −0.02): at a 3% override rate, anywhere from 0.05% to 13% of decisions rested on a wrong
draft. **Unannounced re-review of accepted decisions tracked the harm** (ρ = 0.84), which is why
the governance design monitors what was accepted, not just what was overridden.

<figure>
  <img src="/images/projects/claims-copilot/automation_bias.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two scatter plots over 2,000 simulated worlds. Left: override rate against the share of wrong drafts that became decisions shows no relationship, Spearman rho -0.02. Right: an estimate from re-reviewing 100 accepted decisions closely tracks the true share, rho 0.84." />
  <figcaption>A low override rate looks the same whether the AI is accurate or nobody is checking.</figcaption>
</figure>

**Averages hide who gets wrongly flagged.** Trained on biased investigation records, an
illustrative fraud model flagged honest claimants from one area **7.6×** as often. Removing the
area and postcode features still left **1.36×** (95% CI 1.21–1.52), because vehicle age and
value act as hidden proxies. Equalising decision thresholds on an audited sample of 2,000 claims
closed the gap. Retraining on that small sample overshot in the other direction, so the fix
needs care too.

<figure>
  <img src="/images/projects/claims-copilot/fairness_fpr.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of false-positive rates by area with 95% confidence intervals. All features: 2.5% in area A vs 19.5% in area B, ratio 7.62. Area and postcode removed: ratio 1.36, still flagged. Thresholds equalised on an audit sample: ratio 1.00. Trained on a 2,000-claim audit sample: ratio 0.77, flagged in the other direction." />
  <figcaption>Removing the sensitive feature isn't enough; its proxies carry the bias.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/feedback_loop.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Line chart: as extra past investigation in area B rises from 0 to 60 percentage points, the false-positive ratio rises to about 8 with all features and about 1.5 with area removed, and stays near 1.0 with behaviour features only." />
  <figcaption>The feedback loop: uneven past scrutiny becomes tomorrow's training label.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/risk_matrix.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Qualitative risk matrix of likelihood against impact on claimants. Automation bias, the accountability gap and unfair fraud detection sit in the high tier; explainability, privacy misuse and prompt injection in the middle; hallucinated terms, mitigated by retrieval grounding, lowest." />
  <figcaption>Risk landscape from the assessment (qualitative ranking, not a measurement).</figcaption>
</figure>

**Verdict:** a plausible and defensible Responsible AI design, but responsible deployment is not
yet confirmed until evidence, governance and monitoring requirements are demonstrated. The legal
analysis, the five ethical lenses and the risk analysis each reach this conditional answer
independently.

## What I learned

- **Ethical frameworks are most useful when they disagree on method but converge on a
  question.** Five lenses pointed to the same test: does the claimant stay visible?
- **Oversight has to be measured, not assumed.** A human in the loop is a design property; a
  human in control is something only evidence from use can show.
- **Removing a sensitive feature does not remove its proxies.** Fairness must be measured per
  subgroup, on outcomes that aren't themselves biased.
- **Governance is part of the design.** A risk nobody owns is a risk nobody corrects, so
  ownership, sign-off and the authority to pause belong in the system from the start.
