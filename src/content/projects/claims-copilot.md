---
title: "Claims Copilot: Responsible Generative AI for Motor Insurance"
date: 2026-06-01
status: completed
summary: "A generative-AI copilot for motor insurance claims where the AI never decides: a runnable prototype of its safeguards, an evaluation designed to break them, and a Responsible AI assessment."
tags: [genai, llm, rag, insurance, responsible-ai]
stack: [Python, scikit-learn, NumPy, SciPy, Claude API, BM25, GloVe, pytest, Hypothesis, matplotlib]
github: https://github.com/Chandana18G/motor-claims-copilot
image: /images/projects/claims-copilot/architecture.webp
imageAlt: "Diagram of one claim's journey: intake and injection guard, extraction, then hybrid retrieval, a deterministic rule engine and a separate fraud indicator feed a cited draft. Only a signed-in adjuster decides; every step goes to a keyed audit log with monitoring."
highlights: ["0 of 88 injections changed a draft", "Unfair flagging 7.6× → 1.08×", "11/11 authority bypasses refused"]
featured: true
---

## Problem

M.Sc. group project. Every motor insurance claim requires an adjuster to work through police
reports, repair estimates, medical documentation and the policy wording, then draft a rationale
largely from scratch. A generative-AI copilot can draft that work. But claimants never see the AI
and can't contest how it shaped their outcome. A system that is faster but less fair, or more
efficient but less accountable, moves risk onto the people least able to see it.

So the design rule was simple: **the AI never makes the decision.** It drafts; a named,
signed-in person decides. The prototype enforces that rule in code, and the evaluation tries to
break it.

## Data

All claims and policies are **synthetic**, produced by a generator in the repo. No real claimant,
insurer or medical data is used. The external inputs are pretrained GloVe word vectors and the
prompt-injection probes from NVIDIA's **garak** scanner. The numbers below describe the prototype
on this data, not a real claims population.

## Approach

- **Guard and extraction:** documents are treated as untrusted input, and lines that try to
  instruct the model are quarantined. Typed, validated fields come from English and German forms.
  Missing or conflicting facts are reported, never guessed.
- **Hybrid retrieval:** BM25 + GloVe, fused with reciprocal rank fusion, over **only the
  claimant's own policy**.
- **Deterministic rule engine** for exclusions, excess, settlement caps, medical limits, late
  notification and escalation.
- **Cited drafts** from Claude or a template. Each draft must pass output checks (verbatim
  citations, exactly the clauses that drove the outcome, no invented amounts, no echoed injected
  text). A failing draft is replaced, never shown.
- **Authority and accountability:** signed, expiring staff tokens; only an adjuster or
  supervisor can decide; escalated claims need a *different* supervisor; an HMAC hash-chained
  audit log; role-filtered access to health data.
- **Monitoring:** hidden canary drafts and unannounced re-review measure whether human review
  is real.

The evaluation is built so it can't grade its own homework. One document style is held out, 14
rule cases were worked out by hand, null controls test the fairness audit, and **88 external
attacks from NVIDIA garak** were never used to tune the guard. **43 automated tests** cover the
pipeline.

## Results

<figure>
  <img src="/images/projects/claims-copilot/extraction.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Stacked bars of extraction accuracy by document type: 100% correct on clean English and German forms, 95% correct and 5% wrong with OCR noise, and 100% missing on held-out free-text letters, where the copilot abstains." />
  <figcaption>Clean forms are read perfectly. On the held-out letter style the copilot abstains instead of guessing.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/retrieval.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of retrieval recall for five methods. Recall@3: BM25 54%, dense LSA 52%, hybrid BM25+LSA 52%, dense GloVe 66%, hybrid BM25+GloVe 65%. Hybrid BM25+GloVe has the best recall@1 at 49%." />
  <figcaption>Hybrid retrieval gives the best top-1 recall (49% vs 36% for BM25), with zero clauses from another policy.</figcaption>
</figure>

**Averages hide unfair flagging, and the obvious fix isn't enough.** In the generator, true
fraud doesn't depend on area, but past investigators checked area B more often, so more of its
fraud was recorded. A fraud model trained on those records flags honest area-B claimants
**7.6×** as often. Removing area and postcode still leaves **1.57×**, because vehicle age and
value act as proxies. Equalising thresholds or training on an audited sample closes the gap
(1.01× and 1.08×).

