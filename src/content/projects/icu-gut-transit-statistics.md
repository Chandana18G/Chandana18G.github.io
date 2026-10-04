---
title: "Gut Transit in ICU Trauma Patients (Biostatistics)"
date: 2026-03-09
status: completed
summary: "A statistical replication of Rauch et al. (2012): do ventilated trauma patients digest more slowly? SmartPill capsule data from 8 ICU patients and 87 healthy volunteers, re-analysed in JASP and Python."
tags: [health-tech, statistics, hypothesis-testing]
stack: [Python, pandas, SciPy, statsmodels, matplotlib, seaborn, JASP]
github: https://github.com/Chandana18G/rauch2012-statistical-replication
image: /images/projects/icu-gut-transit-statistics/cover.webp
imageAlt: "Box plots on a log scale comparing critically ill patients and healthy volunteers. Median gastric emptying is 13.9 vs 3.0 hours, small-bowel transit 6.7 vs 3.8 hours and whole-gut transit 240 vs 28.5 hours; all three differences are significant."
highlights: ["Gastric emptying 4.5× slower", "Mann–Whitney p < .001", "Pearson vs Spearman flips a result"]
featured: false
---

## Problem

M.Sc. project for the *Statistics & Machine Learning* module (SRH University, winter term
2025/26). Critically ill patients often can't tolerate tube feeding, and slow gut motility is a
suspected cause. The goal was to replicate the statistics of a published clinical study:
**do mechanically ventilated trauma patients have slower gastric emptying and small-bowel
transit than healthy people?**

## Data

The public *Smart Pill* dataset from Rauch et al. (2012, *Journal of Critical Care*): **95
participants and 22 variables**. **8** critically ill trauma patients and **87** healthy
volunteers each swallowed a wireless capsule that records pH, pressure and temperature on
its way through the gut. The outcomes are gastric emptying (GE), small-bowel (SB) and whole-gut
transit times in hours.

Before comparing transit times, I checked that the two groups are comparable. They don't differ
significantly in gender, age, height or weight.

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/baseline.webp" width="1477" height="1193" loading="lazy" decoding="async" alt="Four panels comparing the groups at baseline. Gender: 75% male among patients vs 55% among volunteers, chi-square p = .279. Box plots of age, height and weight overlap, with t-test p-values of .508, .252 and .578." />
  <figcaption>Baseline balance: no significant differences in gender, age, height or weight.</figcaption>
</figure>

## Approach

- Classified the variables (nominal, ratio, interval, count) to choose suitable tests.
- **Baseline balance:** *t*-tests and Mann–Whitney *U* for age, height and weight; χ² and
  Fisher's exact test for gender.
- **Primary outcomes:** Shapiro–Wilk normality checks, then Welch's *t*-test vs Mann–Whitney *U*,
  with a Bonferroni-corrected α = 0.025 for the two primary outcomes and rank-biserial effect sizes.
- **Odds ratio** for delayed gastric emptying (Haldane–Anscombe correction for a zero cell),
  one-way **ANOVA** and Kruskal–Wallis by gender and race.
- **Distribution fitting** (Normal, Exponential, Gamma, Log-normal) with Kolmogorov–Smirnov tests.
- **Pearson vs Spearman correlation**, and a **multiple regression** for SB time with
  heteroscedasticity-robust (HC3) standard errors.
- Did the analysis first in JASP, then rebuilt it as a reproducible Python notebook.

The transit times are strongly right-skewed and fail the normality test, which is why the main
comparison uses the rank-based Mann–Whitney test, not a *t*-test.

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/distributions.webp" width="1474" height="1150" loading="lazy" decoding="async" alt="Histograms of gastric emptying and small-bowel transit time for each group. Both are right-skewed; Shapiro–Wilk rejects normality for gastric emptying in both groups and for small-bowel transit in healthy volunteers." />
  <figcaption>Right-skewed transit times: Shapiro–Wilk rejects normality, so non-parametric tests are used.</figcaption>
