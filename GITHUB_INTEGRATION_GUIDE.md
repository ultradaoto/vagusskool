# GitHub Integration Guide

Everything learned from setting up vagus-skool with GitHub. Use this to get another project up and running.

---

## 1. Choose Your Setup

### Option A: Start from GitHub (clone existing repo)

If the repo already exists on GitHub and you want a fresh copy:

```bash
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### Option B: Connect an existing folder to GitHub

If you have a local folder that isn't a git repo yet, or you want to sync it with a remote:

```bash
cd /path/to/your/project

# Initialize git
git init

# Add the remote (use SSH or HTTPS)
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git

# Fetch remote branches
git fetch origin

# Create local main branch tracking remote, overwrite local with remote content
git checkout -f -b main origin/main
```

**Note:** `-f` forces checkout and overwrites conflicting local files. Use only when you want the remote to win.

---

## 2. SSH vs HTTPS

### SSH (recommended for push/pull)

- **URL format:** `git@github.com:USERNAME/REPO.git`
- **Requires:** SSH key added to your GitHub account
- **Why:** No password prompts, works with 2FA, better for agents/automation

```bash
# Check current remote
git remote -v

# Switch to SSH
git remote set-url origin git@github.com:USERNAME/REPO.git
```

### HTTPS

- **URL format:** `https://github.com/USERNAME/REPO.git`
- **Requires:** Personal Access Token (PAT) instead of password
- **Why:** Simpler if you don't have SSH set up

---

## 3. Basic Workflow

```bash
# 1. Stage changes
git add -A                    # All files
git add path/to/file          # Specific file

# 2. Commit
git commit -m "feat: Add new feature"

# 3. Push
git push origin main
```

---

## 4. When Push Is Rejected

**Error:** `Updates were rejected because the remote contains work that you do not have locally`

Someone (or you from another machine) pushed to the remote. Integrate first:

```bash
# Pull remote changes and rebase your commits on top
git pull --rebase origin main

# Then push
git push origin main
```

**Alternative (merge instead of rebase):**

```bash
git pull origin main
git push origin main
```

---

## 5. .gitignore Essentials

Create or edit `.gitignore` so you don't commit:

```
node_modules/
.env
.DS_Store
npm-debug.log*
public/uploads/
```

---

## 6. First-Time Repo Setup on GitHub

1. Go to [github.com](https://github.com) → New repository
2. Name it (e.g. `my-project`)
3. Don't initialize with README if you're pushing existing code
4. Copy the repo URL (SSH or HTTPS)

Then locally:

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin git@github.com:USERNAME/my-project.git
git branch -M main
git push -u origin main
```

---

## 7. Quick Reference

| Task | Command |
|------|---------|
| Check status | `git status` |
| See remote URL | `git remote -v` |
| Change remote to SSH | `git remote set-url origin git@github.com:USER/REPO.git` |
| Pull latest | `git pull origin main` |
| Pull + rebase | `git pull --rebase origin main` |
| Push | `git push origin main` |
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |

---

## 8. Commit Message Conventions

Common prefixes for clear history:

- `feat:` New feature
- `fix:` Bug fix
- `chore:` Maintenance (deps, config, cleanup)
- `docs:` Documentation only
- `style:` Formatting, no code change

---

## 9. SSH Key Setup (if needed)

```bash
# Generate key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard (Windows PowerShell)
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

Then: GitHub → Settings → SSH and GPG keys → New SSH key → Paste.

---

## 10. Vagus Skool Specifics (for reference)

- **Repo:** `ultradaoto/vagusskool`
- **Remote:** `git@github.com:ultradaoto/vagusskool.git`
- **Branch:** `main`
- **Sync command:** `git pull --rebase origin main && git push origin main`
