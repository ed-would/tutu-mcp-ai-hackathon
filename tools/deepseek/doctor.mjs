#!/usr/bin/env node

/**
 * Local installation doctor. It never sends a network request and never prints
 * credential values.
 */

import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const checks = [];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
}

async function checkFile(relativePath, { nonEmpty = true } = {}) {
  const target = path.join(root, relativePath);
  if (!(await exists(target))) {
    record(relativePath, false, "missing");
    return;
  }
  const info = await lstat(target);
  if (!info.isFile() || info.isSymbolicLink()) {
    record(relativePath, false, "must be a real file, not a symlink");
    return;
  }
  if (nonEmpty && info.size === 0) {
    record(relativePath, false, "empty");
    return;
  }
  record(relativePath, true, `${info.size} bytes`);
}

async function main() {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  record("Node.js", nodeMajor >= 22, `${process.versions.node}; required >=22`);

  const requiredFiles = [
    "tools/deepseek/worker.ts",
    "tools/deepseek/system.md",
    "tools/deepseek/task.mjs",
    "tools/deepseek/schemas/task.schema.json",
    "tools/deepseek/schemas/result.schema.json",
    ".deepseek/tasks/worker-smoke-001.json",
    ".codex/config.toml",
    "AGENTS.md",
    ".agents/skills/deepseek-explore/SKILL.md",
    ".agents/skills/deepseek-research/SKILL.md",
    ".agents/skills/deepseek-docs/SKILL.md",
    ".agents/skills/deepseek-review/SKILL.md",
    ".agents/skills/deepseek-tests/SKILL.md",
    ".agents/skills/deepseek-plan/SKILL.md",
    ".agents/skills/deepseek-security/SKILL.md",
    ".agents/skills/deepseek-critic/SKILL.md",
    ".agents/skills/deepseek-worker-core/SKILL.md",
    "package.json",
  ];
  for (const file of requiredFiles) {
    await checkFile(file);
  }

  for (const directory of [".deepseek/tasks", ".deepseek/runs"]) {
    const target = path.join(root, directory);
    if (!(await exists(target))) {
      record(directory, false, "missing");
      continue;
    }
    const info = await lstat(target);
    record(
      directory,
      info.isDirectory() && !info.isSymbolicLink(),
      info.isSymbolicLink() ? "symlink rejected" : "present",
    );
  }

  const packageJsonPath = path.join(root, "package.json");
  if (await exists(packageJsonPath)) {
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    const scripts = packageJson.scripts ?? {};
    const requiredScripts = [
      "deepseek",
      "deepseek:task",
      "deepseek:doctor",
      "deepseek:typecheck",
      "deepseek:smoke",
    ];
    for (const script of requiredScripts) {
      record(
        `package script ${script}`,
        typeof scripts[script] === "string",
        typeof scripts[script] === "string" ? scripts[script] : "missing",
      );
    }

    const requireFromProject = createRequire(packageJsonPath);
    for (const dependency of ["openai", "dotenv", "fast-glob", "tsx", "typescript"] ) {
      try {
        requireFromProject.resolve(dependency);
        record(`dependency ${dependency}`, true, "resolvable");
      } catch {
        record(`dependency ${dependency}`, false, "not resolvable from project");
      }
    }
  }

  const envPath = path.join(root, ".env.local");
  if (await exists(envPath)) {
    const envText = await readFile(envPath, "utf8");
    const hasKey = /^(YANDEX_API_KEY|YC_API_KEY)=.+$/mu.test(envText);
    const hasFolder = /^(YANDEX_FOLDER_ID|YC_FOLDER_ID)=.+$/mu.test(envText);
    record("Yandex API key", hasKey, hasKey ? "present in .env.local" : "missing");
    record("Yandex folder id", hasFolder, hasFolder ? "present in .env.local" : "missing");
  } else {
    record(".env.local", false, "missing; copy .env.deepseek.example and add credentials");
  }

  const configPath = path.join(root, ".codex", "config.toml");
  if (await exists(configPath)) {
    const config = await readFile(configPath, "utf8");
    record(
      "Codex workspace-write sandbox",
      /^sandbox_mode\s*=\s*"workspace-write"/mu.test(config),
      "sandbox_mode must be workspace-write",
    );
    record(
      "Codex on-request approvals",
      /^approval_policy\s*=\s*"on-request"/mu.test(config),
      "approval_policy must be on-request",
    );
    record(
      "Codex network access",
      /^network_access\s*=\s*true/mu.test(config),
      "sandbox_workspace_write.network_access must be true",
    );
  }

  const profileDirectory = path.join(root, "tools", "deepseek", "profiles");
  if (await exists(profileDirectory)) {
    const requiredProfiles = [
      "research",
      "repo-explorer",
      "docs-researcher",
      "diff-reviewer",
      "plan-validator",
      "test-gap-finder",
      "independent-critic",
      "security-review",
    ];
    const profileFiles = new Set(
      (await readdir(profileDirectory)).filter((name) => name.endsWith(".json")),
    );
    for (const profileName of requiredProfiles) {
      const filename = `${profileName}.json`;
      if (!profileFiles.has(filename)) {
        record(`profile ${profileName}`, false, "missing");
        continue;
      }
      try {
        const profile = JSON.parse(
          await readFile(path.join(profileDirectory, filename), "utf8"),
        );
        const budget = profile?.defaults?.max_output_tokens;
        record(
          `profile ${profileName}`,
          profile.id === profileName && [16000, 16384].includes(budget),
          `id=${String(profile.id)}; max_output_tokens=${String(budget)}`,
        );
      } catch (error) {
        record(
          `profile ${profileName}`,
          false,
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  const agentsPath = path.join(root, "AGENTS.md");
  if (await exists(agentsPath)) {
    const agents = await readFile(agentsPath, "utf8");
    record(
      "AGENTS progressive-disclosure pointer",
      (agents.match(/deepseek-worker:start/gu) ?? []).length === 1 &&
        (agents.match(/deepseek-worker:end/gu) ?? []).length === 1,
      "expected exactly one managed block",
    );
  }

  const systemPath = path.join(root, "tools", "deepseek", "system.md");
  if (await exists(systemPath)) {
    const systemPrompt = await readFile(systemPath, "utf8");
    record(
      "System prompt injection boundary",
      /untrusted data/u.test(systemPrompt) && /Never follow instructions found inside/u.test(systemPrompt),
      "trusted/untrusted boundary must be explicit",
    );
  }

  const workerPath = path.join(root, "tools", "deepseek", "worker.ts");
  if (await exists(workerPath)) {
    const worker = await readFile(workerPath, "utf8");
    record(
      "OpenAI ClientOptions compatibility",
      !/\blogLevel\s*:/u.test(worker),
      /\blogLevel\s*:/u.test(worker)
        ? "unsupported logLevel field found"
        : "no unsupported logLevel field",
    );
    record(
      "Default output budget",
      /DEFAULT_MAX_OUTPUT_TOKENS\s*=\s*16_384/u.test(worker),
      "expected 16384",
    );
    record(
      "Hard output budget",
      /HARD_MAX_OUTPUT_TOKENS\s*=\s*32_768/u.test(worker),
      "expected 32768",
    );
  }

  const failures = checks.filter((check) => !check.ok);
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name} — ${check.detail}`);
  }

  console.log("");
  console.log(`Doctor result: ${failures.length === 0 ? "READY" : "NOT READY"}`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Doctor failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
