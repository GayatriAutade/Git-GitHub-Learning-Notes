# Git & GitHub — Complete Learning Guide

**A comprehensive, beginner-to-intermediate handbook for mastering Git and GitHub from the ground up.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Learning Progress](https://img.shields.io/badge/Status-In%20Progress-yellow.svg)]()
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)]()

> "The best way to learn Git is to use it every day. This guide helps you do exactly that."

---

## Table of Contents

| # | Section |
|---|---------|
| 1 | [About This Repository](#1-about-this-repository) |
| 2 | [What is Version Control?](#2-what-is-version-control) |
| 3 | [What is Git?](#3-what-is-git) |
| 4 | [What is GitHub?](#4-what-is-github) |
| 5 | [Installing Git](#5-installing-git) |
| 6 | [Git Configuration](#6-git-configuration) |
| 7 | [Core Concepts](#7-core-concepts) |
| 8 | [Basic Git Commands](#8-basic-git-commands) |
| 9 | [The Git Workflow](#9-the-git-workflow) |
| 10 | [Branching & Merging](#10-branching--merging) |
| 11 | [Working with GitHub](#11-working-with-github) |
| 12 | [Undoing Mistakes](#12-undoing-mistakes) |
| 13 | [Command Reference Table](#13-command-reference-table) |
| 14 | [Daily Learning Notes](#14-daily-learning-notes) |
| 15 | [Roadmap — What's Next](#15-roadmap--whats-next) |
| 16 | [Resources](#16-resources) |
| 17 | [Contributing](#17-contributing) |

---

## 1. About This Repository

This repository is a **living learning journal** — a structured, daily-updated handbook that documents the complete journey of learning Git and GitHub from absolute zero.

### Who is this for?

- Complete beginners with no prior Git experience
- Developers who know a few commands but want to understand the "why"
- Anyone who wants a single reference they can come back to anytime

### What makes this guide different?

- Written in plain language — no jargon without explanation
- Every concept comes with a real-world analogy
- Commands are shown with context, not just syntax
- Mistakes and how to fix them are covered explicitly
- Updated daily with fresh notes and discoveries

---

## 2. What is Version Control?

Before understanding Git, it helps to understand the problem it solves.

Imagine you are writing a report. You save it as:

```
report.docx
report_final.docx
report_final_v2.docx
report_ACTUAL_final.docx
report_submit_this_one.docx
```

Every developer has done something like this with code. Version control solves this completely.

### Version Control Systems (VCS)

A **Version Control System** is software that:

- Tracks every change made to your files over time
- Lets you see who made a change, when, and why
- Allows you to revert to any previous state
- Enables multiple people to work on the same project without overwriting each other's work

### Types of Version Control

| Type | Description | Example |
|------|-------------|---------|
| Local | Tracks changes on your machine only | RCS |
| Centralized | One central server stores all history | SVN, CVS |
| Distributed | Every developer has the full history | **Git** |

Git is a **distributed** version control system — the most widely used in the world.

---

## 3. What is Git?

**Git** is a free, open-source, distributed version control system created by **Linus Torvalds** in 2005 (the same person who created Linux).

### Key Features

| Feature | What it means for you |
|---------|----------------------|
| Speed | Operations happen almost instantly, even on large projects |
| Distributed | Your full project history lives on your machine — no internet needed |
| Branching | Create isolated workspaces for features without touching the main code |
| Data integrity | Git uses cryptographic hashing — your history cannot be silently corrupted |
| Open source | Free forever, with a massive community |

### The Real-World Analogy

Think of Git as a **time machine for your code**:

- Every `commit` is a save point you can return to
- Every `branch` is a parallel timeline where you can experiment
- `merge` brings timelines back together

---

## 4. What is GitHub?

**GitHub** is a **cloud-based hosting platform** built on top of Git. It is where developers store, share, and collaborate on Git repositories.

### Git vs GitHub — The Key Difference

```
Git                         GitHub
----                        ------
A tool (software)           A platform (website)
Installed on your computer  Lives on the internet
Works completely offline    Requires internet connection
Created in 2005             Founded in 2008, acquired by Microsoft in 2018
Free & open source          Free tier + paid plans
```

### What GitHub adds on top of Git

- A web interface to browse your repository and history
- Pull Requests for code review before merging
- Issues for bug tracking and feature requests
- GitHub Actions for automating tests and deployments
- GitHub Pages for hosting websites directly from a repo
- A global developer community and profile/portfolio system

> **Key insight:** You can use Git without GitHub. GitHub cannot exist without Git. Git is the engine; GitHub is the dashboard.

---

## 5. Installing Git

### Windows

1. Download the installer from the official site:
   **https://git-scm.com/download/win**
2. Run the installer — the default options are fine for beginners
3. Git Bash (a terminal for Git on Windows) will be installed alongside

### macOS

**Option A — Homebrew (recommended):**
```bash
brew install git
```

**Option B — Direct download:**
https://git-scm.com/download/mac

### Linux — Ubuntu / Debian
```bash
sudo apt update
sudo apt install git -y
```

### Linux — Fedora / RHEL
```bash
sudo dnf install git
```

### Verify the installation
```bash
git --version
```

Expected output:
```
git version 2.43.0
```

Any version above 2.x is fine.

---

## 6. Git Configuration

Before making your first commit, tell Git who you are. This information is embedded into every commit you create.

### Required Setup (do this once)

```bash
# Set your name
git config --global user.name "Your Full Name"

# Set your email — use the same email as your GitHub account
git config --global user.email "you@example.com"
```

### Recommended Setup

```bash
# Set the default branch name to 'main' (modern standard)
git config --global init.defaultBranch main

# Set VS Code as the default editor
git config --global core.editor "code --wait"

# Enable colored output in the terminal
git config --global color.ui auto

# Set line ending handling (Windows)
git config --global core.autocrlf true

# Set line ending handling (macOS / Linux)
git config --global core.autocrlf input
```

### View Your Configuration

```bash
# View all settings
git config --list

# View a specific setting
git config user.name

# View where each setting is defined
git config --list --show-origin
```

### Configuration Levels

| Level | Flag | Scope | File Location |
|-------|------|-------|---------------|
| System | `--system` | All users on the machine | `/etc/gitconfig` |
| Global | `--global` | Your user account | `~/.gitconfig` |
| Local | `--local` | Current repository only | `.git/config` |

Local overrides Global, which overrides System.

---

## 7. Core Concepts

Understanding these four concepts is the foundation of everything in Git.

### The Three Areas of Git

```
+------------------+      git add      +------------------+      git commit      +------------------+
|                  | ----------------> |                  | ------------------> |                  |
|  Working         |                   |  Staging Area    |                     |  Repository      |
|  Directory       |                   |  (Index)         |                     |  (.git folder)   |
|                  | <---------------- |                  |                     |                  |
+------------------+   git restore     +------------------+                     +------------------+
     Your files            Files ready to be committed           Permanent snapshots (commits)
```

| Area | Description |
|------|-------------|
| **Working Directory** | Your actual files — what you see in your folder |
| **Staging Area** | A preparation zone — you choose which changes go into the next commit |
| **Repository** | The permanent history — all your commits stored in the `.git` folder |

### What is a Commit?

A **commit** is a snapshot of your staged changes at a point in time. It contains:

- A unique ID (SHA hash) like `a3f8c12`
- The author's name and email
- A timestamp
- A commit message describing the change
- A pointer to the previous commit (parent)

### What is a Repository?

A **repository** (or "repo") is a folder tracked by Git. It contains:

- All your project files
- The hidden `.git` folder with the entire history

### What is a Remote?

A **remote** is a version of your repository hosted somewhere else (like GitHub). `origin` is the conventional name for your primary remote.

---

## 8. Basic Git Commands

### Starting a Project

#### Initialize a new repository
```bash
git init
```
Creates a `.git` folder in the current directory. The project is now tracked by Git.

#### Clone an existing repository
```bash
git clone https://github.com/username/repository-name.git
```
Downloads the entire repository (all files + full history) to your machine.

```bash
# Clone into a specific folder name
git clone https://github.com/username/repo.git my-project
```

---

### Checking Status

#### See the current state of your repository
```bash
git status
```

Sample output:
```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        notes.txt
```

---

### Staging Changes

```bash
# Stage a specific file
git add README.md

# Stage multiple specific files
git add file1.txt file2.txt

# Stage all changes in the current directory
git add .

# Stage parts of a file interactively
git add -p README.md
```

---

### Committing Changes

```bash
# Commit with a message
git commit -m "Add introduction section to README"

# Stage all tracked files and commit in one step
git commit -am "Fix typo in configuration section"

# Open editor to write a detailed commit message
git commit
```

**Writing a great commit message:**

```
Short summary (50 characters or less)

More detailed explanation if needed. Wrap at 72 characters.
Explain WHAT changed and WHY, not HOW (the code shows how).

- Bullet points are fine
- Use present tense: "Add feature" not "Added feature"
```

---

### Viewing History

```bash
# Full detailed log
git log

# One line per commit
git log --oneline

# Visual graph of branches
git log --oneline --graph --all

# See changes introduced by each commit
git log -p

# Filter by author
git log --author="Your Name"

# Filter by date
git log --since="2024-01-01" --until="2024-12-31"

# Search commit messages
git log --grep="fix"
```

---

### Viewing Differences

```bash
# Changes in working directory (not yet staged)
git diff

# Changes in staging area (staged, not yet committed)
git diff --staged

# Compare two commits
git diff abc123 def456

# Compare two branches
git diff main feature-branch
```

---

## 9. The Git Workflow

### The Standard Daily Workflow

```
   Start of day
        |
        v
   git pull                  <-- Get latest changes from GitHub
        |
        v
   Edit your files           <-- Do your work
        |
        v
   git status                <-- See what changed
        |
        v
   git add .                 <-- Stage the changes
        |
        v
   git commit -m "..."       <-- Save a snapshot locally
        |
        v
   git push                  <-- Upload to GitHub
        |
        v
   End of day
```

### The Feature Branch Workflow (Team Standard)

```
   main branch (stable, always working)
        |
        +-----> git switch -c feature/login
        |                |
        |          [ write code ]
        |          [ commit, commit, commit ]
        |                |
        |          git push origin feature/login
        |                |
        |          [ Open Pull Request on GitHub ]
        |                |
        |          [ Code review by teammates ]
        |                |
        +<----- Merge Pull Request into main
```

---

## 10. Branching & Merging

Branching is one of Git's most powerful features. It lets you work in isolation without risking the stable codebase.

### Understanding Branches

```
A---B---C  (main)
         \
          D---E---F  (feature/signup)
```

- Each letter represents a commit
- `main` and `feature/signup` share history up to commit C
- Changes on `feature/signup` do not affect `main`

### Branch Commands

```bash
# List all local branches (* marks the current one)
git branch

# List all branches including remote
git branch -a

# Create a new branch
git branch feature/user-auth

# Switch to a branch
git switch feature/user-auth

# Create and switch in one step (most common)
git switch -c feature/user-auth

# Rename the current branch
git branch -m new-name

# Delete a branch (safe — fails if unmerged)
git branch -d feature/user-auth

# Force delete a branch
git branch -D feature/user-auth

# Push a branch to GitHub
git push origin feature/user-auth

# Set upstream and push
git push -u origin feature/user-auth
```

### Merging

```bash
# Switch to the branch you want to merge INTO
git switch main

# Merge the feature branch
git merge feature/user-auth
```

### Types of Merges

**Fast-forward merge** — no diverging history, Git simply moves the pointer forward:

```
Before:  A---B---C (main)
                  \
                   D---E (feature)

After:   A---B---C---D---E (main)
```

**Three-way merge** — both branches have unique commits, Git creates a merge commit:

```
Before:  A---B---C (main)
              \
               D---E (feature)

After:   A---B---C---F (main)
              \      /
               D---E
```

### Resolving Merge Conflicts

A conflict happens when two branches change the same part of the same file.

```bash
# After running git merge and getting a conflict:

# 1. See which files have conflicts
git status

# 2. Open the conflicted file — it will look like this:
<<<<<<< HEAD
This is the content from main branch.
=======
This is the content from the feature branch.
>>>>>>> feature/user-auth

# 3. Edit the file to keep what you want, delete the markers
# 4. Stage the resolved file
git add filename.txt

# 5. Complete the merge
git commit
```

---

## 11. Working with GitHub

### Connecting to GitHub

```bash
# Add a remote repository
git remote add origin https://github.com/username/repo.git

# View remotes
git remote -v

# Change the remote URL
git remote set-url origin https://github.com/username/new-repo.git

# Remove a remote
git remote remove origin
```

### Pushing and Pulling

```bash
# Push commits to GitHub
git push

# First push — set the upstream branch
git push -u origin main

# Pull latest changes (fetch + merge)
git pull

# Fetch without merging (safer)
git fetch origin

# Apply fetched changes manually
git merge origin/main
```

### Forks and Pull Requests

The standard open source contribution workflow:

```
1. Fork the repo on GitHub (creates your own copy)
2. Clone your fork locally
   git clone https://github.com/your-username/repo.git

3. Add the original repo as upstream
   git remote add upstream https://github.com/original-owner/repo.git

4. Create a feature branch
   git switch -c fix/broken-link

5. Make changes and commit them
   git add .
   git commit -m "Fix broken documentation link"

6. Push your branch to your fork
   git push origin fix/broken-link

7. Open a Pull Request on GitHub from your branch to the original repo
8. Respond to review feedback with new commits
9. Maintainer merges the PR
```

### Keeping Your Fork Updated

```bash
# Fetch latest changes from the original repo
git fetch upstream

# Merge them into your local main
git switch main
git merge upstream/main

# Push the updated main to your fork
git push origin main
```

---

## 12. Undoing Mistakes

Everyone makes mistakes. Git makes them recoverable.

### Undo Before Staging (Working Directory)

```bash
# Discard all changes in a file (irreversible)
git restore filename.txt

# Discard all unstaged changes everywhere
git restore .
```

### Undo After Staging (Before Commit)

```bash
# Unstage a file (keep the changes in working directory)
git restore --staged filename.txt

# Unstage everything
git restore --staged .
```

### Undo After Committing

```bash
# Undo the last commit, keep changes staged
git reset --soft HEAD~1

# Undo the last commit, keep changes unstaged
git reset --mixed HEAD~1

# Undo the last commit and discard all changes (permanent)
git reset --hard HEAD~1
```

### Safe Undo — Revert (Use in Shared Repos)

`reset` rewrites history. Never use it on commits already pushed to a shared branch.
`revert` is safe — it creates a new commit that undoes the previous one.

```bash
# Safely undo a specific commit
git revert abc1234

# Undo without opening the editor
git revert abc1234 --no-edit
```

### Fix the Last Commit Message

```bash
git commit --amend -m "Corrected commit message"
```

### Temporarily Save Work in Progress

```bash
# Stash your current changes
git stash

# See all stashes
git stash list

# Bring back the most recent stash
git stash pop

# Bring back a specific stash
git stash apply stash@{2}

# Stash with a descriptive label
git stash push -m "Half-finished login feature"
```

### Summary — Which Undo Command to Use?

| Situation | Command |
|-----------|---------|
| File not staged yet, want to discard | `git restore <file>` |
| File is staged, want to unstage | `git restore --staged <file>` |
| Last commit wrong message | `git commit --amend` |
| Undo last commit, keep files | `git reset --soft HEAD~1` |
| Undo a pushed commit safely | `git revert <hash>` |
| Temporarily shelve work | `git stash` |

---

## 13. Command Reference Table

### Setup & Configuration

| Command | Description |
|---------|-------------|
| `git config --global user.name "Name"` | Set your name |
| `git config --global user.email "email"` | Set your email |
| `git config --list` | View all settings |

### Starting a Project

| Command | Description |
|---------|-------------|
| `git init` | Initialize a new repository |
| `git clone <url>` | Clone a remote repository |

### Core Workflow

| Command | Description |
|---------|-------------|
| `git status` | Show working tree status |
| `git add <file>` | Stage a specific file |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit staged changes |
| `git commit --amend` | Edit the last commit |

### Viewing History & Differences

| Command | Description |
|---------|-------------|
| `git log` | Full commit history |
| `git log --oneline` | Compact commit history |
| `git log --oneline --graph --all` | Visual branch history |
| `git diff` | Unstaged changes |
| `git diff --staged` | Staged changes |
| `git show <hash>` | Show a specific commit |

### Branching

| Command | Description |
|---------|-------------|
| `git branch` | List local branches |
| `git branch <name>` | Create a new branch |
| `git switch <name>` | Switch to a branch |
| `git switch -c <name>` | Create and switch |
| `git merge <branch>` | Merge branch into current |
| `git branch -d <name>` | Delete a branch |

### Remote Repositories

| Command | Description |
|---------|-------------|
| `git remote -v` | List remotes |
| `git remote add origin <url>` | Add a remote |
| `git push -u origin main` | Push and set upstream |
| `git push` | Push to remote |
| `git pull` | Fetch and merge from remote |
| `git fetch` | Fetch without merging |

### Undoing

| Command | Description |
|---------|-------------|
| `git restore <file>` | Discard working dir changes |
| `git restore --staged <file>` | Unstage a file |
| `git reset --soft HEAD~1` | Undo commit, keep staged |
| `git reset --hard HEAD~1` | Undo commit, discard changes |
| `git revert <hash>` | Safely undo a commit |
| `git stash` | Shelve current changes |
| `git stash pop` | Restore stashed changes |

---

## 14. Daily Learning Notes

> This section is updated daily. Each entry captures what was learned, what was confusing, and what clicked.

---

### Day 1 — Setup & First Repository
**Date:** ___________

**Covered:**
- Installed Git and verified with `git --version`
- Configured name and email with `git config`
- Learned the difference between Git and GitHub
- Ran `git init` for the first time — understood what `.git` does

**Key insight:** Git is local. GitHub is remote. They are separate things.

**Command I used most:** `git status`

---

### Day 2 — The Staging Area
**Date:** ___________

**Covered:**
- Understood the three areas: Working Directory, Staging Area, Repository
- Used `git add` and `git commit` for the first time
- Pushed to GitHub with `git push -u origin main`
- Learned what `git status` is telling me

**Key insight:** Staging is intentional — you choose exactly what goes into each commit. Not everything has to go in at once.

**What confused me:** Why do I need to `git add` before `git commit`? Now I understand — you might have many changes, but only want some of them in this commit.

---

### Day 3 — Branching
**Date:** ___________

**Covered:**
- Created a branch with `git switch -c feature/test`
- Made commits on the branch without affecting main
- Merged the branch back with `git merge`
- Deleted the branch with `git branch -d`

**Key insight:** Branches are just pointers to commits. They are extremely lightweight — creating one takes milliseconds.

---

> Add your own entries below as you continue learning:

### Day 4 — 
**Date:** ___________

**Covered:**

**Key insight:**

**What confused me:**

---

## 15. Roadmap — What's Next

Track your progress through the Git & GitHub learning journey.

### Foundations (Week 1–2)
- [x] Install and configure Git
- [x] Understand version control concepts
- [x] Create repos with `git init` and `git clone`
- [x] Use `git add`, `git commit`, `git push`, `git pull`
- [x] Read `git status` and `git log` output
- [x] Create, switch, merge, and delete branches

### Intermediate (Week 3–4)
- [ ] Resolve merge conflicts confidently
- [ ] Use `git stash` for work in progress
- [ ] Understand `git fetch` vs `git pull`
- [ ] Use `git revert` and `git reset` appropriately
- [ ] Write meaningful, structured commit messages
- [ ] Set up SSH authentication with GitHub

### Collaboration (Week 5–6)
- [ ] Fork a repository and submit a Pull Request
- [ ] Review someone else's Pull Request
- [ ] Understand the GitHub Flow (branch -> PR -> review -> merge)
- [ ] Use GitHub Issues for tracking tasks
- [ ] Protect the `main` branch with branch rules

### Advanced (Week 7–8)
- [ ] Understand and use `git rebase`
- [ ] Use `git cherry-pick` to apply specific commits
- [ ] Work with Git tags for versioning
- [ ] Set up GitHub Actions for CI/CD
- [ ] Use `git bisect` to find bugs
- [ ] Understand `git reflog` for recovery

### Expert Level
- [ ] Write custom Git hooks
- [ ] Manage Git submodules
- [ ] Understand Git internals (objects, trees, blobs)
- [ ] Contribute to open source projects
- [ ] Review and improve team Git workflows

---

## 16. Resources

### Official Documentation
- **Git Reference Manual** — https://git-scm.com/docs
- **Pro Git Book (free)** — https://git-scm.com/book/en/v2
- **GitHub Docs** — https://docs.github.com

### Interactive Learning
- **Learn Git Branching** (visual, interactive) — https://learngitbranching.js.org
- **GitHub Skills** — https://skills.github.com
- **Atlassian Git Tutorials** — https://www.atlassian.com/git/tutorials

### Quick References
- **Git Cheat Sheet (GitHub)** — https://education.github.com/git-cheat-sheet-education.pdf
- **Oh Shit, Git!** (fixing mistakes) — https://ohshitgit.com

### Tools
- **GitHub Desktop** — GUI client for Git — https://desktop.github.com
- **GitKraken** — Visual Git client — https://www.gitkraken.com
- **VS Code** — Built-in Git support — https://code.visualstudio.com

---

## 17. Contributing

This is a personal learning repository, but improvements and corrections are always welcome.

```bash
# 1. Fork this repository on GitHub

# 2. Clone your fork
git clone https://github.com/your-username/Git-GitHub-Learning-Notes.git

# 3. Create a branch
git switch -c improve/add-rebase-notes

# 4. Make your changes

# 5. Stage and commit
git add .
git commit -m "Add notes on git rebase workflow"

# 6. Push to your fork
git push origin improve/add-rebase-notes

# 7. Open a Pull Request on GitHub
```

Please follow these guidelines:
- Keep language beginner-friendly
- Include examples with every command
- Explain the "why", not just the "what"
- Verify all commands before submitting

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, copy, modify, and distribute this material for any purpose.

---

**Repository maintained by [Gayatri Autade](https://github.com/GayatriAutade)**

*Start where you are. Use what you have. Do what you can. Commit often.*
