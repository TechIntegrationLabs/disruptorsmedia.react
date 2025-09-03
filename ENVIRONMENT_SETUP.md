# 🔧 Environment Configuration Guide

## 📍 Environment File Locations

This project supports **dual environment configuration** for maximum flexibility:

### 🎯 **Root Level** (Recommended)
```
/
├── .env                    # ← Main configuration (recommended)
├── .env.example           # ← Template file
└── service-account-key.json  # ← Google credentials
```

### 🔧 **Blog Automation Folder** (Self-contained)
```
scripts/blog-automation/
├── .env                    # ← Alternative location
├── .env.example           # ← Template file  
└── service-account-key.json  # ← Alternative credentials location
```

## 🚀 How It Works

The system **automatically detects** and loads environment variables:

1. **First priority**: Root directory `.env` file
2. **Fallback**: Blog automation folder `.env` file
3. **Final fallback**: System environment variables

## 📁 Path Resolution

**Root Directory Configuration** (`.env`):
```bash
# Paths relative to project root
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
BLOG_CONTENT_PATH=./src/content/blog
BLOG_IMAGES_PATH=./public/images/blog
```

**Blog Automation Configuration** (`scripts/blog-automation/.env`):
```bash
# Paths relative to automation directory
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
BLOG_CONTENT_PATH=../../src/content/blog  
BLOG_IMAGES_PATH=../../public/images/blog
```

## ⚙️ Smart Path Resolution

The system **automatically resolves** relative paths based on:
- Where the `.env` file is located
- Where the scripts are executed from
- Where the service account file exists

**Examples:**
- `./src/content/blog` → Resolved from project root
- `../../src/content/blog` → Resolved from automation folder
- `/absolute/path/blog` → Used as-is

## 🔑 Service Account File Locations

The system checks for Google credentials in **both locations**:

1. **Root directory**: `/service-account-key.json`
2. **Automation folder**: `/scripts/blog-automation/service-account-key.json`

**It automatically uses whichever file exists.**

## 📋 Setup Options

### Option 1: Root Level Setup (Recommended)

```bash
# 1. Copy template
cp .env.example .env

# 2. Edit configuration
nano .env

# 3. Add your keys
OPENAI_API_KEY=your-actual-key-here

# 4. Place Google credentials
# Save service-account-key.json in root directory
```

### Option 2: Blog Automation Setup

```bash
# 1. Navigate to automation folder
cd scripts/blog-automation

# 2. Copy template  
cp .env.example .env

# 3. Edit configuration
nano .env

# 4. Add your keys and place credentials in same folder
```

### Option 3: Interactive Setup (Easiest)

```bash
# Run setup wizard - handles everything automatically
npm run blog:setup
```

## 🛡️ Security & Git

**Protected Files** (never committed):
- `.env` (both locations)
- `service-account-key.json` (both locations)
- All `.env.*` variants

**Template Files** (committed safely):
- `.env.example` (both locations)
- Documentation and setup guides

## 🧪 Testing Your Setup

```bash
# Test configuration loading
npm run blog:test

# See which files are being used
npm run blog:test -- --verbose
```

## 💡 Best Practices

### ✅ **Recommended Approach**
- Use **root level** `.env` for main configuration
- Keep Google credentials in **root directory**
- Use automation folder only for specialized deployments

### 🔄 **Development Workflow**
1. **Development**: Use root `.env` for easy access
2. **Docker/Container**: Use automation folder for isolation
3. **CI/CD**: Use environment variables directly

### 🚀 **Deployment Options**
- **Vercel/Netlify**: Use environment variables in dashboard
- **Docker**: Mount `.env` file or use container variables
- **Server**: Use either location based on your setup

## 🆘 Troubleshooting

### ❌ **"No .env file found"**
**Solution**: Create `.env` file in root directory or use `npm run blog:setup`

### ❌ **"Google credentials not found"**  
**Solution**: Ensure `service-account-key.json` exists in root or automation folder

### ❌ **"Invalid paths"**
**Solution**: Use correct path format:
- Root config: `./src/content/blog`
- Automation config: `../../src/content/blog`

### ❌ **"Permission denied"**
**Solution**: Check file permissions and paths are correct

## 📖 Configuration Reference

**Required Variables:**
```bash
OPENAI_API_KEY=sk-your-key-here
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
SPREADSHEET_ID=your-sheet-id
```

**Optional Variables:**
```bash
SHEET_NAME=Sheet1
IMAGE_QUALITY=standard
DRY_RUN=true
AUTO_PUBLISH=false
```

**See `.env.example` for complete reference.**

---

This flexible setup ensures your blog automation works in **any environment** while maintaining security and ease of use! 🎉