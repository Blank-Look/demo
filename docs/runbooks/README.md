# Runbooks — demo

demo has no servers, databases, integrations, or scheduled jobs, so most of the delivery template's runbooks do not apply. The applicable operational runbooks are:

| Runbook | When to use |
|---|---|
| [deployment-rollback.md](deployment-rollback.md) | A bad change is live on GitHub Pages |
| [corrupt-save.md](corrupt-save.md) | A student reports the game will not resume |

Not applicable: Freshservice/Graph/Defender synchronisation failures, database migration failure, expired integration credentials, stuck workflow, notification failure, database restore.

## Local development

```bash
python3 -m http.server 8080
```

## Tests

```bash
node --test tests/
```
