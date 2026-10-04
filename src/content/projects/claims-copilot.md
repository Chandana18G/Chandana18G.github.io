---
title: "Claims Copilot: Responsible Generative AI for Motor Insurance"
date: 2026-06-01
status: completed
summary: "A generative-AI copilot for motor insurance claims where a human always decides: a runnable prototype of its safeguards, an eight-stage evaluation, and a Responsible AI assessment of whether it can be trusted."
tags: [genai, llm, insurance, responsible-ai, fairness]
stack: [Python, scikit-learn, NumPy, matplotlib, pytest]
github: TODO # TODO: create github.com/Chandana18G/motor-claims-copilot (prepared locally), then set this URL
image: /images/projects/claims-copilot/architecture.webp
imageAlt: "Diagram of one claim's journey. Intake and an injection guard feed extraction, which feeds hybrid retrieval over the claimant's policy, a rule engine and a separate fraud indicator. These produce a cited draft, which goes to an adjuster who decides; high-value or flagged claims need supervisor sign-off. Every step is written to a hash-chained audit log, and the claimant is told only the human decision."
highlights: ["AI never decides: enforced in code", "Subgroup audit: 7× FPR gap (synthetic)", "8-stage evaluation, 10 tests"]
featured: false
---

## Problem

M.Sc. group project. Every motor claim requires an adjuster to work through police reports,
repair estimates, medical documentation and the policy wording, then write a rationale largely
from scratch. A generative-AI copilot can draft that work, but the people the decision lands on,
claimants and third parties, never see the AI and can't contest how it shaped their outcome.

So the project asks two questions: **how do you build a claims copilot where the AI never makes
the decision**, and **should it be trusted with a real claim, and under what conditions?**

## Data

Everything runs on **synthetic data**: three invented motor policies split into citable clauses,
and generated claims with a claim form, a workshop estimate, and sometimes a police report or
medical note. The generator controls the ground truth: conflicting documents, injected
instructions, true fraud, and a **historical bias** where past investigators looked at one area
(B) more often than another (A). True fraud is independent of area; only who got investigated
differs. No real claimant or insurer data is used.

## Approach

<figure>
  <img src="/images/projects/claims-copilot/architecture.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Architecture diagram: intake and guard, extraction, hybrid retrieval, rule engine, separate fraud indicator, cited draft, adjuster decision with supervisor sign-off, and a hash-chained audit log." />
  <figcaption>One claim's journey: AI components prepare, only people decide.</figcaption>
</figure>

- **Prompt-injection guard.** Documents are untrusted input; lines that try to instruct the
  model are quarantined and logged.
- **Schema-constrained extraction** into typed, validated fields. Missing documents and facts
  that disagree across documents are reported, never guessed.
- **Policy-scoped hybrid retrieval** (BM25 + dense vectors, reciprocal rank fusion) over only the
  claimant's own policy, so a draft can't cite another product's terms.
- **Deterministic rule engine** for everything that must be exact: exclusions, excess,
  settlement cap, late notification and escalation thresholds.
- **A separate fraud-indicator model** on structured features. It flags for supervisor review;
  it never decides.
- **Cited drafts with abstention.** Every sentence cites a clause, every quote is checked
  verbatim, and the copilot abstains when the evidence conflicts.
- **The authority boundary in code.** Only a named adjuster can record a decision, overrides
  need a reason, escalated claims need a supervisor, only a recorded human decision reaches the
  claimant, and every step goes into a **hash-chained audit log**.

Alongside the build, a **Responsible AI assessment** examined the system through five ethical
lenses (utilitarianism, deontology, virtue ethics, the UDHR and Ubuntu), the EU AI Act and the
GDPR, and a prioritised risk analysis.

## Results

An eight-stage evaluation on the synthetic data:

| # | Stage | Result |
| --- | --- | --- |
| 1 | Extraction | 100% of 9,881 fields correct (templated documents, so this tests validation, not messy scans) |
| 2 | Abstention | All 119 claims with conflicting evidence abstained, none wrongly |
| 3 | Retrieval | Recall@3: BM25 79%, dense 74%, hybrid 76%; 0 clauses from outside the policy |
| 4 | Rule engine | 100% agreement on exclusions and payouts across 1,881 claims |
| 5 | Fraud fairness | False-positive rate 2.7% (area A) vs **19.7% (area B)** on biased labels |
| 6 | Citations | 100% of deliberately corrupted citations caught |
| 7 | Prompt injection | 100% of known patterns, but only **33% of unseen phrasings** caught |
| 8 | Audit log | 100% of edits, deletions, reorderings and insertions detected |

