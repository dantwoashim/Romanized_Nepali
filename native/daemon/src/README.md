# Daemon Source Placeholder

This directory is reserved for the future native daemon implementation.

The current repository is TypeScript/web-lab verified. A production daemon should be added only after choosing the runtime, storage adapter, and packaging route. Candidate runtime choices:

- TypeScript/Node bundle for fastest integration.
- Rust only if profiling proves the JS daemon cannot meet latency targets.

Do not put hot path engine logic inside the TSF DLL or IMK bundle; they should marshal IPC and fail open.