</figure>

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/distribution-fit.webp" width="1474" height="811" loading="lazy" decoding="async" alt="Left: histogram of healthy volunteers' gastric emptying with four fitted curves; the normal is rejected (KS p < .001) and the log-normal fits best (KS p = .428). Right: Q–Q plot against the log-normal, close to the diagonal except for three long values." />
  <figcaption>Distribution fitting for healthy volunteers: the normal is rejected, the log-normal fits best.</figcaption>
</figure>

## Results

| Outcome | Critically ill (median) | Healthy (median) | Mann–Whitney *p* |
| --- | --- | --- | --- |
| Gastric emptying | **13.9 h** | 3.0 h | < .001 |
| Small-bowel transit | **6.7 h** | 3.8 h | .010 |
| Whole-gut transit | **240 h** | 28.5 h | < .001 |

- All 7 patients with a measurement had delayed gastric emptying (OR = 15.4, 95% CI 0.9–277).
- Welch's *t*-test **missed** the gastric-emptying difference (*p* = .076) because a few extreme
  values inflate the variance. The rank-based test found it clearly.
- Gender has no effect on gastric emptying (ANOVA *p* = .40). The difference comes from the group.

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/ge-by-gender.webp" width="1474" height="833" loading="lazy" decoding="async" alt="Box plots of gastric emptying by gender, split by group, on a log scale. Within both men and women, the critically ill patients take far longer than the volunteers. ANOVA for gender p = .402." />
  <figcaption>Within each gender, patients are much slower than volunteers: group, not gender, drives the difference.</figcaption>
</figure>

**Pearson vs Spearman changes the conclusion.** Pooled over both groups, the Pearson
correlation between GE and SB time is *r* = 0.57, but Spearman's ρ is only 0.04. In healthy
volunteers there is no relationship at all. The apparent link comes from a few patients who are
extreme on both variables.

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/correlations.webp" width="1474" height="793" loading="lazy" decoding="async" alt="Two correlation heatmaps for age, height, weight and the three transit times. Pearson shows GE–SB 0.56 and GE–WG 0.73; Spearman shows GE–SB 0.04 and GE–WG 0.40." />
  <figcaption>Pearson (left) vs Spearman (right): the strong GE–SB correlation disappears with ranks.</figcaption>
</figure>

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/ge-vs-sb.webp" width="1474" height="791" loading="lazy" decoding="async" alt="Scatter plots of small-bowel vs gastric emptying time. Healthy volunteers (n = 83): no relationship, r = 0.13, p = .258. Critically ill (n = 7): r = 0.80, p = .030, driven by two patients with very long gastric emptying." />
  <figcaption>Within the healthy group, GE and SB time are unrelated. The patient trend rests on 7 points.</figcaption>
</figure>

The multiple regression tells the same story. GE time looks like a strong predictor of SB time
(*p* < .001), but with robust standard errors the effect is no longer significant (*p* = .125).

<figure>
  <img src="/images/projects/icu-gut-transit-statistics/regression.webp" width="1476" height="710" loading="lazy" decoding="async" alt="Coefficient plot for SB time regressed on GE time, age, weight and group, R² = 0.33. Only GE time has a confidence interval above zero (OLS p < .001), but its robust p-value is .125. Age, weight and group are not significant." />
  <figcaption>Regression coefficients with 95% CIs. GE time is significant with ordinary but not robust (HC3) errors.</figcaption>
</figure>

## What I learned

- **Check the assumptions before choosing a test.** With skewed data and tiny groups, the
  "standard" *t*-test gives the wrong answer.
- **Robust methods can change the conclusion,** not just the decimals. Reporting both versions is
  more honest than reporting only the one that looks best.
- A significant result from 8 patients is still a pilot result. Confidence intervals show that
  better than *p*-values do.
