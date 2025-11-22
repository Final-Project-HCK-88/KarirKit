# Deploy dari VS Code

## 🚀 Cara Deploy KarirKit ke Vercel dari VS Code

Ada 3 cara deploy langsung dari VS Code:

---

## Cara 1: Menggunakan Vercel Extension (Paling Mudah)

### Step 1: Install Extension

1. Buka **Extensions** di VS Code (Ctrl+Shift+X)
2. Cari **"Vercel"**
3. Install extension **"Vercel"** by Vercel
4. Reload VS Code

### Step 2: Login ke Vercel

1. Tekan **Ctrl+Shift+P** (Command Palette)
2. Ketik: `Vercel: Login`
3. Pilih login method (GitHub/Email)
4. Authorize di browser

### Step 3: Deploy

1. **Cara A - Via Command Palette:**

   - Tekan **Ctrl+Shift+P**
   - Ketik: `Vercel: Deploy`
   - Pilih project (atau create new)
   - Tunggu deployment selesai

2. **Cara B - Via Status Bar:**
   - Klik icon Vercel di status bar (bawah VS Code)
   - Klik **"Deploy to Vercel"**

### Step 4: Set Environment Variables

1. Tekan **Ctrl+Shift+P**
2. Ketik: `Vercel: Add Environment Variable`
3. Masukkan key dan value
4. Pilih environment (Production/Preview/Development)

---

## Cara 2: Menggunakan Integrated Terminal

### Step 1: Buka Terminal di VS Code

**Cara membuka:**

- **Ctrl+`** (backtick)
- Atau **View → Terminal**
- Atau **Ctrl+Shift+P** → "Terminal: Create New Terminal"

### Step 2: Install Vercel CLI (jika belum)

```bash
npm install -g vercel
```

### Step 3: Login

```bash
vercel login
```

Browser akan terbuka untuk authorize.

### Step 4: Deploy

```bash
# Pastikan Anda di folder my-app
cd my-app

# Deploy (interactive - untuk pertama kali)
vercel

# Deploy to production
vercel --prod
```

### Step 5: Lihat Logs

```bash
# View deployment logs
vercel logs

# View specific deployment
vercel logs [deployment-url]
```

---

## Cara 3: Menggunakan VS Code Tasks (Advanced)

### Step 1: Create Tasks Configuration

1. **Ctrl+Shift+P** → "Tasks: Configure Task"
2. Pilih "Create tasks.json from template"
3. Pilih "Others"

### Step 2: Edit `.vscode/tasks.json`

Saya akan buatkan file tasks.json untuk Anda:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Vercel: Login",
      "type": "shell",
      "command": "vercel login",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Vercel: Deploy Preview",
      "type": "shell",
      "command": "vercel",
      "options": {
        "cwd": "${workspaceFolder}/my-app"
      },
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Vercel: Deploy Production",
      "type": "shell",
      "command": "vercel --prod",
      "options": {
        "cwd": "${workspaceFolder}/my-app"
      },
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Vercel: View Logs",
      "type": "shell",
      "command": "vercel logs",
      "options": {
        "cwd": "${workspaceFolder}/my-app"
      },
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Vercel: Open Dashboard",
      "type": "shell",
      "command": "vercel open",
      "options": {
        "cwd": "${workspaceFolder}/my-app"
      },
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Build and Deploy to Vercel",
      "type": "shell",
      "command": "npm run build && vercel --prod",
      "options": {
        "cwd": "${workspaceFolder}/my-app"
      },
      "problemMatcher": ["$tsc"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

### Step 3: Run Task

**Cara menjalankan:**

- **Ctrl+Shift+P** → "Tasks: Run Task"
- Pilih task yang ingin dijalankan:
  - `Vercel: Login`
  - `Vercel: Deploy Preview`
  - `Vercel: Deploy Production`
  - `Vercel: View Logs`
  - `Build and Deploy to Vercel`

**Shortcut cepat:**

- **Ctrl+Shift+B** → Run default build task (Build and Deploy)

---

## 🎯 Workflow Recommended dari VS Code

### First Time Setup:

1. **Install Vercel Extension**
2. **Login via Command Palette:**
   ```
   Ctrl+Shift+P → Vercel: Login
   ```
3. **Deploy:**
   ```
   Ctrl+Shift+P → Vercel: Deploy
   ```
4. **Add Environment Variables:**
   ```
   Ctrl+Shift+P → Vercel: Add Environment Variable
   ```

### Daily Development Workflow:

1. **Edit code** di VS Code
2. **Test locally:**
   ```bash
   # Di terminal VS Code (Ctrl+`)
   npm run dev
   ```
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```
4. **Deploy:**
   - **Option A**: Vercel auto-deploys dari GitHub push
   - **Option B**: Manual deploy via Command Palette
   - **Option C**: Run task `Vercel: Deploy Production`

