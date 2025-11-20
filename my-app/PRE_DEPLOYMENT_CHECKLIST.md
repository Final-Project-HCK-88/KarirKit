# Pre-Deployment Checklist

## ✅ Before Deploying to Vercel

### 1. Code Quality

- [ ] Run `npm run build` locally - should pass without errors
- [ ] Run `npm run lint` - fix any critical warnings
- [ ] Test all major features locally
- [ ] Remove `console.log` for production (optional)
- [ ] Check for TODO comments in code

### 2. Environment Variables

- [ ] Copy all env variables from `.env` file
- [ ] Generate NEW `NEXTAUTH_SECRET` for production (use: `openssl rand -base64 32`)
- [ ] Prepare `NEXTAUTH_URL` (will be Vercel URL)
- [ ] Verify all API keys are valid and have sufficient quota
- [ ] Double-check MongoDB connection string

### 3. External Services Setup

#### MongoDB Atlas

- [ ] Database is accessible (not localhost)
- [ ] Network Access: Add `0.0.0.0/0` to IP whitelist
- [ ] Database user has read/write permissions
- [ ] Connection string tested

#### Google OAuth

- [ ] OAuth 2.0 Client ID created
- [ ] Authorized redirect URIs ready to add Vercel URL
- [ ] Client ID and Secret noted

#### Cloudinary

- [ ] Account created and verified
- [ ] CLOUDINARY_URL format correct: `cloudinary://api_key:api_secret@cloud_name`
- [ ] Folder `karirkit/cv-images` created (optional)

#### n8n Webhook

- [ ] Webhook URL is publicly accessible
- [ ] Webhook tested and working
- [ ] Returns expected format

#### API Keys Ready

- [ ] Gemini API Key (https://aistudio.google.com/apikey)
- [ ] OpenAI API Key (https://platform.openai.com/api-keys)
- [ ] Tavily API Key (https://tavily.com)
- [ ] Google Vision API Key (optional)

### 4. Git Repository

- [ ] All changes committed
- [ ] Pushed to GitHub/GitLab
- [ ] Branch is `main`, `master`, or `dev`
- [ ] `.env` file is in `.gitignore` (DO NOT commit secrets!)
- [ ] Repository is accessible to Vercel

### 5. Dependencies

- [ ] All dependencies in `package.json`
- [ ] No dev dependencies needed for runtime
- [ ] Run `npm install` to verify lock file is updated
- [ ] Check for security vulnerabilities: `npm audit`

### 6. Configuration Files

- [ ] `next.config.ts` - correct image domains
- [ ] `vercel.json` - present with correct settings
- [ ] `.gitignore` - includes `.env` and `.env.local`
- [ ] `package.json` - correct build script

### 7. Database Collections

Ensure these collections exist in MongoDB:

- [ ] `users` - for authentication
- [ ] `resumes` - for uploaded files
- [ ] `analyses` - for analysis results
- [ ] Vector indexes created if using search

### 8. Testing Locally

Before deploying, test these features:

- [ ] User registration
- [ ] User login
- [ ] Google sign-in
- [ ] File upload (PDF)
- [ ] Contract analysis
- [ ] View history
- [ ] View analysis results
- [ ] Delete uploaded files

### 9. Vercel Account

- [ ] Vercel account created
- [ ] GitHub/GitLab connected to Vercel
- [ ] Payment method added (if using Pro features)
- [ ] Team access configured (if applicable)

### 10. Post-Deployment Plan

- [ ] Plan to update `NEXTAUTH_URL` after first deploy
- [ ] Plan to add Vercel URL to Google OAuth
- [ ] Test plan for production environment
- [ ] Monitoring/logging strategy
- [ ] Backup strategy for database

---

## 🚀 Ready to Deploy?

If all boxes are checked, you're ready!

### Quick Deploy Steps:

1. **Via Vercel Dashboard**:

   - Go to https://vercel.com/new
   - Import repository
   - Set root directory to `my-app`
   - Add environment variables
   - Deploy!

2. **Via CLI** (from my-app directory):
   ```bash
   vercel
   ```

---

## 📋 Environment Variables to Copy

Use this template when adding to Vercel:

```env
MONGODB_URI=
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
GEMINI_EMBEDDING_MODEL=text-embedding-004
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
USE_OPENAI=true
USE_OPENAI_EMBEDDINGS=true
ATLAS_VECTOR_INDEX_NAME=vector_index
CLOUDINARY_URL=
N8N_WEBHOOK_URL=
GOOGLE_VISION_API_KEY=
TAVILY_API_KEY=
```

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Deploying with `localhost` MongoDB URI
2. ❌ Forgetting to add environment variables
3. ❌ Wrong root directory (should be `my-app`)
4. ❌ Not updating `NEXTAUTH_URL` after deployment
5. ❌ Not adding Vercel URL to Google OAuth
6. ❌ Committing `.env` file to Git
7. ❌ Using same secrets for dev and production

---

## 🆘 Emergency Rollback

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **•••** → **Promote to Production**

Or via CLI:

```bash
vercel rollback
```

---

Good luck! 🍀
