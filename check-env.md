# Check Environment Variables

Validate that all required environment variables are set.

Run the TypeScript environment checker:

```bash
bun run scripts/check-env.ts
```

> Note: If bun is not available, use `npx tsx scripts/check-env.ts` as fallback.

If any variables are missing, inform the user what they need to set and where to get them.
