---
title: "MeetingBank NLP"
date: 2026-05-01
status: completed
summary: "An ETL and NLP pipeline over city-council meeting transcripts: named entities with spaCy, sentiment with DistilBERT and topics with LDA, stored in a hybrid PostgreSQL + MongoDB design."
tags: [nlp, data-engineering, sql]
stack: [Python, spaCy, DistilBERT, LDA, PostgreSQL, MongoDB, SQL]
github: TODO # TODO: add the repo link (the Code button appears automatically)
highlights: ["Hybrid PostgreSQL + MongoDB design", "SQL analyses per city"]
featured: false
---

## Overview

M.Sc. project. An ETL and NLP pipeline over the MeetingBank dataset of city-council meeting
transcripts. The pipeline extracts **named entities** with spaCy, scores **sentiment** with
DistilBERT and finds **topics** with LDA. Results go into a hybrid **PostgreSQL + MongoDB**
design, and SQL queries then compare sentiment, entities and topics across cities.

*A detailed write-up (data, approach and results) is coming soon.*
