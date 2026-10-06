---
title: "EMG Muscle Fatigue Classification"
date: 2026-04-01
status: completed
summary: "Surface-EMG signal processing and machine learning for subject-independent muscle-fatigue detection: 9,540 signal windows from 14 participants, with time- and frequency-domain features."
tags: [health-tech, signal-processing, machine-learning]
stack: [Python]
github: TODO # TODO: add the repo link (the Code button appears automatically)
highlights: ["9,540 windows, 14 participants", "Leave-one-subject-out validation", "Mean F1 0.416"]
featured: true
---

## Overview

M.Sc. project. Detecting muscle fatigue from surface EMG (sEMG) signals in a way that works for
people the model has never seen. The signals were cut into **9,540 windows from 14
participants**, and time- and frequency-domain features were extracted from each window.

Models were evaluated with **leave-one-subject-out** validation, so every test participant is
unseen during training. The mean F1 score was **0.416**. Performance varied a lot between
participants, and that variability is reported openly rather than averaged away.

*A detailed write-up (data, approach and results) is coming soon.*
