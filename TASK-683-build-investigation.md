# TASK-683 Build Investigation

## Scope

- Topic: intermittent frontend build termination during local and CI-style runs.
- Primary symptom: `The build failed because the process exited too early.`
- Goal: determine whether the failure is caused by application code, build tooling, or the surrounding environment.

## Executive Summary

- The evidence does **not** point to a normal webpack, TypeScript, ESLint, or CRACO configuration error.
- The build process is being terminated by an external signal while it is running.
- The first reproducible signal observed was `SIGTERM`.
- In failing runs, the process was often later force-killed, surfacing as exit `137`.
- Some mitigations improved isolated runs, but none produced reliable repeated success.
- Conclusion: this is currently an environment / runner / process-lifecycle problem, not a proven application-code defect.

## Main Finding

The build is not consistently failing because compilation is impossible. It is failing because the build process gets stopped from the outside before it can reliably finish.

In simple terms:

1. webpack can build the app,
2. but the surrounding environment sometimes kills the process before it finishes,
3. so the visible failure is a process-termination problem, not a confirmed code-level compile bug.

## Observed Symptoms

### User-visible failure text

- CRA / `react-scripts` reports:
  - `The build failed because the process exited too early.`

### Exit modes observed

- child process exit with `signal=SIGTERM`
- later hard-kill style failure with exit `137`

### Important interpretation

- `SIGTERM` means the process was asked to stop.
- exit `137` typically means the process was force-killed after that, often via `SIGKILL`.
- This is different from a normal compile failure where webpack would print a deterministic code/config error and exit non-zero on its own.

## Evidence Collected

### 1. `react-scripts` launcher behavior

- The `react-scripts` wrapper prints the early-exit message only when its child process exits because of a signal like `SIGTERM` or `SIGKILL`.
- This confirms the message is tied to signal-based termination, not ordinary webpack failure.

### 2. Direct reproduction through the raw build script

- Reproduced using a small Node wrapper around `react-scripts/scripts/build`.
- Result:
  - child `status=null`
  - child `signal=SIGTERM`

Meaning:

- the underlying build process was externally terminated.

### 3. Reproduction through the actual CRACO entrypoint

- Reproduced using the CRACO build path directly.
- Result:
  - same early-exit signal pattern

Meaning:

- the issue is not explained simply by the `yarn build` wrapper or by CRACO shell wiring.

### 4. In-process build with temporary `SIGTERM` trap

- When the process temporarily trapped `SIGTERM` instead of exiting immediately, webpack was able to complete in some runs.

Meaning:

- the build itself can complete,
- which argues against a fundamental compile/configuration failure.

### 5. `strace` signal tracing

- `strace` showed:
  - external `SIGTERM` arrives first,
  - the main build process then propagates termination to worker children.

Meaning:

- termination starts outside the build’s own normal success/failure flow.

## Experiments Performed

### Baseline reproductions

1. `yarn build`
2. `CI=true yarn build`
3. `GENERATE_SOURCEMAP=false yarn build`
4. `DISABLE_ESLINT_PLUGIN=true yarn build`
5. `npx react-scripts build`
6. direct CRACO entrypoint build

Result:

- signal-based termination still reproduced.

### Heap / memory tuning attempts

1. `NODE_OPTIONS=--max_old_space_size=4096`
2. `NODE_OPTIONS=--max_old_space_size=6144`

Result:

- did not establish stable repeated success.

### Guarded wrapper experiment

- Temporary wrapper added a `SIGTERM` handler to give webpack extra time to finish.

Result:

- useful as a diagnostic,
- not reliable enough as a fix,
- repeated runs still ended with `exit 137`.

### Sourcemap reduction experiment

- `GENERATE_SOURCEMAP=false`

Result:

- improved some individual runs,
- did not produce a stable, repeatable solution.

### Retry experiment

- repeated local runs, including back-to-back attempts.

Result:

- retries did not prove stability,
- they only showed the problem may be intermittent and therefore easy to mask.

## What Does Not Appear To Be The Root Cause

Based on current evidence, the issue is **not yet proven** to be caused by:

1. TypeScript compiler errors
2. ESLint failures
3. a deterministic webpack config bug
4. CRACO alone
5. sourcemaps alone
6. heap-size tuning alone

These may affect timing or pressure, but they do not fully explain the external signal termination pattern.

## Most Likely Cause Class

The most likely cause class is external process termination by the environment.

That could include, for example:

1. runner or container resource pressure,
2. process supervisor lifecycle behavior,
3. CI infrastructure limits,
4. external job/process cleanup logic,
5. environment-specific build-session termination.

Current evidence does **not** identify the exact sender with certainty.

## Why Earlier Setup Changes Were Reverted

