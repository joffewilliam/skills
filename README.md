# Public Skills

This repo collects reusable Codex/agent skills. For now it includes one skill:

- [`mcmaster-web-performance`](./mcmaster-web-performance/) - build fast,
  McMaster-Carr-style websites with an app shell, inlined critical CSS,
  immutable assets, and prefetch-on-hover navigation.

## Install

Clone this repository, then copy the skill folder into your local Codex skills
directory:

```bash
git clone https://github.com/joffewilliam/skills.git
mkdir -p ~/.codex/skills
cp -R skills/mcmaster-web-performance ~/.codex/skills/
```

On Windows PowerShell:

```powershell
git clone https://github.com/joffewilliam/skills.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills"
Copy-Item -Recurse .\skills\mcmaster-web-performance "$env:USERPROFILE\.codex\skills\"
```

## Demo

The first demo site built with this skill is Aquatic Haven:

https://joffewilliam.github.io/aquatic-haven/
