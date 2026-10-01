# TASK-774-ci-canvas — fix the CI install on Node 24 and restore gh after the devcontainer rebuild

- [x] Create TODO and log
- [x] Find why CI `test` fails at Install on 716df2ba (canvas 2.11.2 source build, no pixman/cairo dev libs on the runner)
- [x] Add a step to `.github/workflows/main.yml` that installs the canvas build libraries before Install (mirror the Dockerfile list)
- [x] Verify the apt package names exist
- [x] Add the GitHub CLI feature to `.devcontainer/devcontainer.json` and mention it in `.devcontainer/README.md`
- [x] Install gh in the current container so it works before the next rebuild
- [x] Validate devcontainer.json and the workflow YAML
- [x] Run `yarn lint`, `yarn tsc`, `yarn test:ci` (sequentially) in the rebuilt Node 24 container, zero console output
- [x] Update TASK-774-handoff.md, TASK-774-todo.md, TASK-774-log.md
- [x] Report; no commit or push without explicit request
