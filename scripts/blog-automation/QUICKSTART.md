# 🚀 Quick Start Guide

Get your automated blog publishing system running in minutes!

## ⚡ 1-Minute Setup

```bash
# Navigate to blog automation directory
cd scripts/blog-automation

# Run interactive setup
npm run setup
```

The setup wizard will guide you through:
- ✅ OpenAI API key configuration
- ✅ Google service account setup  
- ✅ Spreadsheet integration
- ✅ Automation preferences

## 📋 Prerequisites Checklist

Before running setup, ensure you have:

### Google Service Account
1. ✅ Google Cloud project with Sheets + Docs APIs enabled
2. ✅ Service account JSON key file 
3. ✅ Google Sheets/Docs shared with service account email

### OpenAI Account  
1. ✅ OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. ✅ Sufficient credits (~$0.12 per blog post)

### Environment Configuration
The system supports environment files in **two locations**:
- ✅ **Root directory** (`.env`) - Recommended for overall project config
- ✅ **Blog automation folder** (`scripts/blog-automation/.env`) - Self-contained option

### Spreadsheet Structure
Your Google Sheet needs:
1. ✅ **Column B**: Google Docs URLs
2. ✅ **Column O**: Approval status ("YES" to publish)
3. ✅ **Publish Date column**: Date when post should go live

## 🧪 Test Your Setup

```bash
# Test all connections
npm run test-connection

# Dry run (no files created)
npm run publish-posts -- --dry-run

# Real publishing  
npm run publish-posts
```

## 📅 Publishing Logic

Posts are published when **ALL** conditions are met:
- ✅ Column O = "YES" (approved)
- ✅ Publish date ≤ today (date ready)
- ✅ Valid Google Docs URL in Column B

## 🔄 Automation Options

### Manual
```bash
npm run publish-posts
```

### Scheduled (Cron)
```bash
# Show cron setup instructions
npm run schedule-setup

# Example: Every 6 hours
0 */6 * * * cd /path/to/blog-automation && node scheduler.js
```

### GitHub Actions
Copy `github-action.yml` to `.github/workflows/` for automated deployment.

## 📊 What Gets Created

For each approved post:

**Generated Files:**
```
src/content/blog/2024/
├── your-post-slug.mdx     # Complete blog post with frontmatter

public/images/blog/your-post-slug/  
├── feature.jpg            # AI-generated header image
├── feature.webp          # Optimized WebP version
├── content-1.jpg         # Supporting image 1
└── content-2.jpg         # Supporting image 2
```

**Features Include:**
- ✅ SEO-optimized frontmatter (title, description, tags, meta)
- ✅ AI-generated relevant images strategically placed
- ✅ Responsive image optimization (JPEG + WebP)
- ✅ Reading time calculation
- ✅ Category and tag inference
- ✅ Table of contents and reading progress components

## 🛠️ Configuration

Edit `.env` to customize:

```bash
# Publishing behavior
DRY_RUN=false                    # Set false for real publishing
AUTO_PUBLISH=true                # Enable scheduling
REQUIRE_PUBLISH_DATE=true        # Check date before publishing

# Image quality
IMAGE_QUALITY=hd                 # 'standard' or 'hd'
IMAGE_SIZE=1024x1024            # Image dimensions

# Deployment
DEPLOYMENT_METHOD=vercel        # Auto-deploy after publishing
AUTO_PUSH=true                  # Push to git automatically
```

## 🚨 Troubleshooting

### ❌ No posts found
- Check Column O contains "YES" exactly  
- Verify publish dates are today or earlier
- Ensure Google Docs URLs are valid and shared

### ❌ Authentication failed
- Verify service account JSON file exists
- Check APIs are enabled in Google Cloud Console
- Confirm documents are shared with service account email

### ❌ Image generation failed  
- Check OpenAI API key and billing
- Verify sufficient credits (~$0.12 per post)
- System continues without images if generation fails

### ❌ Permission denied
- Check write permissions on blog directories
- Verify paths in `.env` are correct

## 📈 Monitoring

**Logs:** Check `logs/blog-automation.log`  
**Status:** `npm run test-connection`  
**Debug:** Set `DEBUG=true` in `.env`

## 💡 Pro Tips

1. **Start with dry run** to verify setup
2. **Test with one post** before batch publishing  
3. **Check generated images** for quality and relevance
4. **Monitor OpenAI usage** to control costs
5. **Use scheduling** for hands-off operation

## 🔗 Next Steps

Once your first posts are published:

1. **Blog Display:** Visit `/blog` to see your posts
2. **SEO:** Generated posts include complete meta tags  
3. **Scheduling:** Set up cron jobs for automation
4. **Customization:** Edit image prompts or MDX templates
5. **Integration:** Connect with your deployment workflow

## 📚 Full Documentation

- **Complete Setup:** `SETUP.md`
- **API Reference:** `README.md` 
- **Troubleshooting:** Check logs and status commands

---

**🎉 You're ready to automate your blog publishing!**

The system will transform your Google Docs into beautiful, SEO-optimized blog posts with AI-generated images, automatically published when approved and scheduled.