<figure>
  <img src="/images/projects/claims-copilot/fairness-fpr.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Bar chart of false-positive rates for areas A and B under four model variants: historical labels 2.7% vs 20.5% (ratio 7.56), area and postcode removed 7.4% vs 11.6% (1.57), thresholds equalised 9.2% vs 9.3% (1.01), trained on audit sample 8.5% vs 9.2% (1.08)." />
  <figcaption>False-positive rates by area. Dropping the area feature isn't enough; an audited sample is.</figcaption>
</figure>

<figure>
  <img src="/images/projects/claims-copilot/feedback-loop.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Line chart: as extra historical scrutiny of area B rises from 0 to 60 points, the false-positive ratio rises to almost 10 with all features, to about 1.5 with area and postcode removed, and stays at parity with behaviour features only." />
  <figcaption>Uneven past scrutiny becomes tomorrow's training label: the bias grows with the scrutiny gap.</figcaption>
</figure>

**A low override rate proves nothing; canaries do.** Across 2,000 simulated worlds, how often
adjusters override the AI has no relationship with how many wrong drafts become decisions
(Spearman ρ = −0.02). Sixty hidden canary drafts estimate the true catch rate closely (ρ = 0.97).

<figure>
  <img src="/images/projects/claims-copilot/automation-bias.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two scatter plots over 2,000 simulated worlds. Left: override rate vs share of wrong AI drafts that became decisions, no relationship (Spearman ρ = −0.02). Right: canary estimate vs true catch rate, close to the diagonal (ρ = 0.97)." />
  <figcaption>The override rate carries no signal about harm; hidden canaries track the true catch rate.</figcaption>
</figure>

**Defence in depth held.** The pattern guard alone caught only 11% of garak's attacks. But
the model only explains the rule engine's outcome, and every draft is checked before anyone sees
it. All 60 attacks that reached the model were rejected, and **none changed what the adjuster
sees**.

<figure>
  <img src="/images/projects/claims-copilot/injection.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Funnel bar chart: 88 garak attacks inserted into claims, 60 missed by the pattern guard, 60 obeyed by the worst-case model but rejected by output checks, 0 changed what the adjuster sees." />
  <figcaption>Prompt injection funnel against a worst-case model that obeys every injection it sees.</figcaption>
</figure>

Other results on the synthetic data:

- **Rule engine:** 14/14 hand-worked cases and both property tests pass.
- **Authority boundary:** 11/11 bypass attempts refused, including forged, expired and revoked
  tokens.
- **Audit log:** every edit, deletion, reordering and back-dated entry detected. An insider
  rewrite with no checkpoint is not, which is why checkpoints must be frequent.
- **Compute:** 3 ms CPU per claim.

## Responsible AI assessment

The project weighs the system through five ethical lenses (utilitarianism, deontology, virtue
ethics, the UDHR and Ubuntu), the **EU AI Act** and the **GDPR**, including a draft DPIA. All of
them converge on one question: **does the claimant stay visible in the process?**

<figure>
  <img src="/images/projects/claims-copilot/risk-matrix.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Qualitative risk matrix of likelihood vs impact on claimants. Highest: unfair fraud detection, automation bias and the accountability gap. Middle: privacy misuse, explainability gap and prompt injection. Lowest: hallucinated terms, mitigated by retrieval." />
  <figcaption>Qualitative risk landscape from the assessment, not a measurement.</figcaption>
</figure>

**Verdict:** a plausible and defensible Responsible AI design, but responsible deployment is not
yet confirmed. That needs evidence only real use can give: fairness on real claims, live model
behaviour, and how carefully people actually review.

## What I learned

- **Human-in-the-loop is not human-in-control.** A workflow can guarantee a person signs off;
  only measurement (canaries, re-review) can show that the review is real.
- **Architecture beats filters.** The injection guard missed most external attacks, but limiting
  what the model is allowed to do, and checking its output, stopped every one.
- **Fairness fixes need evidence.** Removing a sensitive feature looked like a fix and wasn't;
  proxies carried the bias through.
- **Design the evaluation to fail.** Held-out data, hand-worked cases and external attacks found
  weaknesses that self-written tests would have missed.