**Averages hide unfair flagging.** Trained on the biased historical labels, the fraud model
flags honest claimants from area B **7× more often** than those from area A, yet its overall
false-positive rate (8.7%) is almost identical to the fair model's (8.6%). Only the subgroup
breakdown shows it.

<figure>
  <img src="/images/projects/claims-copilot/fairness_fpr.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of false-positive rates by area. Trained on historical labels: 2.7% in area A, 19.7% in area B. With area and postcode proxies removed: 8.6% and 8.6%. With thresholds equalised on an audited sample: 8.2% and 8.0%." />
  <figcaption>Who gets wrongly flagged: the gap disappears once the proxies are removed or thresholds are equalised.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/feedback_loop.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Line chart: as the extra investigation rate in area B grows from 0 to 60 percentage points, the false-positive rate ratio between area B and area A rises from 1.0 to about 9.6 when the model sees area and postcode, and stays at about 1.0 with the proxies removed." />
  <figcaption>The feedback loop: the more uneven the past scrutiny, the more unequal the model (averaged over 5 seeds).</figcaption>
</figure>

**A low override rate proves nothing.** In a simple model of review, the same 3% override rate
fits both 0.2% and 6.6% of wrong drafts becoming decisions, depending on how many drafts are
genuinely reviewed. That's why monitoring has to sample **accepted** recommendations:
re-reviewing 60 of them gives a 95% chance of catching a problem if 5% are wrong.

<figure>
  <img src="/images/projects/claims-copilot/automation_bias.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two panels. Left: override rate versus wrong drafts that become decisions for four review-diligence levels; at a 3% override rate the outcomes range from about 0.2% to 6.6%. Right: probability that an audit sample of accepted drafts contains an error, by sample size, for error rates of 1% to 10%." />
  <figcaption>Human-in-the-loop is not human-in-control: the audit log can't tell rubber-stamping from accuracy.</figcaption>
</figure>

Two results didn't go the way I'd hoped, and I report them as measured. **Hybrid retrieval
didn't beat BM25**, because the offline dense retriever is too weak, and **the injection guard
missed two-thirds of unseen phrasings**. The recommendation stayed unchanged under every attack
only because free text never reaches the rule engine.

<figure>
  <img src="/images/projects/claims-copilot/retrieval.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of retrieval recall on 82 questions. Recall@1 is 61% for BM25, dense and hybrid. Recall@3 is 79% for BM25, 74% for dense and 76% for hybrid. No out-of-scope clauses were returned." />
  <figcaption>Finding the right clause: BM25 wins here; a proper embedding model is the next step.</figcaption>
</figure>

**Verdict of the assessment:** a plausible and defensible Responsible AI design, but responsible
deployment is not yet confirmed until evidence, governance and monitoring requirements are
demonstrated. The legal, ethical and technical analyses each reach this conditional answer
independently.

<figure>
  <img src="/images/projects/claims-copilot/risk_matrix.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Qualitative risk matrix of likelihood against impact on claimants. Automation bias, the accountability gap and unfair fraud detection sit in the high tier; explainability, privacy misuse and prompt injection in the middle; hallucinated terms, mitigated by retrieval grounding, lowest." />
  <figcaption>Risk landscape from the assessment (qualitative ranking, not a measurement).</figcaption>
</figure>

## What I learned

- **Human-in-the-loop is not human-in-control.** The architecture can guarantee that an adjuster
  is present; only evidence from real use can show they're exercising independent judgement.
- **Citation is not causation.** A rationale can cite a real clause without that clause being
  why the model recommended what it did, so citation checks are necessary but not sufficient.
- **Fairness has to be measured per subgroup.** Here, removing two proxy features was enough
  because the generator had no others. In real data proxies hide in other variables, so parity
  has to be tested, not assumed.
- **Governance is a design component.** No existing function owned GenAI-specific risk, so the
  assessment proposes an AI Governance function, joint sign-off, one monitoring programme and a
  staged, evidence-gated rollout, with review time protected as a control rather than squeezed
  for throughput.
