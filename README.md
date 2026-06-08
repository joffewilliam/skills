# Public Skills

Reusable agent skills. This repo currently has one skill:

- `mcmaster-web-performance`: build clean, fast websites with an app shell,
  inline critical CSS, versioned assets, and prefetch-on-hover navigation.

Pick the folder for your agent and install that one folder. Each folder contains
its own `SKILL.md` plus the files the skill needs.

| Agent | Use this folder |
| --- | --- |
| Codex | `codex/mcmaster-web-performance` |
| Claude Code | `claude/mcmaster-web-performance` |
| Claude.ai custom skills | `claude/mcmaster-web-performance` |
| Other agents | `other/mcmaster-web-performance` |

Do not copy all three versions unless you use all three agents.

## Codex

Codex reads user skills from `$HOME/.agents/skills`. For a project-only skill,
copy the folder into that project's `.agents/skills` directory instead.

### Windows PowerShell

```powershell
git clone https://github.com/joffewilliam/skills.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.agents\skills"
Copy-Item -Recurse .\skills\codex\mcmaster-web-performance "$env:USERPROFILE\.agents\skills\"
```

Project-only install:

```powershell
New-Item -ItemType Directory -Force .\.agents\skills
Copy-Item -Recurse .\skills\codex\mcmaster-web-performance .\.agents\skills\
```

### macOS and Linux

```bash
git clone https://github.com/joffewilliam/skills.git
mkdir -p ~/.agents/skills
cp -R skills/codex/mcmaster-web-performance ~/.agents/skills/
```

Project-only install:

```bash
mkdir -p .agents/skills
cp -R skills/codex/mcmaster-web-performance .agents/skills/
```

### iOS and iPadOS

Codex local skills need access to `.agents/skills`, so install this from a
desktop environment.

## Claude Code

Claude Code reads user skills from `$HOME/.claude/skills`.

### Windows PowerShell

```powershell
git clone https://github.com/joffewilliam/skills.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills"
Copy-Item -Recurse .\skills\claude\mcmaster-web-performance "$env:USERPROFILE\.claude\skills\"
```

### macOS and Linux

```bash
git clone https://github.com/joffewilliam/skills.git
mkdir -p ~/.claude/skills
cp -R skills/claude/mcmaster-web-performance ~/.claude/skills/
```

### iOS and iPadOS

Claude Code local skills need access to `.claude/skills`, so install this from
a desktop environment.

## Claude.ai Custom Skill

Use the Claude version and upload it as a custom skill ZIP.

### Windows PowerShell

```powershell
git clone https://github.com/joffewilliam/skills.git
Compress-Archive -Path .\skills\claude\mcmaster-web-performance\* -DestinationPath .\mcmaster-web-performance-claude.zip
```

Upload `mcmaster-web-performance-claude.zip` to Claude.ai.

### macOS and Linux

```bash
git clone https://github.com/joffewilliam/skills.git
(cd skills/claude/mcmaster-web-performance && zip -r ../../../mcmaster-web-performance-claude.zip .)
```

Upload `mcmaster-web-performance-claude.zip` to Claude.ai.

### iOS and iPadOS

Download the repo ZIP from GitHub. In Files, compress
`claude/mcmaster-web-performance`, then upload that ZIP to Claude.ai.

## Other Agents

Use `other/mcmaster-web-performance` when your agent wants a plain skill folder
with a `SKILL.md` file and bundled resources.

### Windows PowerShell

```powershell
git clone https://github.com/joffewilliam/skills.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\agent-skills"
Copy-Item -Recurse .\skills\other\mcmaster-web-performance "$env:USERPROFILE\agent-skills\"
```

Point your agent at `$env:USERPROFILE\agent-skills\mcmaster-web-performance`.

### macOS and Linux

```bash
git clone https://github.com/joffewilliam/skills.git
mkdir -p ~/agent-skills
cp -R skills/other/mcmaster-web-performance ~/agent-skills/
```

Point your agent at `~/agent-skills/mcmaster-web-performance`.

### iOS and iPadOS

If your iOS agent supports custom skill folders, give it
`other/mcmaster-web-performance`. If it only accepts text, paste the contents of
`other/mcmaster-web-performance/SKILL.md`.

## Demo

Aquatic Haven was built with this skill:

https://joffewilliam.github.io/aquatic-haven/
