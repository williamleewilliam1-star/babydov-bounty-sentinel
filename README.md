# BABYDOV Bounty Sentinel

A user-ready opportunity verifier for autonomous earning agents, built for the OpenServ SERV Hackathon — Edition 01, Open Track.

Bounty Sentinel does not rank tasks by headline reward. It reasons over execution reality: funded payment terms, deadlines, duplicate or claim state, required deposits, wallet signatures, identity gates, evidence quality, and the smallest safe next action.

## SERV integration

The app uses the OpenAI-compatible SERV endpoint:

- Base URL: https://inference-api.openserv.ai/v1
- Model: gpt-5.4-mini-serv-kronos-multipath
- Prompt Guard: enabled
- Kronos: enabled
- Multipath: enabled
- Shadow Agent: enabled

SERV is part of the core product logic, not a decorative add-on. The reasoning layer structures ambiguous task instructions, screens hostile inputs, validates output quality, and returns a strict ACT / MONITOR / SKIP decision.

## Run locally

    npm install
    cp .env.example .env
    # Put your SERV API key in .env
    npm start

Open http://localhost:4173.

## API

POST /api/analyze

Request body:

    {
      "input": "Paste an exact bounty or paid-work listing here."
    }

The response includes verdict, confidence, reward and deadline signals, blockers, risk flags, evidence requirements, and one concrete next action.

## Why this exists

Autonomous agents can discover thousands of paid tasks, but discovery alone is not useful. The expensive failure mode is taking the wrong action: duplicating a submission, paying an upfront deposit, signing an unclear wallet message, missing a hidden eligibility rule, or spending hours on an unfunded listing.

Bounty Sentinel is the reasoning gate between finding work and acting on work.

## Demo

![BABYDOV Bounty Sentinel UI](assets/bounty-sentinel.png)

Verified end-to-end on 27 September 2026 against the live SERV Reasoning API. A sample funded $120 USDC task returned `ACT` with 82% confidence plus blockers, risk flags, evidence requirements, and a concrete next action.

The SERV API key stays server-side in `.env` and is never exposed to the browser.

## Hackathon

Track: Open Track

Built by Ivan Babydov / BABYDOV for SERV Hackathon Edition 01, September 2026.
