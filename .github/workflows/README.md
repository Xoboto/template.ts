# Workflow templates for template.ts

This directory contains GitHub Actions workflows for the template.ts project.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Triggers:** Push to main/develop, Pull Requests, Releases

**Jobs:**
- **Test & Build**: Tests on Node.js 16, 18, 20
- **Coverage**: Code coverage reporting with Codecov
- **Security**: NPM audit + CodeQL analysis
- **Publish NPM**: Auto-publish on GitHub releases
- **Deploy Docs**: Deploy examples to GitHub Pages
- **Auto-merge**: Auto-merge Dependabot patch updates

### 2. Release Workflow (`release.yml`)
**Triggers:** Git tags starting with 'v'

**Features:**
- Creates GitHub releases automatically
- Generates changelog from commits
- Uploads build artifacts

### 3. Dependency Updates (`dependencies.yml`)
**Triggers:** Weekly schedule (Mondays) + Manual

**Features:**
- Updates all dependencies
- Runs security audits
- Creates PR with changes
- Runs full test suite

### 4. Performance Benchmark (`benchmark.yml`)
**Triggers:** Push to main, Pull Requests

**Features:**
- Runs performance benchmarks
- Comments results on PRs
- Tracks performance regressions

## Setup Requirements

### GitHub Secrets
Add these secrets in your repository settings:

1. **NPM_TOKEN**: Your NPM publishing token
   ```bash
   npm token create --read-only=false
   ```

2. **CODECOV_TOKEN**: Token from codecov.io (optional)
   - Sign up at https://codecov.io
   - Add your repository
   - Copy the token

### GitHub Settings

1. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. **Enable Dependabot**:
   - Go to Settings → Security & analysis
   - Enable Dependabot alerts and security updates

3. **Branch Protection**:
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Require status checks to pass
   - Require branches to be up to date

## Usage

### Creating a Release
```bash
# Tag and push
git tag v1.0.1
git push origin v1.0.1

# Or use GitHub CLI
gh release create v1.0.1 --title "Release v1.0.1" --notes "Bug fixes and improvements"
```

### Manual Workflow Triggers
```bash
# Trigger dependency update
gh workflow run dependencies.yml

# Trigger benchmark
gh workflow run benchmark.yml
```

### Status Badges
Add these to your README.md:

```markdown
[![CI/CD](https://github.com/Xoboto/template.ts/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/Xoboto/template.ts/actions)
[![Coverage](https://codecov.io/gh/Xoboto/template.ts/branch/main/graph/badge.svg)](https://codecov.io/gh/Xoboto/template.ts)
[![npm version](https://badge.fury.io/js/template.ts.svg)](https://badge.fury.io/js/template.ts)
```

## Workflow Features

✅ **Multi-Node Testing** - Tests on Node.js 16, 18, 20
✅ **Type Safety** - TypeScript type checking
✅ **Code Quality** - ESLint + Prettier
✅ **Security** - NPM audit + CodeQL
✅ **Coverage** - Code coverage tracking
✅ **Auto Deploy** - Examples to GitHub Pages
✅ **Auto Publish** - NPM on releases
✅ **Dependency Updates** - Weekly automated updates
✅ **Performance** - Benchmark tracking
✅ **Auto-merge** - Dependabot integration