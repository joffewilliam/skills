# Public Skills

This repo collects reusable agent skills. For now it includes one skill,
published in three formats so people can grab the version that matches their
harness:

- [`codex/mcmaster-web-performance`](./codex/mcmaster-web-performance/) -
  Codex-ready skill with OpenAI UI metadata.
- [`claude/mcmaster-web-performance`](./claude/mcmaster-web-performance/) -
  Claude-ready skill with shorter frontmatter for Claude custom skills.
- [`other/mcmaster-web-performance`](./other/mcmaster-web-performance/) -
  harness-neutral copy for agents that can read a `SKILL.md` folder.

Each version builds fast, McMaster-Carr-style websites with an app shell,
inlined critical CSS, immutable assets, and prefetch-on-hover navigation.

## Install For Codex

Clone this repository, then copy the Codex skill into a project-local skills
folder:

```bash
git clone https://github.com/joffewilliam/skills.git
mkdir -p .agents/skills
cp -R skills/codex/mcmaster-web-performance .agents/skills/
```

For a user-local install, copy it to your Codex skills directory instead:

```bash
mkdir -p ~/.codex/skills
cp -R skills/codex/mcmaster-web-performance ~/.codex/skills/
```

On Windows PowerShell:

```powershell
git clone https://github.com/joffewilliam/skills.git
New-Item -ItemType Directory -Force .\.agents\skills
Copy-Item -Recurse .\skills\codex\mcmaster-web-performance .\.agents\skills\

New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills"
Copy-Item -Recurse .\skills\codex\mcmaster-web-performance "$env:USERPROFILE\.codex\skills\"
```

## Install For Claude

For Claude Code, copy the Claude skill into your Claude skills directory:

```bash
git clone https://github.com/joffewilliam/skills.git
mkdir -p ~/.claude/skills
cp -R skills/claude/mcmaster-web-performance ~/.claude/skills/
```

For Claude.ai custom skills, zip the contents of
`claude/mcmaster-web-performance` and upload that ZIP as a custom skill.

## Other Harnesses

Use [`other/mcmaster-web-performance`](./other/mcmaster-web-performance/) when
your agent or harness expects a folder containing `SKILL.md` plus bundled
resources, but does not need Codex or Claude-specific metadata.

## Demo

The first demo site built with this skill is Aquatic Haven:

https://joffewilliam.github.io/aquatic-haven/
