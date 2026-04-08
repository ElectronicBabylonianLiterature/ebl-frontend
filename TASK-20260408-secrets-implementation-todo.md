# TASK 20260408 secrets implementation TODO

- [completed] Add and validate shared secret-scanning configuration files.
- [completed] Integrate pre-commit scanning into the existing Husky pre-commit hook.
- [completed] Add dedicated GitHub Actions secret-scan workflow.
- [completed] Update README with developer setup and false-positive handling instructions.
- [completed] Run required verification commands (`yarn lint`, `yarn tsc`) and finalize task notes.
- [completed] Replace pre-commit dependency with direct Gitleaks execution in Husky.
- [completed] Install Gitleaks automatically during devcontainer image build.
- [completed] Update documentation to reflect direct Gitleaks usage and devcontainer automation.
- [completed] Add repo-specific API secret detection rules with placeholder allowlists.
- [completed] Add a repeatable synthetic secret-scanning regression script.
- [completed] Switch local and CI secret scanning to GitGuardian `ggshield`.
- [completed] Fix `ggshield auth login` token precedence when `GITGUARDIAN_API_KEY` is present but empty.
- [completed] Remove devcontainer `GITGUARDIAN_API_KEY` passthrough that caused empty-variable auth failures in new terminals.
- [completed] Make all synthetic secret test payloads dynamically generated at runtime.
- [completed] Document `GITGUARDIAN_API_KEY` creation and setup steps in README.
- [completed] Merge consecutive Docker `RUN` instructions flagged by radar lint.
- [completed] Pin GitHub Actions to commit SHAs and disable checkout credential persistence in secret scan workflow.
