# Verify Template Setup

Run verification tests to ensure the template is correctly configured for Web Claude Code.

## Steps

1. Run the verification script:

```bash
bun run scripts/verify-setup.ts
```

> Note: If bun is not available, use `npx tsx scripts/verify-setup.ts` as fallback.

2. Review the output and report:
   - ✅ Pass: Configuration is correct
   - ⚠️ Warning: May need attention
   - ❌ Fail: Must be fixed

3. If running in web Claude Code, also verify:
   - `$CLAUDE_CODE_REMOTE` should be `true`
   - MCP OAuth should be complete (`/mcp` to check)
   - Environment variables should be set in environment selector

## Expected Results

For a properly configured template:

```
✅ CLAUDE.md exists
✅ .mcp.json exists
✅ .claude/settings.json exists
✅ netlify.toml exists
✅ scripts/setup.sh exists and is executable
✅ .mcp.json has HTTP MCP servers
✅ No stdio MCP servers in config
✅ SessionStart hook is configured
✅ CLAUDE.md contains Claims section
✅ CLAUDE.md contains key claims
✅ Slash commands exist
```

## Troubleshooting

If verification fails:

1. **Missing files**: Ensure you forked the complete template
2. **stdio MCP found**: Remove or comment out stdio MCP servers from .mcp.json
3. **Missing claims**: Update CLAUDE.md with required claims
4. **Environment variables**: Set in claude.ai/code environment selector