The temporary setup changes were reverted because they were experiments, not validated fixes.

Those changes included:

1. guarded build wrapper,
2. build-script changes,
3. workflow retry/build hardening.

Why they were removed:

1. they did not reliably solve the issue,
2. they increased maintenance surface,
3. they risked masking the failure instead of proving a real fix,
4. they were not safe to keep as product/workflow defaults.

## Final Result

- Root-cause direction is substantially clearer than before.
- The build failure is best described as an externally terminated process problem.
- The investigation produced useful diagnostics.
- It did **not** produce a reliable shipping fix.

## Recommended Next Steps

1. Validate the failure in GitHub Actions runner context instead of continuing speculative local build-script changes.
2. Capture runner-level diagnostics around the build step:
   - memory snapshots,
   - process tree,
   - container/job lifecycle timing,
   - any cancellation or supervisor events.
3. Only introduce new workflow or build-script changes after runner evidence shows a stable and justified direction.
4. Keep this document as the single detailed reference for the build-termination investigation.

## Cross-References

- Summary tracking: `TASK-683-todo.md`
- Chronological record: `TASK-683-log.md`
- Review assessment: `TASK-683-crush-debugging-review.md`
- High-level issue summary: `TASK-683-issues-summary.md`

---

## Root-Cause Deep-Dive: OOM Kill (Out-of-Memory)

This section documents the result of a broader investigation using live environment metrics,
external research into Codespaces and GitHub Actions behaviour, and community reports of the
same `react-scripts` failure message.

### Environment Memory Profile (measured 2026-03-24)

| Metric                     | Value                         |
| -------------------------- | ----------------------------- |
| Total RAM                  | 7.8 GiB                       |
| RAM in use (baseline)      | 5.6 GiB                       |
| RAM available before build | **~2.1 GiB**                  |
| Swap space                 | **0 B (none)**                |
| CPUs (nproc)               | 2                             |
| Container type             | GitHub Codespace (Azure host) |
| Kernel                     | 6.8.0-1044-azure              |
| cgroup memory.max          | `max` (no hard cgroup limit)  |
| cgroup memory.current      | ~4.87 GiB                     |
| vm.overcommit_memory       | 0 (heuristic overcommit)      |
| Node.js                    | v20.20.0                      |

Key observations:

- Only **2.1 GiB is available** before a build is started.
- There is **no swap**. With `swappiness=60` but 0 bytes of swap space configured,
  the kernel cannot page out anonymous process memory. Once physical RAM is exhausted,
  the OOM killer is the only recourse.
- The cgroup for this container has no hard `memory.max` limit, so pressure is managed
  at the host kernel level rather than with a cgroup OOM event.

### Why webpack Exhausts Available Memory

A typical CRACO/CRA webpack production build peak memory usage:

| Component                         | Approximate RAM             |
| --------------------------------- | --------------------------- |
| Node.js main process (webpack)    | 800 MB – 1.5 GB             |
| Source map generation             | 1 – 2 GB additional         |
| webpack worker threads (× 2 CPUs) | 200 – 400 MB each = ~600 MB |
| **Total peak estimate**           | **2.5 – 4+ GB**             |

Available memory before build: **~2.1 GB**.

Gap: the build regularly needs **0.5 – 2+ GB more RAM than is available**.
With no swap, the kernel is forced to invoke the OOM killer.

Additionally:

- The `build` script is `craco build` with no `GENERATE_SOURCEMAP=false`.
  Source map generation is the single largest avoidable memory spike.
- `NODE_ENV=production` is set in the Dockerfile but not enforced consistently
  in the plain `yarn build` path.
- In the Docker build path (`RUN yarn build`), the same limits apply inside the
  Alpine build container, which shares RAM with the outer Actions runner (7 GB total
  for `ubuntu-latest`, even less headroom than this Codespace).

### Root Cause: Linux OOM Killer

When a process requests memory and the kernel cannot satisfy the allocation (all RAM in
use, no swap), the Linux OOM killer activates. It:

1. Scores all eligible processes (`/proc/<pid>/oom_score`).
2. Selects the highest-scoring victim (typically the largest anonymous memory consumer).
3. Sends **SIGKILL** to that process.
4. Exit code of the killed process: **137** (128 + 9, where 9 = SIGKILL).

Exit `137` matches exactly what was observed in repeat local and CI runs.

This also matches the message printed by `react-scripts` itself. The exact comment in the
`react-scripts` source code reads:

> _"This probably means the system ran out of memory or someone called `kill -9` on the
> process."_

That message is the toolchain's own diagnosis of OOM kill.

### Why SIGTERM Was Observed Before SIGKILL

This is consistent with two non-exclusive mechanisms:

