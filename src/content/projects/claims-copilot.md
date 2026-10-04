---
title: "Claims Copilot: Responsible Generative AI for Motor Insurance"
date: 2026-06-01
status: completed
summary: "A generative-AI copilot for motor insurance claims where a person always decides: a working prototype of its safeguards, an evaluation built to find where they fail, and a Responsible AI assessment."
tags: [genai, llm, insurance, responsible-ai, fairness]
stack: [Python, Claude API, scikit-learn, NumPy, SciPy, matplotlib, pytest, Hypothesis]
github: TODO # TODO: create github.com/Chandana18G/motor-claims-copilot (prepared locally), then set this URL
image: /images/projects/claims-copilot/architecture.webp
imageAlt: "Diagram of one claim's journey. Intake and an injection guard feed extraction, which feeds hybrid retrieval over the claimant's policy, a rule engine and a separate fraud indicator. These produce a cited draft from an LLM or a template, which is checked and goes to an adjuster with a signed staff token; escalated claims need a different supervisor. A keyed audit log with monitoring and kill switches records every step, and the claimant is told only a sealed human decision."
highlights: ["AI never decides: 11/11 bypasses refused", "0 of 88 injections reached adjusters", "Hidden proxy bias: 1.6× FPR (synthetic)"]
featured: false
---

## Problem

Every motor claim requires an adjuster to work through police reports, repair estimates,
medical documentation and the policy wording, then write a rationale largely from scratch. A
generative-AI copilot can draft that work, but the people the decision lands on, claimants and
third parties, never see the AI and can't contest how it shaped their outcome.

So this project asks two questions: **how do you build a claims copilot where the AI never makes
the decision**, and **should it be trusted with a real claim, and under what conditions?** It
combines a Responsible AI assessment (ethics, EU AI Act, GDPR, risk and governance) with a
working prototype whose evaluation is designed to find where the safeguards fail.

## Data

Claims and policies are **synthetic**: three invented motor policies with about 20 citable
clauses each, and generated claims with a claim form, a workshop estimate, and sometimes a police
report or medical note. To keep the evaluation honest, the documents are messy on purpose:
English and German forms, a free-text style held out from development, and OCR noise that
drops digits. The generator also builds in a **historical bias**: past investigators looked at
one area more often, and that area's cars are older and cheaper. True fraud is independent of
area.

Two external inputs keep the tests independent of my own design: pretrained **GloVe** word
vectors for retrieval and **88 prompt-injection attacks from NVIDIA garak**, an open-source LLM
vulnerability scanner.

## Approach

<figure>
  <img src="/images/projects/claims-copilot/architecture.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Architecture diagram: intake and guard, extraction, hybrid retrieval, rule engine, separate fraud indicator, cited draft with output checks, adjuster decision with signed tokens and four-eyes sign-off, and a keyed audit log with monitoring and kill switches." />
  <figcaption>One claim's journey: AI components prepare, only signed-in people decide.</figcaption>
</figure>

- **Untrusted documents.** A guard quarantines injected instructions; extraction reads typed,
  validated fields and reports missing or conflicting facts instead of guessing.
- **Policy-scoped hybrid retrieval** (BM25 + GloVe, reciprocal rank fusion) over only the
  claimant's own policy.
- **A deterministic rule engine** for exclusions, excess, limits and escalation, checked
  against 14 cases worked out by hand plus property tests.
- **An LLM drafter (Claude) that can only explain, not decide.** Every generated draft must cite
  verbatim the exact clauses the rule engine used, keep its recommendation, and contain no
  invented amounts, other claims or echoed injected text. Otherwise it is replaced by a template.
- **A human-decision boundary in code:** signed, expiring staff tokens; override reasons;
  escalated claims signed off by a *different* supervisor; sealed decisions; role-based access
  to health data; and a keyed audit log anchored outside itself.
- **Monitoring that measures real review:** hidden canary drafts, unannounced re-review, and
  fairness checks that pause a component automatically until the governance function resumes it.

The assessment examined the system through five ethical lenses (utilitarianism, deontology,
virtue ethics, the UDHR and Ubuntu), the EU AI Act and the GDPR, and a prioritised risk analysis.

## Results

All on synthetic data:

| Stage | Result |
| --- | --- |
| Extraction | 100% correct on clean forms; held-out free-text letters 100% abstained, never misread |
| Retrieval | Recall@1 49% hybrid vs 36% keywords; 0 clauses from another policy |
| Rule engine | 14/14 hand-worked cases and all property tests pass |
| Generated drafts | 7 failure modes of a misbehaving model: 100% rejected |
| Prompt injection | Pattern guard caught only 11% of garak's attacks, yet **0 of 88** changed what the adjuster sees |
| Authority boundary | 11/11 bypass attempts refused (forged, expired, revoked tokens, self sign-off…) |
| Audit log | All tampering detected except an insider rewrite after the last checkpoint |

