# Public Repo Handoff

Recommended repository name:

```text
signal-garden
```

Recommended description:

```text
A daily cooperative signal-routing puzzle for Reddit interactive posts.
```

Suggested first push:

```powershell
git remote add origin https://github.com/OOYXLOO/signal-garden.git
git branch -M main
git push -u origin main
```

Before pushing, confirm that:

- `README.md` does not contain local paths or private notes.
- `.env` files are absent.
- `node_modules`, `dist`, and build info files are ignored.
- Devpost draft fields are in `docs/devpost-fields.md`.
- No credentials, tokens, cookies, payment data, or private account details are committed.