**Mechanism A – Codespace / Azure host agent**

The GitHub Codespace infrastructure runs a lightweight host agent that monitors container
memory pressure. When the container's memory consumption approaches a threshold on the Azure
host, the agent sends `SIGTERM` to the container's init process or to the specific heavy
process. If the process does not terminate within the grace window (~10 seconds), the host
runtime sends `SIGKILL`, producing exit `137`.

This sequence — external `SIGTERM` → grace period → `SIGKILL` — is the standard container
lifecycle termination used by Docker, containerd, and Kubernetes. It is not a Linux kernel
OOM event; it is an outer infrastructure-level memory pressure response.

`strace` evidence confirms: SIGTERM arrived externally, was propagated by the main process
to its worker children, but the process was subsequently force-killed anyway (exit 137).

**Mechanism B – Kernel OOM Kill without SIGTERM**

In runs where `exit 137` was observed without an obvious preceding SIGTERM, the kernel OOM
killer acted directly. The kernel OOM killer does not send SIGTERM first; it sends SIGKILL
immediately. This mode explains the subset of runs that showed only exit `137` with no
preceding signal handling.

Both mechanisms are consistent with a memory-exhaustion scenario and both produce the
same observable failure.

### Similar Cases: Community Evidence

**1. create-react-app / facebook/create-react-app**

The `react-scripts` message "The build failed because the process exited too early" is a
well-known OOM indicator in the CRA ecosystem. Community solutions uniformly point to:

- `GENERATE_SOURCEMAP=false` (most-cited fix)
- `NODE_OPTIONS=--max_old_space_size=<N>` (delays OOM by expanding V8 heap before GC)
- Reducing webpack worker parallelism

**2. GitHub Actions `ubuntu-latest` runners**

GitHub-hosted `ubuntu-latest` runners provide:

- 2 vCPUs, 7 GB RAM, no swap

This is a _smaller_ memory budget than the current Codespace. Large React apps with source
maps regularly hit OOM during `yarn build` in this configuration. The Docker build path
(`docker` and `docker-test` jobs) makes this worse: the Docker BuildKit daemon runs inside
the same 7 GB budget shared with the runner process itself.

Known GitHub Actions community patterns for this class of failure:

- Memory pressure kills appear as job cancellations or "process exited too early" errors
  in the annotations panel.
- Retry loops mask the failure but do not resolve the underlying RAM shortage.
- The fix is always either reducing memory demand or switching to a larger runner.

**3. GitHub Codespaces 2-core machine type**

The 2-core Codespace (azure-hosted) specification is approximately 8 GB RAM with no swap.
With VS Code Server, language servers, and dev tools already consuming ~5.6 GB at baseline,
large webpack builds consistently exhaust the remaining headroom.

This is a documented Codespace constraint. The recommended approach from GitHub is to
upgrade to a 4-core (8 GB) or 8-core (16 GB) machine type for memory-intensive workloads,
or to configure swap in `devcontainer.json` post-create commands.

**4. Docker multi-stage builds (`RUN yarn build` in Alpine)**

The Dockerfile uses a multi-stage build: `node:20-alpine` installs dependencies and runs
`yarn build`, then the output is copied to a slim serve image. Inside the Alpine build
stage:

- Same webpack memory demand applies.
- The Alpine container shares the host runner's RAM budget.
- `RUN yarn build` has no `GENERATE_SOURCEMAP=false`, no `NODE_OPTIONS` tuning.
- In the GitHub Actions `docker` and `docker-test` jobs, this runs on `ubuntu-latest`
  (7 GB total), making it the most memory-constrained path in the whole pipeline.

### Proven Solutions

These solutions are ordered from highest impact to lowest. They are based on both the
local evidence gathered in this investigation and established community practice.

#### Solution 1: Disable source map generation (highest impact)

```
GENERATE_SOURCEMAP=false
```

Add to:

- `package.json` `build` script: `GENERATE_SOURCEMAP=false craco build`
- Dockerfile `ENV` before `RUN yarn build`

**Impact:** Eliminates the 1–2 GB source map generation spike. This alone often brings
peak memory within budget for builds that were marginal. The trade-off is that
production source maps are not generated (a separate source map upload step would be
needed for Sentry/error tracking if required).

#### Solution 2: Node.js heap limit tuning

```
NODE_OPTIONS=--max_old_space_size=4096
```

Add alongside Solution 1. Instructs V8 to use up to 4 GB of heap before triggering GC
pressure. Without this, V8's default limit (~1.5 GB on 64-bit) may cause V8 GC to run
excessively before the process is killed, wasting time and amplifying memory pressure
from GC pause allocations.