---

## 📝 Keyboard Shortcuts untuk Deployment

Anda bisa menambahkan custom keyboard shortcuts:

1. **Ctrl+Shift+P** → "Preferences: Open Keyboard Shortcuts (JSON)"
2. Tambahkan:

```json
[
  {
    "key": "ctrl+shift+d",
    "command": "workbench.action.tasks.runTask",
    "args": "Vercel: Deploy Production"
  },
  {
    "key": "ctrl+shift+l",
    "command": "workbench.action.tasks.runTask",
    "args": "Vercel: View Logs"
  }
]
```

Sekarang:

- **Ctrl+Shift+D** = Deploy to Production
- **Ctrl+Shift+L** = View Logs

---

## 🔧 VS Code Settings untuk Vercel

Tambahkan di **settings.json** (Ctrl+,):

```json
{
  "vercel.scope": "your-vercel-username",
  "vercel.defaultProject": "karirkit",
  "terminal.integrated.defaultProfile.windows": "Git Bash",
  "terminal.integrated.cwd": "${workspaceFolder}/my-app"
}
```

---

## 🎨 Status Bar Integration

Setelah install Vercel extension, Anda akan lihat:

**Status Bar (bawah VS Code):**

- `Vercel: Connected` ← Klik untuk quick actions
- `Last Deploy: Success` ← Status deployment terakhir

**Quick Actions:**

- Deploy to Vercel
- View Deployments
- Open Dashboard
- Add Environment Variable

---

## 🐛 Debugging Deployment Issues

### View Output Panel:

1. **Ctrl+Shift+U** (Output panel)
2. Pilih dropdown: **"Vercel"**
3. Lihat deployment logs real-time

### Check Problems:

1. **Ctrl+Shift+M** (Problems panel)
2. Lihat build errors sebelum deploy

### Terminal Output:

Saat deploy via terminal, Anda akan lihat:

```
Vercel CLI 33.0.0
🔍  Inspect: https://vercel.com/...
✅  Production: https://your-app.vercel.app [copied to clipboard]
```

---

## 🚀 Quick Commands di VS Code Terminal

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# List deployments
vercel list

# Rollback to previous deployment
vercel rollback

# Open dashboard
vercel open

# Add env variable
vercel env add VARIABLE_NAME

# Pull env variables
vercel env pull .env.local
```

---

## 💡 Pro Tips

### 1. Use Git Bash Terminal

Windows users: gunakan Git Bash di VS Code

```json
"terminal.integrated.defaultProfile.windows": "Git Bash"
```

### 2. Auto Deploy on Git Push

Setup GitHub integration:

- Push ke `main` = Production deploy
- Push ke other branches = Preview deploy
- Tidak perlu manual deploy lagi!

### 3. Multi-Root Workspace

Jika punya multiple projects:

```
File → Add Folder to Workspace → Pilih folder my-app
```

### 4. View Deployment in Browser

Setelah deploy, URL otomatis copied to clipboard.
Paste di browser atau tekan **Ctrl+Click** di terminal.

---

## 🔐 Environment Variables Management

### Via VS Code Terminal:

```bash
# Add single variable
vercel env add MONGODB_URI production

# Add multiple (interactive)
vercel env add

# Pull to local
vercel env pull .env.production

# Remove variable
vercel env rm VARIABLE_NAME production
```

### Via Vercel Extension:

1. **Ctrl+Shift+P** → `Vercel: Add Environment Variable`
2. Enter name, value, environment
3. Done!

---

## 📊 Monitoring dari VS Code

### 1. Real-time Logs:

```bash
# Follow logs
vercel logs --follow

# Filter by deployment
vercel logs [deployment-url]
```

### 2. Deployment Status:

Lihat di **Vercel Extension** sidebar:

- Recent deployments
- Status (Success/Failed/Building)
- Preview URLs
- Production URL

---

## ⚡ Recommended Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Make changes and test

# 3. Build locally first
npm run build

# 4. If build success, commit
git add .
git commit -m "Feature: your feature"

# 5. Push (triggers auto-deploy if connected)
git push

# OR manual deploy
vercel --prod
```

---

## 🎯 Summary: Fastest Way

**Paling Cepat - Via Terminal:**

```bash
# Pertama kali
vercel login
vercel

# Selanjutnya (1 command)
vercel --prod
```

**Paling Mudah - Via Extension:**

```
Ctrl+Shift+P → Vercel: Deploy
```

---

Pilih cara yang paling nyaman untuk Anda! 🚀