**Averages hide unfair flagging, and the obvious fix is not enough.** Trained on the biased
investigation records, the fraud model flags honest claimants from one area **7.6×** as often.
Removing the area and postcode features still leaves **1.57×** (95% CI 1.40–1.76), because
vehicle age and value act as hidden proxies. Training on a 2,000-claim audited sample closes the
gap (1.08×) and is also the most accurate model.

<figure>
  <img src="/images/projects/claims-copilot/fairness_fpr.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of false-positive rates by area with 95% confidence intervals. All features: 2.7% in area A vs 20.5% in area B, ratio 7.6. Area and postcode removed: ratio 1.57, still flagged. Thresholds equalised on an audit sample: ratio 1.01. Trained on a 2,000-claim audit sample: ratio 1.08." />
  <figcaption>Who gets wrongly flagged: removing the area feature isn't enough; an audited sample is.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/feedback_loop.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Line chart: as extra past investigation in area B rises from 0 to 60 percentage points, the false-positive ratio rises to about 9.9 with all features and about 1.5 with area removed, and stays near 1.0 with behaviour features only." />
  <figcaption>The feedback loop: uneven past scrutiny becomes tomorrow's training label.</figcaption>
</figure>

**A low override rate proves nothing; hidden canaries do.** Across 2,000 simulated worlds, the
override rate had no relationship with how many wrong drafts became decisions (ρ = −0.02); at a
3% override rate, anywhere from 0.05% to 13% of decisions rested on a wrong draft. Sixty hidden
canaries estimated how often errors are really caught almost exactly (ρ = 0.97).

<figure>
  <img src="/images/projects/claims-copilot/automation_bias.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two scatter plots over 2,000 simulated worlds. Left: override rate against the share of wrong drafts that became decisions shows no relationship, Spearman rho -0.02. Right: canary-based estimate against the true catch rate lies close to the diagonal, rho 0.97." />
  <figcaption>Human-in-the-loop is not human-in-control, but it can be measured.</figcaption>
</figure>

**Defence in depth held where the first layer failed.** The pattern guard missed 60 of 88
external attacks. A worst-case model obeyed every one that reached it, and the output checks
rejected all 60 drafts.

<figure>
  <img src="/images/projects/claims-copilot/injection.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart: 88 garak attacks inserted into claims, 60 missed by the pattern guard, 60 obeyed by the model and rejected by output checks, 0 changed what the adjuster sees." />
  <figcaption>Prompt injection: architecture, not pattern matching, kept the adjuster's view clean.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/extraction.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Stacked bars of extraction results by document style. Clean English and German forms: 100% correct. With OCR noise: about 95% correct and 5% wrong. Free-text letters: 100% missing, so the copilot abstains." />
  <figcaption>Reading documents: unknown layouts lead to abstention, not guesses; OCR errors are the weak spot.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/retrieval.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of retrieval recall on 173 checks. Recall@1: BM25 36%, LSA 36%, GloVe 42%, hybrid BM25 plus GloVe 49%. Recall@3: BM25 54%, GloVe 66%, hybrid 65%." />
  <figcaption>Finding the right clause: pretrained GloVe vectors beat keywords; the hybrid ranks the right clause first most often.</figcaption>
</figure>

**What didn't work:** OCR errors that no second document confirms still reach 2.5% of drafts,
the guard alone is weak, and an insider with the audit key can rewrite entries after the last
checkpoint. The live Claude evaluation is ready but needs an API key to run.

**Verdict of the assessment:** a plausible and defensible Responsible AI design, but responsible
deployment is not yet confirmed until evidence, governance and monitoring requirements are
demonstrated. The prototype shows which evidence is still missing and how to collect it.

<figure>
  <img src="/images/projects/claims-copilot/risk_matrix.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Qualitative risk matrix of likelihood against impact on claimants. Automation bias, the accountability gap and unfair fraud detection sit in the high tier; explainability, privacy misuse and prompt injection in the middle; hallucinated terms, mitigated by retrieval grounding, lowest." />
  <figcaption>Risk landscape from the assessment (qualitative ranking, not a measurement).</figcaption>
</figure>

## What I learned

- **Human-in-the-loop is not human-in-control.** The architecture can guarantee that a person is
  present; only measurement, like hidden canaries, can show they are exercising judgement.
- **Removing a sensitive feature does not remove its proxies.** Fairness has to be measured per
  subgroup, with confidence intervals and replication, on outcomes that aren't themselves biased.
- **Don't trust the first layer.** The injection guard failed on unseen attacks; safety came from
  letting the model explain decisions but never make them, and checking every output.
- **Make the evaluation try to break the system.** Testing on held-out formats, external attacks
  and null controls exposed real weaknesses, and a real bug: an expired staff token was accepted
  until the authority tests caught it.
