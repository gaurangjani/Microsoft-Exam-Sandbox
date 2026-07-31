# GitHub Actions Workflow Setup

This guide walks you through setting up automatic Vercel deployments via GitHub Actions.

---

## What the Workflow Does

On every push to `main` or `Dev` branches:
- ✅ Build the Next.js project
- ✅ Deploy to Vercel (production on `main`, preview on `Dev`)
- ✅ Report deployment status

**No more manual Vercel deployments** — just `git push` and watch it deploy!

---

## Setup Steps

### Step 1: Get Vercel Tokens

1. Go to https://vercel.com/account/tokens
2. Click "Create" → "New Token"
3. Name it: `GITHUB_ACTIONS_DEPLOY`
4. Select scope: Full access (or your entire account)
5. Copy the token (starts with `ver_`)
6. Keep it safe — you'll add it to GitHub

### Step 2: Get Vercel Project ID

1. Go to https://vercel.com/dashboard
2. Select your `Microsoft-Exam-Sandbox` project
3. Click "Settings" → "General"
4. Copy the "Project ID" (UUID format)

### Step 3: Get Vercel Org ID

1. Still in project settings
2. Look for "Team" (or org name)
3. Go to https://vercel.com/account/team-settings
4. Copy the "Team ID" (UUID format)
   - If you don't see it, it's usually your username (for personal accounts)

### Step 4: Add GitHub Secrets

1. Go to your GitHub repo: `https://github.com/gaurangjani/Microsoft-Exam-Sandbox`
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"

Add 3 secrets:

**Secret 1: VERCEL_TOKEN**
- Name: `VERCEL_TOKEN`
- Value: `ver_...` (token from Step 1)
- Click "Add secret"

**Secret 2: VERCEL_PROJECT_ID**
- Name: `VERCEL_PROJECT_ID`
- Value: `xxx-xxx-xxx` (Project ID from Step 2)
- Click "Add secret"

**Secret 3: VERCEL_ORG_ID**
- Name: `VERCEL_ORG_ID`
- Value: `xxx-xxx-xxx` or username (Org ID from Step 3)
- Click "Add secret"

---

## Verify Setup

### Test the Workflow

1. Make a small commit on `Dev` branch:
   ```bash
   git checkout Dev
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "Test workflow"
   git push origin Dev
   ```

2. Go to GitHub Actions tab: `https://github.com/gaurangjani/Microsoft-Exam-Sandbox/actions`

3. You should see the workflow running:
   - Look for "Deploy to Vercel" job
   - Wait for it to complete (2-3 min)
   - Check for green ✅ checkmark

4. If successful:
   - Workflow shows "Deploy to Vercel" passed
   - Vercel shows a new "Preview" deployment
   - Share the preview URL

5. If failed:
   - Click the workflow to see logs
   - Common issues:
     - Missing secrets (check all 3 are added)
     - Wrong Project ID or Org ID
     - Token is invalid

### Clean Up

```bash
git rm TEST.md
git commit -m "Remove test file"
git push origin Dev
```

---

## Deployment Behavior

### Pushing to `Dev` Branch
- Workflow deploys to **Vercel Preview**
- Creates a unique preview URL (e.g., `exam-sim-pr-3.vercel.app`)
- Good for testing before merging to main
- Share preview URL with others to test

### Pushing to `main` Branch
- Workflow deploys to **Vercel Production**
- Updates your main app URL
- This is your live URL

### Example Workflow

```bash
# 1. Work on Dev
git checkout Dev
git add .
git commit -m "Add new feature"
git push origin Dev

# GitHub Actions auto-deploys to preview
# Test the feature at preview URL

# 2. When ready, merge to main
git checkout main
git merge Dev
git push origin main

# GitHub Actions auto-deploys to production
# Live update within 2-3 minutes!
```

---

## Troubleshooting

### "Deploy to Vercel" workflow shows red ❌

**Check 1: Secrets are set correctly**
- Go to Settings → Secrets → Actions
- Verify all 3 secrets exist (VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_ORG_ID)
- Secrets show as dots: ● (this is normal)
- If missing, add them

**Check 2: Token is still valid**
- Go to https://vercel.com/account/tokens
- Verify your token hasn't expired
- If expired, create a new one and update the secret

**Check 3: Project ID and Org ID are correct**
- Go to your Vercel project
- Settings → General
- Double-check the IDs match your secrets

**Check 4: Review logs**
- Click the failed workflow
- Expand "Deploy to Vercel" step
- Look for error message
- Common: `401 Unauthorized` (token is invalid)

### Workflow succeeds but Vercel shows error

- Go to Vercel dashboard
- Find the failed deployment
- Click "Build Logs" tab
- Look for Node/npm errors
- Usually: missing env vars or build failure

**Solution**: Fix the build locally first
```bash
npm run build  # Must pass
git push       # Then push to GitHub
```

### Want to disable automatic deployment?

1. Go to Settings → Actions → General
2. Uncheck "Allow GitHub Actions"
3. Or delete `.github/workflows/deploy.yml`

---

## Advanced: Custom Deployment Strategies

### Deploy only certain branches

Edit `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches:
      - main
      - production
      - staging
```

### Deploy on pull request (for review)

Add to workflow:
```yaml
on:
  push:
    branches: [main, Dev]
  pull_request:
    branches: [main]
```

### Deploy with environment secrets

For production vs preview environment secrets:

1. Go to Settings → Environments
2. Create "production" environment
3. Require approval before deploy
4. Add production secrets
5. Reference in workflow:
   ```yaml
   environment:
     name: production
     url: https://exam-sim.vercel.app
   ```

---

## Support

**Workflow not running?**
- Check GitHub Actions is enabled (Settings → Actions)
- Verify `.github/workflows/deploy.yml` exists
- Check branch push was to `main` or `Dev`

**Deployment failed?**
- Check Vercel logs: https://vercel.com/dashboard
- Check workflow logs: GitHub Actions tab
- Make sure build passes locally: `npm run build`

**Need help?**
- Vercel docs: https://vercel.com/docs/deployments/managed-deployments
- GitHub Actions docs: https://docs.github.com/actions

---

## After Setup is Complete

You're done! Now:

1. **Never manually deploy** — just push to GitHub
2. **Dev branch** = preview/testing
3. **Main branch** = live production
4. **Check deployments** at Vercel dashboard

Enjoy automatic deployments! 🚀
