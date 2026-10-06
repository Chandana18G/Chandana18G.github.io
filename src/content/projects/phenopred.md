---
title: "PhenoPred: Genomic Trait Analytics"
date: 2026-07-01
status: completed
summary: "A genomic analytics pipeline for AncestryDNA and 23andMe exports, with format detection, normalisation, cross-platform concordance and a citation-backed SNP registry (dbSNP / ClinVar)."
tags: [health-tech, genomics, data-engineering]
stack: [Python, Streamlit]
github: TODO # TODO: add the repo link (the Code button appears automatically)
highlights: ["5 trait models incl. 6-SNP IrisPlex", "Says INSUFFICIENT_DATA, not guesses", "Unit + integration tests"]
featured: true
---

## Overview

M.Sc. project. A pipeline that reads raw DNA exports from **AncestryDNA** and **23andMe**,
detects the file format, normalises the data and checks concordance across the two platforms.
Every SNP it uses is backed by a citation in a registry built on **dbSNP** and **ClinVar**.

It includes five trait models, among them the 6-SNP **IrisPlex** eye-colour model. When a
required marker is missing, the model returns `INSUFFICIENT_DATA` and names the missing markers
instead of guessing. The pipeline has unit and integration tests and a Streamlit app.

*A detailed write-up (data, approach and results) is coming soon.*
