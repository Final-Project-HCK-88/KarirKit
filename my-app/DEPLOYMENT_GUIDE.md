# Deployment Guide - Vercel

## 🚀 Quick Deploy to Vercel

### Prerequisites

- ✅ GitHub repository with your code
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ All environment variables ready

---

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository: `Final-Project-HCK-88/KarirKit`
4. Click **Import**

### Step 2: Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `my-app`

> ⚠️ Important: Your Next.js app is in a subfolder, not root

**Build Settings**:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Step 3: Environment Variables

Click **Environment Variables** and add ALL of these:

```env
# Database
MONGODB_URI=mongodb+srv://karirkit_db:Hacktiv8@karirkit-88.aarqpl5.mongodb.net/?appName=KarirKit-88

# Authentication
JWT_SECRET=KarirKit_HCK_88
NEXTAUTH_SECRET=generate-new-secret-for-production
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# AI - Gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_EMBEDDING_MODEL=text-embedding-004

# AI - OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
USE_OPENAI=true
USE_OPENAI_EMBEDDINGS=true

# Vector Search
ATLAS_VECTOR_INDEX_NAME=vector_index

# Cloud Storage
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# PDF Processing
N8N_WEBHOOK_URL=https://your-n8n.cloud/webhook/pdf-extract
GOOGLE_VISION_API_KEY=your-vision-api-key

# Web Search
TAVILY_API_KEY=your-tavily-api-key
```

### Step 4: Deploy

1. Click **Deploy**
2. Wait 2-5 minutes for build to complete
3. Get your deployment URL: `https://your-app.vercel.app`

---

## Method 2: Deploy via CLI

### Install Vercel CLI

```bash
npm i -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy from my-app directory

```bash
cd my-app
vercel
```

Follow the prompts:

- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N (first time) or Y (redeployment)
- **What's your project's name?** karirkit
- **In which directory is your code located?** `./` (you're already in my-app)

### Add Environment Variables via CLI

```bash
vercel env add MONGODB_URI
# Paste value when prompted

vercel env add JWT_SECRET
# Repeat for all env variables...
```

### Deploy to Production

```bash
vercel --prod
```

---

## Post-Deployment Steps

### 1. Update NEXTAUTH_URL

After first deployment, update environment variable:

```bash
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

Then redeploy:

```bash
vercel --prod
```

### 2. Configure Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
5. **Save**

### 3. Configure MongoDB IP Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. **Network Access** → **IP Access List**
3. Add IP: `0.0.0.0/0` (allows all - Vercel uses dynamic IPs)
   > ⚠️ For better security, use MongoDB Atlas App Services or configure Network Peering

### 4. Test Your Deployment

Visit your Vercel URL and test:

- ✅ Homepage loads
- ✅ Login works
- ✅ Google OAuth works
- ✅ File upload works
- ✅ Contract analysis works
- ✅ All API endpoints respond

---

## Troubleshooting

### Build Failed

**Error**: Module not found

- **Fix**: Make sure all dependencies are in `package.json`
- Run: `npm install` locally first

**Error**: Environment variable not found

- **Fix**: Add missing env variables in Vercel dashboard

### Runtime Errors

**Error**: MongoDB connection timeout

- **Fix**: Whitelist `0.0.0.0/0` in MongoDB Atlas

**Error**: NextAuth redirect mismatch

- **Fix**: Update `NEXTAUTH_URL` to match your Vercel domain
- **Fix**: Add Vercel URL to Google OAuth redirect URIs

**Error**: API timeout

- **Fix**: Increase timeout in `vercel.json` (already set to 60s)

### Performance Issues

**Slow cold starts**

- Consider upgrading to Vercel Pro for better performance
- Enable Edge Functions for faster response

**Image optimization**

- Already configured in `next.config.ts` for Cloudinary

---

## Custom Domain (Optional)

### Add Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `karirkit.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` to your custom domain
6. Update Google OAuth redirect URIs

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main`/`master`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Manual Redeploy

Via Dashboard:

1. Go to **Deployments**
2. Click **•••** on latest deployment
3. Click **Redeploy**

Via CLI:

```bash
cd my-app
vercel --prod
```

---

## Environment-Specific Variables

You can set different values for:

- **Production**: Live environment
- **Preview**: Branch/PR deployments
- **Development**: Local development

Example:

```bash
# Production only
vercel env add MONGODB_URI production

# All environments
vercel env add JWT_SECRET production preview development
```

---

## Monitoring & Logs

### View Logs

**Via Dashboard**:

1. Go to **Project** → **Deployments**
2. Click on deployment
3. View **Build Logs** and **Function Logs**

**Via CLI**:

```bash
vercel logs
```

### Analytics

Enable analytics in **Project Settings** → **Analytics**

---

## Security Checklist

- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Use strong `JWT_SECRET`
- [ ] Configure CORS if needed
- [ ] Set up MongoDB IP whitelist properly
- [ ] Enable Vercel Authentication (if team project)
- [ ] Review all environment variables are set
- [ ] Test Google OAuth with production URL
- [ ] Monitor API usage (Gemini, OpenAI, Tavily)

---

## Cost Considerations

**Vercel Free Tier**:

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Serverless function execution: 100 hours/month
- ⚠️ 10-second function timeout (we set 60s - may require Pro)

**External Services**:

- MongoDB Atlas: Free tier (512MB)
- Cloudinary: Free tier (25 credits)
- Gemini AI: Free quota
- OpenAI: Pay per use
- Tavily: Pay per search

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Set up staging environment (optional)
5. ✅ Document API endpoints
6. ✅ Share URL with team/users

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support

---

## Quick Commands

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List projects
vercel list

# Open project dashboard
vercel open
```

**Your deployment URL**: After first deploy, you'll get a URL like:
`https://karirkit-xxxxx.vercel.app`

Good luck! 🚀
