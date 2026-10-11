---
title: "EMG Muscle Fatigue Classification"
date: 2026-06-02
status: completed
summary: "Can surface EMG detect muscle fatigue in someone the model has never seen? 9,540 signal windows from 14 people, leave-one-subject-out testing, and an honest answer: not yet."
tags: [health-tech, signal-processing, machine-learning]
stack: [Python, SciPy, scikit-learn, pandas, matplotlib, SpikerTools]
github: https://github.com/Chandana18G/emg-muscle-fatigue-classification
image: /images/projects/emg-muscle-fatigue-classification/per-subject-f1.webp
imageAlt: "Bar chart of leave-one-subject-out F1 for 14 anonymised subjects, ranging from 0.19 to 0.77 with a mean of 0.416. A red marker per subject shows the score of always predicting fatigue, around 0.55 to 0.69; the model beats it for only one subject."
highlights: ["9,540 windows, 14 subjects", "Leave-one-subject-out", "Mean F1 0.416 vs baseline 0.625"]
featured: true
order: 8
---

## Problem

Muscle fatigue changes the electrical signal a muscle produces, which surface EMG can measure.
A fatigue detector is only useful if it works for **new people** without recalibration. This
M.Sc. project (AI Discovery course) asks whether that is possible with simple, explainable
signal features.

## Data

**154 recordings from 14 people**, each about 60 s at 5 kHz, in a fatigue and a non-fatigue
condition. Subjects are anonymised as S01–S14, and the recordings are not published.

## Approach

1. **Filtering**: 20–450 Hz band-pass, rectification and a 50 ms RMS envelope.
2. **Activity detection**: an adaptive threshold finds **1,022 muscle bursts**.
3. **Windowing**: 250 ms windows with 50% overlap → **9,540 windows** (4,335 fatigue, 5,205
   non-fatigue).
4. **Features**: 10 per window, in the time domain (RMS, MAV, waveform length, zero crossings,
   slope sign changes) and frequency domain (mean and median frequency, spectral entropy).
5. **Evaluation**: **leave-one-subject-out**, so the model is always tested on a person it has
   never seen, with scaling fitted inside each fold. Logistic regression and random forest.

## Results

**At group level the features differ.** Amplitude features are about 19% lower in the fatigue
recordings and median frequency is 2% higher (all 10 features: Mann-Whitney p < 10⁻⁹). That is
the opposite of the textbook fatigue pattern, which points to the recording protocol rather
than physiology.

**For an unseen person, the classifier does not beat a trivial baseline.**

| Model (leave-one-subject-out) | Accuracy | F1 (fatigue) |
|---|---|---|
| Logistic regression | 0.465 | 0.460 |
| Random forest | 0.540 | 0.416 ± 0.161 |
| Always predict "non-fatigue" | 0.544 | 0 |
| Always predict "fatigue" | 0.456 | 0.625 |

<figure>
  <img src="/images/projects/emg-muscle-fatigue-classification/per-subject-f1.webp" width="1650" height="780" loading="lazy" decoding="async" alt="Bar chart of leave-one-subject-out F1 for 14 anonymised subjects, ranging from 0.19 to 0.77 with a mean of 0.416. A red marker per subject shows the score of always predicting fatigue, around 0.55 to 0.69; the model beats it for only one subject." />
  <figcaption>Per-subject F1 ranges from 0.19 to 0.77, and the model beats "always fatigue" for 1 of 14 people.</figcaption>
</figure>

The differences between people are larger than the fatigue effect, so a model trained on 13
people does not transfer to the 14th.

## What I learned

- **Compare against a trivial baseline before reporting a score.** On its own, an F1 of 0.416
  sounds like a weak model. Next to 0.625 for "always fatigue", it is clearly no model at all.
- **Validation design decides the answer.** Splitting windows at random would put the same
  person in training and test data, so the model could recognise people rather than fatigue.
  Leaving whole subjects out tests what matters.
- **Check the labels against physiology.** The features moved in the opposite direction to
  known fatigue effects, so the next step is a protocol that reliably induces fatigue, and
  normalising each person's features against their own rested baseline.
