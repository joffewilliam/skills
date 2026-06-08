# Public Skills

Reusable agent skills, published in separate folders for the agents that read
them differently. Pick one agent below and install only that folder.

This repo currently includes one skill:

- `mcmaster-web-performance`: build clean websites that load and navigate like
  McMaster-Carr, using an app shell, inline critical CSS, versioned assets, and
  prefetch-on-hover navigation.

## Pick Your Agent

| Agent | Install this folder |
| --- | --- |
| Codex | [`codex/mcmaster-web-performance`](./codex/mcmaster-web-performance/) |
| Claude Code | [`claude/mcmaster-web-performance`](./claude/mcmaster-web-performance/) |
| Claude.ai custom skills | [`claude/mcmaster-web-performance`](./claude/mcmaster-web-performance/) as a ZIP |
| Other agents | [`other/mcmaster-web-performance`](./other/mcmaster-web-performance/) |

The `codex`, `claude`, and `other` folders are alternatives. Do not install all
three unless you actually use all three kinds of agents.

The desktop commands use Git sparse checkout, so they fetch the matching agent
folder instead of checking out every copy in the repo.

## Codex

Use this when you want Codex to find the skill automatically.

### Windows PowerShell

```powershell
$repo = Join-Path $env:TEMP "skills-mcmaster"
Remove-Item -Recurse -Force $repo -ErrorAction SilentlyContinue
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git $repo
Set-Location $repo
git sparse-checkout set codex/mcmaster-web-performance

$dest = Join-Path $env:USERPROFILE ".agents\skills\mcmaster-web-performance"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
Copy-Item -Recurse .\codex\mcmaster-web-performance $dest
```

For a project-only install, copy it to that project's `.agents\skills` folder
instead:

```powershell
$project = "C:\path\to\your\project"
$dest = Join-Path $project ".agents\skills\mcmaster-web-performance"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
Copy-Item -Recurse .\codex\mcmaster-web-performance $dest
```

### macOS and Linux

```bash
repo="$(mktemp -d)"
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git "$repo"
cd "$repo"
git sparse-checkout set codex/mcmaster-web-performance

dest="$HOME/.agents/skills/mcmaster-web-performance"
rm -rf "$dest"
mkdir -p "$(dirname "$dest")"
cp -R codex/mcmaster-web-performance "$dest"
```

For a project-only install, copy it to that project's `.agents/skills` folder
instead:

```bash
project="/path/to/your/project"
dest="$project/.agents/skills/mcmaster-web-performance"
rm -rf "$dest"
mkdir -p "$(dirname "$dest")"
cp -R codex/mcmaster-web-performance "$dest"
```

### iOS and iPadOS

Codex local skills need a filesystem location such as `$HOME/.agents/skills` or a
project `.agents/skills` folder. iOS and iPadOS do not expose those paths for a
normal local-agent install, so install the Codex skill from Windows, macOS, or
Linux.

## Claude Code

Use this when you want Claude Code to find the skill automatically.

### Windows PowerShell

```powershell
$repo = Join-Path $env:TEMP "skills-mcmaster"
Remove-Item -Recurse -Force $repo -ErrorAction SilentlyContinue
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git $repo
Set-Location $repo
git sparse-checkout set claude/mcmaster-web-performance

$dest = Join-Path $env:USERPROFILE ".claude\skills\mcmaster-web-performance"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
Copy-Item -Recurse .\claude\mcmaster-web-performance $dest
```

### macOS and Linux

```bash
repo="$(mktemp -d)"
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git "$repo"
cd "$repo"
git sparse-checkout set claude/mcmaster-web-performance

dest="$HOME/.claude/skills/mcmaster-web-performance"
rm -rf "$dest"
mkdir -p "$(dirname "$dest")"
cp -R claude/mcmaster-web-performance "$dest"
```

### iOS and iPadOS

Claude Code local skills need `~/.claude/skills`, so install them from Windows,
macOS, or Linux.

## Claude.ai Custom Skill

Use the Claude folder, but upload it as a ZIP instead of copying it to a local
skills directory.

### Windows PowerShell

```powershell
$repo = Join-Path $env:TEMP "skills-mcmaster"
Remove-Item -Recurse -Force $repo -ErrorAction SilentlyContinue
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git $repo
Set-Location $repo
git sparse-checkout set claude/mcmaster-web-performance

$zip = Join-Path $env:USERPROFILE "Downloads\mcmaster-web-performance-claude.zip"
Remove-Item -Force $zip -ErrorAction SilentlyContinue
Compress-Archive -Path .\claude\mcmaster-web-performance\* -DestinationPath $zip
```

Upload `mcmaster-web-performance-claude.zip` as the custom skill.

### macOS and Linux

```bash
repo="$(mktemp -d)"
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git "$repo"
cd "$repo"
git sparse-checkout set claude/mcmaster-web-performance

zip="$HOME/Downloads/mcmaster-web-performance-claude.zip"
rm -f "$zip"
(cd claude/mcmaster-web-performance && zip -r "$zip" .)
```

Upload `mcmaster-web-performance-claude.zip` as the custom skill.

### iOS and iPadOS

If you are using Claude.ai in a browser, use the Claude skill folder, not the
Codex or `other` folders. Download the repository ZIP from GitHub, open it in
Files, compress `claude/mcmaster-web-performance`, and upload that ZIP as the
custom skill.

## Other Agents

Use this when your agent expects a folder containing `SKILL.md` and bundled
resources, but does not need Codex or Claude-specific metadata.

### Windows PowerShell

```powershell
$repo = Join-Path $env:TEMP "skills-mcmaster"
Remove-Item -Recurse -Force $repo -ErrorAction SilentlyContinue
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git $repo
Set-Location $repo
git sparse-checkout set other/mcmaster-web-performance

$dest = "$env:USERPROFILE\agent-skills\mcmaster-web-performance"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
Copy-Item -Recurse .\other\mcmaster-web-performance $dest
```

Point your agent at `$env:USERPROFILE\agent-skills\mcmaster-web-performance`,
or move that folder into the skills directory your agent expects.

### macOS and Linux

```bash
repo="$(mktemp -d)"
git clone --filter=blob:none --sparse https://github.com/joffewilliam/skills.git "$repo"
cd "$repo"
git sparse-checkout set other/mcmaster-web-performance

dest="$HOME/agent-skills/mcmaster-web-performance"
rm -rf "$dest"
mkdir -p "$(dirname "$dest")"
cp -R other/mcmaster-web-performance "$dest"
```

Point your agent at `$HOME/agent-skills/mcmaster-web-performance`, or move that
folder into the skills directory your agent expects.

### iOS and iPadOS

Use the `other/mcmaster-web-performance` folder only if your iOS agent supports
uploading or selecting a custom skill folder. If it only accepts text prompts,
open `other/mcmaster-web-performance/SKILL.md` and paste the skill instructions
into that agent.

## Demo

Aquatic Haven was built with this skill:

https://joffewilliam.github.io/aquatic-haven/
