---
title: "NLP News Intelligence"
date: 2026-06-22
status: completed
summary: "Classical ML, Sentence-BERT embeddings and LDA compared on 127,600 AG News articles for classification, semantic search and topic discovery."
tags: [nlp, machine-learning, semantic-search]
stack: [Python, scikit-learn, sentence-transformers, gensim, spaCy, NLTK, pandas]
github: https://github.com/Chandana18G/nlp-news-intelligence
highlights: ["91.2% test accuracy", "P@5 0.844 semantic search", "Labels recovered by LDA"]
image: /images/projects/nlp-news-intelligence/trade-off.webp
imageAlt: "Two bar charts: TF-IDF models reach 90.9 to 91.2% classification accuracy against 88.6% for Sentence-BERT, while Sentence-BERT search reaches 84.4% precision at 5 against 77.6% for TF-IDF."
featured: true
order: 3
---

## Problem

Newer models aren't automatically better. I wanted to measure where classical NLP still wins and
where neural embeddings earn their cost, using one dataset and three tasks: **classifying** news
articles, **searching** them by meaning, and **discovering topics** without labels.

## Data

[AG News](https://huggingface.co/datasets/ag_news): 120,000 training and 7,600 test articles in
four balanced categories (World, Sports, Business, Sci/Tech).

## Approach

- **Classical:** TF-IDF features with Logistic Regression and a Linear SVM.
- **Neural:** Sentence-BERT embeddings with Logistic Regression for classification, and
  cosine-similarity retrieval for semantic search.
- **Unsupervised:** LDA with 4 topics, cross-tabulated against the true labels.
- One evaluation notebook compares all paradigms on the same held-out test set.

## Results

**Classification** (7,600 test articles)

| Model | Accuracy |
| --- | --- |
| **Linear SVM + TF-IDF** | **91.16%** |
| Logistic Regression + TF-IDF | 90.87% |
| Logistic Regression + SBERT | 88.58% |

<figure>
  <img src="/images/projects/nlp-news-intelligence/confusion-matrix.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Confusion matrix of the SVM over four categories, 1,900 articles each. Sports is 97.9% correct, World 90.7%, Sci/Tech 89.1%, Business 86.9%; the largest confusion is Business articles predicted as Sci/Tech (8.9%)." />
  <figcaption>Most errors are Business articles read as Sci/Tech (8.9%) and the reverse (7.3%); Sports is almost always right.</figcaption>
</figure>

**Semantic search** (Precision@5)

| Method | P@5 |
| --- | --- |
| **SBERT retrieval** | **0.844** |
| TF-IDF retrieval | 0.776 |

TF-IDF breaks on vocabulary mismatch. The query *"Apple launches AI chip"* pulls in Beatles
articles because of the word *Apple*. SBERT returns AMD, Intel and NVIDIA stories that share no
keywords with the query but match its meaning.

<figure>
  <img src="/images/projects/nlp-news-intelligence/trade-off.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two bar charts. Classification accuracy: LogReg plus TF-IDF 90.9%, SVM plus TF-IDF 91.2%, LogReg plus SBERT 88.6%. Semantic search precision at 5: TF-IDF 77.6%, SBERT 84.4%." />
  <figcaption>The trade-off: classical TF-IDF wins classification, Sentence-BERT wins search.</figcaption>
</figure>

**Topic modeling:** without seeing any labels, LDA recovered the four real categories
(e.g. *game, team, season* → Sports; *stock, oil, percent* → Business).

## What I learned

- **Match the method to the task.** TF-IDF won at classification because AG News categories are
  separable by keywords. SBERT won at retrieval, where meaning matters more than exact words. A
  hybrid system is justified.
- Comparing paradigms side by side surfaces trade-offs that a single-model project would miss.