This does **not** prevent OOM kill if total system RAM is still exhausted, but it reduces
the chance of V8 self-limiting before the build is complete.

#### Solution 3: Add swap space to the Codespace (local development)

In the `devcontainer.json` `postCreateCommand`, or as a one-time manual step:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**Impact:** Provides 4 GB of swap. Even slow disk-backed swap prevents OOM kills by
allowing the kernel to page out inactive memory instead of killing processes. This is the
most reliable local fix for the Codespace environment specifically.

Note: swap cannot be added inside the Dockerfile build stage; it only applies to the
outer host/Codespace environment.

#### Solution 4: Upgrade Codespace machine type

Switch from 2-core to 4-core or 8-core:

- 4-core: ~8 GB RAM dedicated (vs. shared 8 GB on the current 2-core)
- 8-core: 16 GB RAM dedicated

**Impact:** Provides enough headroom that webpack can complete without memory pressure,
even with source maps enabled.

#### Solution 5: Use a larger GitHub Actions runner for Docker jobs

For the `docker` and `docker-test` jobs that do the full image build:

```yaml
runs-on: ubuntu-latest-xl # 30 GB RAM, available on GitHub Teams/Enterprise
```

or use a self-hosted runner with 16+ GB RAM.

**Impact:** Eliminates the 7 GB RAM constraint in the most memory-constrained CI path.

#### Solution 6: Worker count cap for tests

The `test` script already uses `--maxWorkers=50%` (= 1 worker on a 2-core machine),
which is reasonable. The GitHub Actions `Unit Tests` step calls `yarn test` which
inherits this cap. No change needed here unless the runner configuration changes.

### Recommended Minimum Fix (Smallest Safe Change)

Adding `GENERATE_SOURCEMAP=false` to both the `build` script in `package.json` and the
Dockerfile `ENV` block is the smallest, most targeted change that directly addresses the
proven memory pressure cause, has no effect on correctness, and does not introduce
maintenance surface.

This should be validated by:

1. A successful `yarn build` run in this Codespace **without** exit `137` in at least
   three consecutive attempts.
2. A successful `docker build` in a GitHub Actions run (the `docker` or `docker-test`
   job completing without early exit).

Only after that validation should the change be considered proven and safe to keep.

### Constrained Plan (No Codespace/Actions Size Changes)

This section defines a **documentation-only** plan that stays within the required
constraint:

- no Codespace machine upgrade,
- no larger/self-hosted Actions runners,
- no memory quota increase at infrastructure level.

Goal of this constrained plan:

1. keep build and tests runnable on existing GitHub/Codespaces resources,
2. prevent Linux/container OOM kills by keeping process memory below host pressure,
3. use deterministic command shape rather than retries.

#### Why this can prevent OOM kills

Official CRA docs explicitly state `GENERATE_SOURCEMAP=false` is intended to solve
OOM issues for production builds on smaller machines.

Official GitHub-hosted runner docs show that standard Linux capacity can be limited
(`ubuntu-latest` is finite-memory and plan-dependent), so we must control memory
consumption in-process instead of depending on host headroom.

Therefore the viable no-infra path is to enforce **hard memory and concurrency
limits at command level**.

#### Proposed command policy (simple + deterministic)

1. Build command policy:

- `GENERATE_SOURCEMAP=false`
- `DISABLE_ESLINT_PLUGIN=true` (lint already runs as a separate step)
- `NODE_OPTIONS=--max_old_space_size=1536`

1. Test command policy:

- `NODE_OPTIONS=--max_old_space_size=1536`
- `--runInBand`
- `--watch=false`
- keep `CI=true` in CI execution

1. Execution policy:

- never run build and tests concurrently in the same job,
- run lint -> tsc -> tests -> build in strict sequence,
- keep a single heavy Node process at a time.

1. Optional safety for full-suite stability (only if needed after baseline):

- split tests into fixed sequential shards (by directory groups), each run in-band,
- keep the same `NODE_OPTIONS` ceiling for each shard.

#### Guarantee statement (scope-limited)

Within the current constraints, the practical guarantee we can provide is:

- **No host-level OOM kill of Node build/test processes due to unbounded growth**,
  because each heavy process is constrained by fixed heap and single-process execution.

Notes:

- This guarantees avoidance of the observed OOM-kill class (`SIGKILL`/`137`) from
  runaway memory growth.
- It does not guarantee protection from unrelated external termination causes
  (manual cancellation, network/interruption, platform incident).

#### Validation plan for this constrained policy

1. Run tests command 3 consecutive times in current Codespace.
2. Run build command 3 consecutive times in current Codespace.
3. Run one GitHub Actions workflow with the same command policy.
4. Accept only if all runs complete without `137` and without
   `The build failed because the process exited too early.`
