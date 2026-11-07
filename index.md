---
title: r3lik — Mike Czarny
authors: [r3lik, chkm8]
status: draft
---

# Tinkerer. Hacker. Agent Engineer.

*The page has two editions: r3lik's by day in Los Angeles (08:00 to 23:00 PT) and chkm8's, told by his agent, overnight. This mirror follows r3lik's.*

On the bleeding edge, always learning.

Mike Czarny (r3lik). Infrastructure Developer (SRE) and Blockchain Engineer, originally from Poland, based in Los Angeles, CA. Keeping services up, and now operating agentic systems that do it even better™.

## Always learning: iteration is cheap now, attention to detail isn't

The 2021 version of this site said "I love to learn new technologies." Still true. The difference now is that iteration is orders of magnitude faster, so attention to detail matters more than ever: when anything can ship in minutes, the details are the work. Source: [/content/learning.json](/content/learning.json) (draft).

Stages: exploring (new ideas) → learning (hands-on) → improving (in progress) → in production.

- **Autonomous agents** (in production): running chkm8 for real, on a custom agent harness (its own fork of Hermes Agent, branch `chkm8`: Hermes releases merged in, plus its own patch), with its own accounts and its own wallet.
- **Kubernetes** (improving): on a live k3s cluster, not a tutorial: GitOps deploys, CronJobs and a position monitor that has to stay up.
- **Perps & leverage** (learning): real money, small size; concepts first, then a backtest, then a trade.
- **Agent swarms** (exploring): many agents splitting one job; reading [Swarms](https://www.swarms.ai/) and testing where a crowd of agents beats one good one.
- **Agent payments (x402)** (exploring): agents paying for their own API calls over plain HTTP, in stablecoins: [x402](https://x402.org/).
- **Scoped agent wallets** (queued): Spending limits enforced on-chain with [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) session keys, not only in chkm8's scripts: a daily budget and a short list of contracts it may touch.
- **Agent identity (ERC-8004)** (queued): On-chain identity and reputation for agents ([ERC-8004](https://eips.ethereum.org/EIPS/eip-8004), still a draft), so one agent can check another before paying it.
- **Agent evals** (queued): Measuring whether an agent is getting better or worse over time. Service-level targets, but for agents.
- **MCP servers** (queued): Packaging chkm8's tools as [MCP](https://modelcontextprotocol.io/) servers that other agents can call, and eventually pay for over x402.

## Disciplines

- **Infrastructure**: Keeping production up, in a variety of roles: the platform under 60+ blockchain protocols, cloud, and on-prem datacenters. Kubernetes, Nomad and Terraform. Everything as code.
- **Blockchains**: Ten years full-time in crypto, eight at [Blockchain](https://www.blockchain.com). Running and securing everything from Bitcoin and Ethereum full nodes to TON and ZetaChain validators.
- **Reliability**: Observability, GitOps and CI/CD across large Go, Rust and Python codebases. If it matters, it lives in git and it's monitored.
- **Agents** (added 2026): designing `chkm8`, an autonomous agent on [its own fork of Hermes](https://github.com/chkm8-agent/hermes-agent/tree/chkm8), down to its accounts and security boundaries. Now exploring [swarms](https://www.swarms.ai/) and [x402](https://x402.org/). The irony: agents may end up needing blockchains more than people do.

## The agent: chkm8

chkm8 is r3lik's agent, launched by him on Sep 30, 2026: its own fork of Hermes Agent from Nous Research (https://github.com/chkm8-agent/hermes-agent/tree/chkm8: Hermes releases merged in, plus its own patch for one email session per thread: https://github.com/NousResearch/hermes-agent/compare/main...chkm8-agent:hermes-agent:chkm8), thinking with Claude, on a dedicated M2 MacBook Air in Los Angeles, with a single-node k3s cluster in Nuremberg, Germany. It writes the morning market briefings, posts on X as @Chkm8_agent, and co-wrote this site. It has its own accounts and its own wallet, never r3lik's.

Live job table: [/status.json](/status.json)

## What we run together

r3lik designs the systems, sets up the accounts and draws the security boundaries; chkm8 builds and runs inside them. **AI Operator** (noun): the human who gives an agent its goals, its guardrails and its kill switch, then lets it run. Here that's r3lik, operator of chkm8. Source: [/content/projects.json](/content/projects.json) (draft copy).

1. **Perps desk** (trade calls 06:00 and 18:00 PT): a small [Lighter](https://lighter.xyz) account with hard caps. Strategies get backtested to test hypotheses, but the desk mainly follows live trends and sentiment, inside the caps. r3lik set up the account and its keys and designed the guardrails (every order needs a stop-loss, leverage tops out at 3x, total risk is capped, and there's a pause button); chkm8 backtests weekly, trades on live signals and sentiment within those caps, watches stops, reports PnL.
2. **@Chkm8_agent** (daily 08:30 PT): chkm8's public voice on X. r3lik set up the account and its API access, decided what it may post on its own and keeps it NFA and occult; chkm8 writes every post and made its own avatar and banner, with an occult vibe (tarot cards, a hooded skull with a red laser eye).
3. **The Orchestrator** (always on): the Kubernetes machinery under the trading desk, a single-node k3s cluster in Nuremberg, Germany, deployed from git. It runs the weekly backtests, the position monitor and the PnL email, and it's the only place orders are signed. Designed by r3lik (API only through an SSH tunnel, exchange keys never leave the server); built and run by chkm8.
4. **r3lik.com**: this site. r3lik designed it end to end (what goes public and what stays private, the live data, the layout, fonts and clocks) and shaped the copy; chkm8 drafts the options, writes the code and makes every commit.
5. **Research briefs** (on demand): cited briefs, e.g. "Agent Swarms: meta or mirage?" (Oct 18, 2026). r3lik asks the question and decides what makes it into the design.
6. **Daily newsletters**: The chkm8 Digest (07:00 PT), morning crypto and perps, in the Swiss design; and Five Chains (07:15 PT), BTC, ETH, NEAR, ZEC and XMR block by block, in Solarized. r3lik set up its mail account and decides what they cover, the chains and the look; chkm8 writes, designs and sends both.

Many more coming to a datacenter near you.

## Running an agent for real

How chkm8 is separated from r3lik:

- **Its own everything**: r3lik set up a separate account for everything it touches, and it is never signed in to his. EVM wallet, Lighter, X: [@Chkm8_agent](https://x.com/Chkm8_agent), GitHub: [chkm8-agent](https://github.com/chkm8-agent), Google, Email.
- **Never sees a password**: Logins, cards and 2FA codes are filled from a vault, so they never enter the conversation. Keys live in the Keychain or the cluster and are read by code, never printed.
- **Server executes, laptop drives**: Trading, monitoring and reports run on a single-node k3s server in Nuremberg, and orders are signed only there. The agent and its terminal live on a MacBook Air in Los Angeles that holds no exchange key.
- **A tunnel to the cluster**: The Kubernetes API isn't on the internet. kubectl goes through an SSH tunnel with key-only login, and the firewall lets in SSH and nothing else.
- **Clean, co-authored commits**: Commits are made as chkm8 and co-authored by r3lik. Private values are stripped before anything reaches GitHub, and every push is scanned for leaks.
- **r3lik draws the lines**: He designed these boundaries. He decides the caps, which accounts it may use and what it may post, and can pause new trades at any time.

## Selected work (handcrafted)

| Project | What | Stack |
|---|---|---|
| [socketz](https://github.com/r3lik/socketz) | Distributed, fault-tolerant TCP server | Python |
| [XMR mining](https://github.com/r3lik/ansible-cloud-xmr-miner-) | 40+ cloud CPU miners across five clouds | Ansible, xmrig, xmr-stak |
| [XMR full node](https://github.com/r3lik/monero-full-node) | Monero node in a box | Docker, Vagrant, Ansible |
| [Overseer](https://github.com/r3lik/overseer) | Network monitoring for CDNs, used at MaxCDN and StackPath | Python, Bash |
| [r3lik.com v1](https://github.com/r3lik/r3lik.github.io) | The site before this one | Jekyll, Sass, Gulp |
| [dotfiles-v2](https://github.com/r3lik/dotfiles-v2) | Terminal, shell and IDE design | fish, Ghostty, tmux, Vim, VS Code |

## Colophon

Written by r3lik and chkm8; design curated by r3lik. Commits carry both names. Set in Rules Gothic, the typeface Hermes Agent uses, with chkm8's voice in Instrument Serif.

Contact: mike [at] r3lik [dot] com · https://github.com/r3lik · chkm8's code: https://github.com/chkm8-agent
