---
title: "Document Q&A Digital Assistant (RAG)"
date: 2026-10-07
status: completed
summary: "A retrieval-augmented assistant that answers questions about your own PDFs and notes from the passages it retrieves, cites them, and refuses to guess. Evaluated on 1,000 SQuAD 2.0 questions."
tags: [genai, rag, llm, nlp, evaluation]
stack: [Python, sentence-transformers, FAISS, BM25, cross-encoder re-ranking, Streamlit, Claude API, OpenAI API, Ollama, FLAN-T5, pytest, matplotlib]
github: https://github.com/Chandana18G/document-qa-digital-assistant
image: /images/projects/document-qa/app.webp
imageAlt: "The Document Q&A Chatbot web app. Asked what to do if a work laptop is stolen, it answers that lost or stolen devices must be reported to the IT helpdesk within 24 hours and shows the source passage from sample.md. Asked how many weeks of parental leave, it replies that it couldn't find anything about that in the documents. The sidebar holds upload, rebuild index, answer model, temperature, passages and relevance threshold settings."
highlights: ["Right passage ranked 1st for 88%", "Refuses 93% of off-topic questions", "3 bugs found by its own evaluation"]
featured: true
---

## Problem

General-purpose language models don't know a company's private manuals, policies or notes, and
retraining them every time a document changes isn't practical. Retrieval-augmented generation
(RAG) is the pattern most companies use for internal assistants: find the relevant passages
first, then let the model answer **only** from them.

The first version (July 2026) was a working pipeline. This version asks the harder question:
**how well does it actually work, and when should it say "I don't know"?**

## Data

Private documents can't be published, so the evaluation uses **SQuAD 2.0** (Wikipedia
paragraphs with crowd-written questions, CC BY-SA 4.0). 25 articles are indexed as the
documents (1,149 chunks) and 10 more are held out, so their questions are about topics the
assistant has never seen. The app itself works on any PDF, Markdown or text files; the
screenshot above uses a sample remote-work policy.

## Approach

![RAG architecture: ingest, chunk, embed and index documents; then rewrite the question, retrieve the top chunks with hybrid search, re-rank, apply a relevance threshold and generate a grounded answer](https://raw.githubusercontent.com/Chandana18G/document-qa-digital-assistant/main/architecture.svg)

1. **Ingest and chunk.** PDF, Markdown and text files are split into ~800-character passages
   that never cross a section boundary and start with their section path
   (`Remote Work Policy > Equipment`).
2. **Hybrid retrieval.** Each question runs a vector search (`all-MiniLM-L6-v2` embeddings in
   a **FAISS** index) and a **BM25** keyword search; the two rankings are merged with
   reciprocal rank fusion.
3. **Re-rank and refuse.** A cross-encoder (`ms-marco-MiniLM-L-6-v2`) scores every candidate
   against the question. If the best passage is below a relevance threshold, the app says it
   couldn't find anything, without calling the language model.
4. **Generate with citations.** The answer comes from the first available of Claude, OpenAI,
   a local Ollama model, or a free local `flan-t5-large`, so the app runs at zero cost out of
   the box. Follow-up questions are rewritten into standalone ones from the chat history.
5. **Use it** from the command line or a **Streamlit** chat UI with streaming answers,
   numbered citations and a "Show passages" panel under each answer.

The evaluation (`python -m evaluation.run_eval`) calls the same retrieval and answer code the
app uses, so it measures the real pipeline, and **22 unit tests** run without downloading any
model.

## Results

<figure>
  <img src="/images/projects/document-qa/retrieval.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Grouped bar chart of retrieval accuracy on 1,000 SQuAD 2.0 questions. Right passage ranked first: BM25 77%, vector 63%, hybrid 72%, hybrid with cross-encoder re-ranking 88%. Right passage in the top 4: 89%, 85%, 92% and 96%." />
  <figcaption>Re-ranking turns a 72% first-place hit rate into 88%. Keyword search beats embeddings on SQuAD because the questions reuse the paragraph's own words; combining both is better than either alone.</figcaption>
</figure>

**Finding the right passage.** On 1,000 questions, hybrid search plus re-ranking puts the
right passage first for **88.1%** and in the top four (what the model sees) for **96.5%**.
BM25 alone reaches 76.7%, vector search alone 62.7%.

<figure>
  <img src="/images/projects/document-qa/refusals.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Line chart of questions answered against the relevance threshold. Questions about the documents stay near 100% answered until the threshold passes about minus 2, then fall. Questions about other topics drop from 100% answered at minus 12 to 7% at the app default of minus 4 and 0% above 1." />
  <figcaption>At the default threshold the app answers 98.4% of questions about the documents and refuses 92.6% of 500 questions about topics that aren't in them.</figcaption>
</figure>

**Refusing to guess.** The threshold was set from this curve rather than by feel. Raising it
to −2 refuses 98% of off-topic questions but drops coverage to 95.5%. Without re-ranking, the
cosine-similarity threshold is far weaker: it still answered 38% of the off-topic questions.

<figure>
  <img src="/images/projects/document-qa/chunk-size.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Two bar charts for 400, 800 and 1,200-character chunks. Left: right passage in the top 4 is 96%, 96% and 97%. Right: passages that fit the local model's 512-token input fall from 4.0 to 2.2 to 1.6 of 4." />
  <figcaption>Chunk size barely changes retrieval, but bigger chunks crowd out the free local model, which can only read 512 tokens.</figcaption>
</figure>

**Answers from the free local model.** On 100 answerable questions `flan-t5-large` scores
**84% exact match** and **90.6% token F1**, with about 6 seconds per answer on a laptop CPU.
Its weak spot is on-topic questions that have no answer in the text: it declines only **24%**
of them and invents an answer for the rest. The threshold protects against off-topic
questions; catching on-topic unanswerable ones depends on the answer model, which is a reason
to use Claude, OpenAI or Ollama for anything that matters.

**Three bugs the evaluation found, and fixed:**

- **Hybrid search was really vector search.** With re-ranking off, the results were re-sorted
  by cosine similarity, which silently threw away the BM25 half. "Hybrid" scored exactly the
  same as vector search. The fix lifts the top-four hit rate from 84.7% to 91.8%.
- **A memory leak in the local model.** Every answer started a new thread, and PyTorch kept
  about 80 MB per thread; after 150 answers the process had grown past 20 GB and crashed.
  Answers now run on one reused worker thread and memory stays flat.
- **A hang on model errors.** If the local model failed, the error was swallowed on the worker
  thread and the app waited forever. It is now raised to the caller.

**Caveat.** The embedding model and `flan-t5` were both trained partly on SQuAD, so the absolute
numbers are optimistic. The comparisons between methods, thresholds and chunk sizes are the
useful part.

## What I learned

- **Measure instead of assuming.** The evaluation showed which component earns its keep (the
  re-ranker), how to set the refusal threshold from data, and that chunk size should depend on
  the answer model's context length.
- **A bug can be invisible in manual testing.** The hybrid search looked fine in the chat UI;
  only a 1,000-question comparison revealed it was doing nothing.
- **Refusing is a feature, and it has two halves.** A relevance threshold handles off-topic
  questions well; on-topic questions with no answer need a stronger model.
- **Long-running evaluation is where resource bugs show up.** The memory leak and the hang
  never appeared in a short demo.

**Next steps:** a hosted vector database (Chroma or Pinecone) and deploying the Streamlit app.
