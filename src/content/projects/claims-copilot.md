---
title: "Claims Copilot: Generative AI for Motor Insurance"
date: 2026-06-01
status: completed
summary: "An audit-safe generative-AI copilot for motor insurance claims: schema-constrained extraction, policy-scoped hybrid retrieval and deterministic rule engines, with a human always making the decision."
tags: [genai, llm, insurance, responsible-ai]
stack: [] # TODO: add the tools you actually used
github: TODO # TODO: add the repo link (the Code button appears automatically)
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

*A detailed write-up (data, approach and results) is coming soon.*
