---
title: "Claims Copilot: Responsible Generative AI for Motor Insurance"
date: 2026-06-01
status: completed
summary: "An audit-safe generative-AI copilot for motor insurance claims: schema-constrained extraction, policy-scoped hybrid retrieval and deterministic rule engines, with a human always making the decision."
tags: [genai, llm, insurance, responsible-ai]
stack: [] # TODO: add the tools you actually used
github: TODO # TODO: create github.com/Chandana18G/motor-claims-copilot (prepared locally), then set this URL
highlights: ["Human-in-the-loop: AI never decides", "Hybrid BM25 + dense retrieval", "8-stage evaluation"]
featured: false
---

## Overview

M.Sc. group project. A generative-AI copilot that supports motor insurance claims handling
while keeping a human in charge: **the AI never makes the decision**.

- **Schema-constrained extraction** of claim details, and **policy-scoped hybrid retrieval**
  (BM25 + dense) so answers only draw on the relevant policy.
- **Deterministic rule engines** for the parts of the decision that must be exact.
- **Abstains** when the evidence conflicts, checks that every citation matches a real source
  span, and writes a **hash-chained audit log**.
- An **8-stage evaluation**, including prompt-injection and fairness tests.

## Responsible AI assessment

The project also asks whether the copilot should be trusted with a real claim, and under what
conditions. The assessment looks at the system through five ethical lenses (utilitarianism,
deontology, virtue ethics, the UDHR and Ubuntu), the EU AI Act and the GDPR, and a prioritised
risk analysis. All three routes reach the same conditional verdict.

- **Human-in-the-loop is not human-in-control.** The workflow guarantees that an adjuster can
  step in, but not that they exercise independent judgement. Seeing the AI's draft first anchors
  their view, and a low override rate looks the same whether the AI is accurate or nobody is
  checking any more.
- **Citation is not causation.** A rationale can cite a real policy clause without that clause
  being why the model reached its recommendation.
- **Fairness needs subgroup evidence.** The key metric is the fraud model's false-positive rate
  by subgroup, because averages can hide a group that gets flagged far more often.
- **Governance gap.** No existing function owns GenAI-specific risk, so the assessment proposes
  an AI Governance function, joint sign-off, one monitoring programme and a staged,
  evidence-gated rollout.

**Verdict:** a plausible and defensible Responsible AI design, but responsible deployment is not
yet confirmed until evidence, governance and monitoring requirements are demonstrated.

*A detailed write-up (data, approach and results) is coming soon.*
