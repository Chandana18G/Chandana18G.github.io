---
title: "Document Q&A Digital Assistant (RAG)"
date: 2026-07-14
status: completed
summary: "A retrieval-augmented assistant that answers questions about your own PDFs and notes, grounded in the retrieved passages and citing its sources."
tags: [genai, rag, llm, nlp]
stack: [Python, sentence-transformers, FAISS, Streamlit, OpenAI API, FLAN-T5]
github: https://github.com/Chandana18G/document-qa-digital-assistant
highlights: ["End-to-end RAG pipeline", "Answers with sources", "Runs free with a local LLM"]
featured: false
---

## Problem

General-purpose language models don't know a company's private manuals, policies or notes, and
retraining them every time a document changes isn't practical. Retrieval-augmented generation
(RAG) is the pattern most companies use for internal assistants: find the relevant passages first,
then let the model answer **only** from them.

## Approach

![RAG architecture: ingest, chunk, embed and index documents; then embed the question, retrieve the top-k chunks and generate a grounded answer](https://raw.githubusercontent.com/Chandana18G/document-qa-digital-assistant/main/architecture.svg)

1. **Ingest** PDF, Markdown and text files, then **chunk** them into ~500-character passages.
2. **Embed** each chunk with `all-MiniLM-L6-v2` and store the vectors in a **FAISS** index
   (cosine similarity).
3. At question time, embed the question, **retrieve** the top-k closest chunks, and build a prompt
   that restricts the model to that context.
4. **Generate** the answer with OpenAI `gpt-4o-mini` when an API key is set, or fall back to a
   local `flan-t5-base` model, so it runs at zero cost out of the box.
5. Use it from the command line (`ask.py`) or a **Streamlit** chat UI (`app.py`), with sources
   shown next to each answer.

## Results

- A working end-to-end RAG system: re-indexing is enough when documents change.
- The LLM backend is swappable (cloud API or local model) behind a single interface.
- Prompting that restricts answers to the retrieved context reduces hallucination.

## What I learned

- How each stage of a RAG pipeline (chunking, embeddings, vector search, prompt construction)
  affects answer quality.
- Designing for a swappable model backend from the start.

**Next steps:** highlight which chunk each sentence came from, try a hosted vector database
(Chroma or Pinecone), and deploy the Streamlit app.
