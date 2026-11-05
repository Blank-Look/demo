# Runbook: Deployment rollback

Applies to the static site on GitHub Pages.

## Symptoms

- The live site is broken, blank, or serving an unexpected change.
- A commit merged to the default branch should not have been deployed.

## Steps

1. Identify the last known-good commit:
   ```bash
   git log --oneline -10
   ```
2. Revert the offending change on the default branch (do not force-push):
   ```bash
   git revert <bad-commit-sha>
   git push origin <default-branch>
   ```
3. Wait for GitHub Pages to rebuild, then hard-refresh the site (Ctrl/Cmd+Shift+R).
4. Verify: board renders, controls work, a legal move places a stone, and the console is free of errors.
5. If Pages is serving a cached asset, check the Actions/Pages deployment log and re-run the deployment.
6. Record the incident and, if a new class of issue appeared, update `docs/threat-model.md`.

## Notes

- GitHub Pages cannot be rolled back by a header; the revert commit is the rollback.
- Never commit secrets or credentials while fixing an incident.
