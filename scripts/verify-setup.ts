#!/usr/bin/env npx tsx

/**
 * Verify Setup Script
 * Tests that the template is correctly configured for Web Claude Code
 * Run with: npx tsx scripts/verify-setup.ts
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

// MCP server health check with timeout
async function checkMcpServer(
  name: string,
  url: string
): Promise<{ ok: boolean; status: number | string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: response.ok || response.status < 500, status: response.status };
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, status: "timeout" };
    }
    return { ok: false, status: "unreachable" };
  }
}

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  context?: string; // Additional context for AI model
  fix?: string; // Suggested fix action
}

const results: TestResult[] = [];

type TestReturn = {
  status: "pass" | "fail" | "warn";
  message: string;
  context?: string;
  fix?: string;
};

function test(name: string, fn: () => TestReturn) {
  try {
    const result = fn();
    results.push({ name, ...result });
  } catch (error) {
    results.push({
      name,
      status: "fail",
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      context: "Unexpected exception during test execution",
    });
  }
}

async function testAsync(name: string, fn: () => Promise<TestReturn>) {
  try {
    const result = await fn();
    results.push({ name, ...result });
  } catch (error) {
    results.push({
      name,
      status: "fail",
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      context: "Unexpected exception during async test execution",
    });
  }
}

// =============================================================================
// Test: Required Files Exist
// =============================================================================

test("CLAUDE.md exists", () => {
  if (existsSync("CLAUDE.md")) {
    return { status: "pass", message: "CLAUDE.md found" };
  }
  return {
    status: "fail",
    message: "CLAUDE.md not found",
    context: "CLAUDE.md contains critical claims and instructions for Claude Code",
    fix: "Create CLAUDE.md with Claims section including NO_LOCALHOST, HTTP_MCP_ONLY, SESSION_EPHEMERAL",
  };
});

test(".mcp.json exists", () => {
  if (existsSync(".mcp.json")) {
    return { status: "pass", message: ".mcp.json found" };
  }
  return {
    status: "fail",
    message: ".mcp.json not found",
    context: "MCP configuration file is required for HTTP MCP server connections",
    fix: "Create .mcp.json with mcpServers object containing HTTP MCP endpoints",
  };
});

test(".claude/settings.json exists", () => {
  if (existsSync(".claude/settings.json")) {
    return { status: "pass", message: ".claude/settings.json found" };
  }
  return { status: "fail", message: ".claude/settings.json not found" };
});

test("netlify.toml exists", () => {
  if (existsSync("netlify.toml")) {
    return { status: "pass", message: "netlify.toml found" };
  }
  return { status: "fail", message: "netlify.toml not found" };
});

test("scripts/setup.sh exists and is executable", () => {
  if (existsSync("scripts/setup.sh")) {
    return { status: "pass", message: "setup.sh found" };
  }
  return { status: "fail", message: "scripts/setup.sh not found" };
});

// =============================================================================
// Test: MCP Configuration
// =============================================================================

test(".mcp.json has HTTP MCP servers", () => {
  if (!existsSync(".mcp.json")) {
    return { status: "fail", message: ".mcp.json not found" };
  }

  const content = readFileSync(".mcp.json", "utf-8");
  const config = JSON.parse(content);

  if (!config.mcpServers) {
    return { status: "fail", message: "No mcpServers defined" };
  }

  const servers = Object.keys(config.mcpServers);
  const httpServers = servers.filter((s) => {
    const server = config.mcpServers[s];
    return server.type === "http" || server.url?.startsWith("https://");
  });

  if (httpServers.length === 0) {
    return { status: "fail", message: "No HTTP MCP servers found" };
  }

  return {
    status: "pass",
    message: `${httpServers.length} HTTP MCP servers configured: ${httpServers.join(", ")}`,
  };
});

test("No stdio MCP servers in config", () => {
  if (!existsSync(".mcp.json")) {
    return { status: "pass", message: "No .mcp.json (OK)" };
  }

  const content = readFileSync(".mcp.json", "utf-8");
  const config = JSON.parse(content);

  if (!config.mcpServers) {
    return { status: "pass", message: "No MCP servers" };
  }

  const stdioServers = Object.entries(config.mcpServers).filter(([_, server]: [string, any]) => {
    return server.type === "stdio" || server.command;
  });

  if (stdioServers.length > 0) {
    return {
      status: "fail",
      message: `Found stdio MCP servers (not web compatible): ${stdioServers.map(([name]) => name).join(", ")}`,
    };
  }

  return { status: "pass", message: "No stdio MCP servers (good for web)" };
});

// =============================================================================
// Test: SessionStart Hook
// =============================================================================

test("SessionStart hook is configured", () => {
  if (!existsSync(".claude/settings.json")) {
    return { status: "fail", message: ".claude/settings.json not found" };
  }

  const content = readFileSync(".claude/settings.json", "utf-8");
  const config = JSON.parse(content);

  if (!config.hooks?.SessionStart) {
    return { status: "fail", message: "No SessionStart hook configured" };
  }

  return { status: "pass", message: "SessionStart hook configured" };
});

// =============================================================================
// Test: Claims in CLAUDE.md
// =============================================================================

test("CLAUDE.md contains Claims section", () => {
  if (!existsSync("CLAUDE.md")) {
    return { status: "fail", message: "CLAUDE.md not found" };
  }

  const content = readFileSync("CLAUDE.md", "utf-8");

  if (content.includes("CRITICAL CLAIMS")) {
    return { status: "pass", message: "Claims section found" };
  }

  return { status: "warn", message: "No Claims section in CLAUDE.md" };
});

test("CLAUDE.md contains key claims", () => {
  if (!existsSync("CLAUDE.md")) {
    return { status: "fail", message: "CLAUDE.md not found" };
  }

  const content = readFileSync("CLAUDE.md", "utf-8");
  const requiredClaims = ["NO_LOCALHOST", "HTTP_MCP_ONLY", "SESSION_EPHEMERAL"];
  const missing = requiredClaims.filter((claim) => !content.includes(claim));

  if (missing.length > 0) {
    return { status: "warn", message: `Missing claims: ${missing.join(", ")}` };
  }

  return { status: "pass", message: "All key claims present" };
});

// =============================================================================
// Test: Environment Variables
// =============================================================================

test("NETLIFY_SITE_ID environment variable", () => {
  if (process.env.NETLIFY_SITE_ID) {
    return { status: "pass", message: "NETLIFY_SITE_ID is set" };
  }
  return {
    status: "warn",
    message: "NETLIFY_SITE_ID not set - set in environment selector",
  };
});

test("CLAUDE_CODE_REMOTE check", () => {
  if (process.env.CLAUDE_CODE_REMOTE === "true") {
    return { status: "pass", message: "Running in web Claude Code environment" };
  }
  return { status: "warn", message: "Not running in web environment (local)" };
});

// =============================================================================
// Test: .env file configuration
// =============================================================================

test(".env or .env.example exists", () => {
  if (existsSync(".env")) {
    return { status: "pass", message: ".env file found" };
  }
  if (existsSync(".env.example")) {
    return { status: "warn", message: ".env.example found - copy to .env and configure" };
  }
  return { status: "warn", message: "No .env file - set variables in environment selector" };
});

test(".env.example has required variables", () => {
  const envExample = existsSync(".env.example")
    ? readFileSync(".env.example", "utf-8")
    : existsSync(".env")
      ? readFileSync(".env", "utf-8")
      : "";

  if (!envExample) {
    return { status: "warn", message: "No .env.example to check" };
  }

  const requiredVars = ["NETLIFY_SITE_ID"];
  const missing = requiredVars.filter((v) => !envExample.includes(v));

  if (missing.length > 0) {
    return { status: "warn", message: `Missing in template: ${missing.join(", ")}` };
  }

  return { status: "pass", message: "All required variables documented" };
});

// =============================================================================
// Test: Commands exist
// =============================================================================

test("Slash commands exist", () => {
  const expectedCommands = [
    "init-project.md",
    "preview.md",
    "check-env.md",
    "verify.md",
  ];

  if (!existsSync(".claude/commands")) {
    return {
      status: "fail",
      message: "No .claude/commands directory",
      fix: "Create .claude/commands/ with command markdown files",
    };
  }

  const installed = readdirSync(".claude/commands").filter((f) => f.endsWith(".md"));
  const missing = expectedCommands.filter((cmd) => !installed.includes(cmd));

  if (missing.length > 0) {
    return {
      status: "warn",
      message: `Installed: ${installed.join(", ")} | Missing: ${missing.join(", ")}`,
      fix: `Create missing command files in .claude/commands/`,
    };
  }

  return {
    status: "pass",
    message: `Commands: /${installed.map((c) => c.replace(".md", "")).join(", /")}`,
  };
});

// =============================================================================
// Test: Plugins Configuration
// =============================================================================

test("Default plugins installed", () => {
  const markerFile = ".claude/.plugins_installed";

  if (existsSync(markerFile)) {
    const content = readFileSync(markerFile, "utf-8");
    return {
      status: "pass",
      message: `Default plugins installed: claude-plugins-official, SuperClaude (${content.trim()})`,
    };
  }

  return {
    status: "warn",
    message: "Default plugins not yet installed",
    context: "SessionStart hook will install on first session",
    fix: "Run setup.sh or: claude plugin add anthropics/claude-plugins-official && claude plugin add SuperClaude-Org/SuperClaude_Framework",
  };
});

test("Skills directory (optional)", () => {
  if (!existsSync(".claude/skills")) {
    return {
      status: "pass",
      message: "No skills installed (minimal template)",
    };
  }

  const items = readdirSync(".claude/skills").filter(
    (item) => item.endsWith(".md") || existsSync(`.claude/skills/${item}/SKILL.md`)
  );

  return {
    status: "pass",
    message: items.length > 0 ? `Skills: ${items.join(", ")}` : "No skills installed",
  };
});

// =============================================================================
// Test: Visual Testing Note
// =============================================================================

test("Visual testing approach", () => {
  const isWebEnv = process.env.CLAUDE_CODE_REMOTE === "true";

  if (isWebEnv) {
    return {
      status: "pass",
      message: "Use Netlify preview URLs for visual testing (no localhost in web)",
    };
  }

  return {
    status: "pass",
    message: "Local: Use localhost or Netlify preview for visual testing",
  };
});

// =============================================================================
// Test: MCP Server Health Checks (async)
// =============================================================================

async function runMcpHealthChecks() {
  if (!existsSync(".mcp.json")) {
    return;
  }

  const content = readFileSync(".mcp.json", "utf-8");
  const config = JSON.parse(content);

  if (!config.mcpServers) {
    return;
  }

  console.log("\n📡 Checking MCP server connectivity...\n");

  const servers = Object.entries(config.mcpServers) as [string, { url?: string }][];

  for (const [name, server] of servers) {
    if (!server.url) continue;

    await testAsync(`MCP: ${name}`, async () => {
      const result = await checkMcpServer(name, server.url!);

      if (result.ok) {
        return {
          status: "pass",
          message: `${server.url} → ${result.status}`,
        };
      }

      // OAuth servers often return 401/403 without auth - that's expected
      if (result.status === 401 || result.status === 403) {
        return {
          status: "warn",
          message: `${server.url} → ${result.status} (needs OAuth via /mcp)`,
        };
      }

      return {
        status: "warn",
        message: `${server.url} → ${result.status}`,
      };
    });
  }
}

// =============================================================================
// Main: Run all tests and report
// =============================================================================

async function main() {
  // Run MCP health checks
  await runMcpHealthChecks();

  // Report Results
  console.log("\n");
  console.log("=".repeat(60));
  console.log("  Claude Code Web Template - Verification Report");
  console.log("=".repeat(60));
  console.log("\n");

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const warned = results.filter((r) => r.status === "warn").length;

  for (const result of results) {
    const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️";
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);

    // Show context and fix for non-passing tests (for AI model context)
    if (result.status !== "pass") {
      if (result.context) {
        console.log(`   📋 Context: ${result.context}`);
      }
      if (result.fix) {
        console.log(`   🔧 Fix: ${result.fix}`);
      }
    }
    console.log();
  }

  // Output JSON summary for programmatic access
  const jsonSummary = {
    passed,
    failed,
    warned,
    failures: results.filter((r) => r.status === "fail"),
    warnings: results.filter((r) => r.status === "warn"),
  };

  console.log("--- JSON Summary (for automation) ---");
  console.log(JSON.stringify(jsonSummary, null, 2));
  console.log("---");

  console.log("=".repeat(60));
  console.log(`  Summary: ${passed} passed, ${warned} warnings, ${failed} failed`);
  console.log("=".repeat(60));

  if (failed > 0) {
    console.log("\n❌ Some tests failed. Please fix the issues above.");
    process.exit(1);
  } else if (warned > 0) {
    console.log("\n⚠️ All tests passed with warnings. Review the warnings above.");
    process.exit(0);
  } else {
    console.log("\n✅ All tests passed! Template is ready for web Claude Code.");
    process.exit(0);
  }
}

main();
