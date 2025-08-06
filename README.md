# 🔍 Solana Token Analyzer

Solana Token Analyzer: metadata, market metrics, RugCheck risk, and “pump probability” (ML).  
Works **out of the box without API keys** (demo/mock mode), and switches to production mode when keys are provided.

---

## ⚡️ Features

- **Token Metadata**: `name / symbol / description / image / socials`.
- **Market (Birdeye)**: `price / liquidity / volume24h`.
- **RugCheck**: status and risk details.
- **ML Scoring**: “pump probability” with a short explanation.
- **Demo Mode Without Keys**: all APIs return realistic **mocks** (`HTTP 200`).
- **Robust UX**: all errors are gracefully handled and converted into user-friendly messages — the UI never breaks.

---

## 🧱 Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript (no Tailwind; plain CSS/inline styles).
- **Server/API**: Next API Routes.
- **On-chain / Data Sources**:
  - **Helius** `getTokenMetadata` (RPC, `includeOffChain: true`).
  - **Birdeye** `token_overview` (requires `x-chain: solana` header).
- **Rug Analysis**: RugCheck  
  1) Preferred: `X-API-KEY → POST /bulk/tokens/summary`  
  2) Fallback: `Bearer JWT → GET /v1/tokens/{mint}`  
  3) Otherwise — mock data.
- **ML**: separate **FastAPI** service `POST /score` (heuristic-based for now).
