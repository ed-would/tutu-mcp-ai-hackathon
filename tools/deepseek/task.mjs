#!/usr/bin/env node

/**
 * Dependency-free task-packet creator.
 *
 * Profiles specialize one hardened worker runtime without duplicating worker
 * code. The generated packet is fully materialized and can be inspected before
 * execution.
 */

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = process.cwd();
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const profileDirectory = path.join(scriptDirectory, "profiles");
const taskDirectory = path.join(repositoryRoot, ".deepseek", "tasks");

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function help() {
  console.log(`Create a DeepSeek worker task packet

Usage:
  node tools/deepseek/task.mjs --list
  node tools/deepseek/task.mjs --profile <name> --id <task-id> --objective <text> [options]

Options:
  --list                         List available profiles
  --profile <name>               Profile from tools/deepseek/profiles
  --id <task-id>                 Output task id
  --objective <text>             Exact bounded objective
  --include <glob>               Repeatable narrow repository glob
  --git-diff-path <path>         Repeatable Git path; enables diff collection
  --constraint <text>            Repeatable additional constraint
  --max-output-tokens <number>   Override profile output budget
  --out <path>                   Default: .deepseek/tasks/<task-id>.json
  --force                        Replace an existing task file
  --help, -h                     Show this help

Examples:
  npm run deepseek:task -- --profile diff-reviewer --id auth-review-001 \\
    --objective "Review auth changes for correctness and regressions" \\
    --include "src/auth/**/*.ts" --include "tests/auth/**/*.ts" \\
    --git-diff-path src/auth --git-diff-path tests/auth

  npm run deepseek:task -- --profile repo-explorer --id repo-map-001 \\
    --objective "Map the request lifecycle and module ownership" \\
    --include "src/**/*.ts" --include package.json
`);
}

function parse(argv) {
  const result = {
    list: false,
    help: false,
    force: false,
    profile: undefined,
    id: undefined,
    objective: undefined,
    out: undefined,
    include: [],
    gitDiffPaths: [],
    constraints: [],
    maxOutputTokens: undefined,
  };

  const repeated = new Map([
    ["--include", result.include],
    ["--git-diff-path", result.gitDiffPaths],
    ["--constraint", result.constraints],
  ]);

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--list") {
      result.list = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      result.help = true;
      continue;
    }
    if (arg === "--force") {
      result.force = true;
      continue;
    }
    if (repeated.has(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      repeated.get(arg).push(value);
      index += 1;
      continue;
    }
    if (["--profile", "--id", "--objective", "--out", "--max-output-tokens"].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      if (arg === "--profile") result.profile = value;
      if (arg === "--id") result.id = value;
      if (arg === "--objective") result.objective = value;
      if (arg === "--out") result.out = value;
      if (arg === "--max-output-tokens") {
        result.maxOutputTokens = Number.parseInt(value, 10);
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return result;
}

function assertSafeId(value) {
  if (!/^[A-Za-z0-9._-]+$/u.test(value)) {
    throw new Error("Task id may contain only letters, digits, dot, underscore, and hyphen");
  }
}

function assertInside(parent, target, label) {
  const relative = path.relative(parent, target);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`${label} must be inside ${parent}`);
  }
}

async function listProfiles() {
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(profileDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort();

  for (const name of files) {
    const profile = JSON.parse(
      await readFile(path.join(profileDirectory, name), "utf8"),
    );
    console.log(`${profile.id.padEnd(22)} ${profile.title}`);
  }
}

async function main() {
  const args = parse(process.argv);
  if (args.help) {
    help();
    return;
  }
  if (args.list) {
    await listProfiles();
    return;
  }

  if (!args.profile || !args.id || !args.objective) {
    throw new Error("--profile, --id, and --objective are required");
  }

  assertSafeId(args.id);

  const profilePath = path.join(profileDirectory, `${args.profile}.json`);
  assertInside(profileDirectory, profilePath, "Profile");
  if (!(await exists(profilePath))) {
    throw new Error(`Unknown profile: ${args.profile}. Run with --list.`);
  }

  const profile = JSON.parse(await readFile(profilePath, "utf8"));
  if (profile.id !== args.profile || typeof profile.role !== "string") {
    throw new Error(`Invalid profile contract: ${profilePath}`);
  }

  if (args.include.length === 0 && args.gitDiffPaths.length === 0) {
    throw new Error(
      "Provide at least one --include or --git-diff-path. Broad implicit repository access is intentionally disabled.",
    );
  }

  const maxOutputTokens =
    args.maxOutputTokens ?? profile.defaults.max_output_tokens;
  if (
    !Number.isInteger(maxOutputTokens) ||
    maxOutputTokens < 512 ||
    maxOutputTokens > 32768
  ) {
    throw new Error("max_output_tokens must be an integer from 512 to 32768");
  }

  const task = {
    id: args.id,
    profile: profile.id,
    role: profile.role,
    objective: args.objective,
    include: args.include,
    include_git_diff: args.gitDiffPaths.length > 0,
    git_diff_paths: args.gitDiffPaths,
    constraints: [...profile.constraints, ...args.constraints],
    max_files: profile.defaults.max_files,
    max_file_bytes: profile.defaults.max_file_bytes,
    max_context_bytes: profile.defaults.max_context_bytes,
    max_git_diff_bytes: profile.defaults.max_git_diff_bytes,
    max_output_tokens: maxOutputTokens,
    timeout_ms: profile.defaults.timeout_ms,
  };

  const outputPath = path.resolve(
    repositoryRoot,
    args.out ?? path.join(".deepseek", "tasks", `${args.id}.json`),
  );
  assertInside(taskDirectory, outputPath, "--out");

  if (!args.force && (await exists(outputPath))) {
    throw new Error(`Task already exists: ${outputPath}. Use --force to replace it.`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  await writeFile(outputPath, `${JSON.stringify(task, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  console.log(outputPath);
}

main().catch((error) => {
  console.error(`Task creation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
