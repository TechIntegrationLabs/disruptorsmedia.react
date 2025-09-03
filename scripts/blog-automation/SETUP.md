# Blog Automation Setup Guide

Complete setup instructions for the automated blog publishing system that integrates with Google Sheets, Google Docs, and OpenAI DALL-E.

## Quick Start

### 1. Install Dependencies

```bash
cd scripts/blog-automation
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Google APIs - REQUIRED
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
SPREADSHEET_ID=1KWGeHUOjKtYINSqeneEF8U9hKjEs3U1UTUPaff6OWpA

# OpenAI - REQUIRED  
OPENAI_API_KEY=your_openai_api_key_here

# Optional Settings
SHEET_NAME=Sheet1
BLOG_CONTENT_PATH=../../src/content/blog
BLOG_IMAGES_PATH=../../public/images/blog
DRY_RUN=true
```

### 3. Test Your Setup

```bash
npm run test-connection
```

### 4. Run Blog Automation

```bash
# Test run (no files created)
npm run publish-posts -- --dry-run

# Real publishing
npm run publish-posts
```

## Detailed Configuration

### Google APIs Setup

#### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Sheets API
   - Google Docs API

#### 2. Service Account Creation

1. **IAM & Admin > Service Accounts > Create Service Account**
2. Name: `blog-automation`  
3. Role: `Editor` (or custom role with Sheets/Docs read access)
4. **Create Key > JSON** - Download the file
5. Save as `service-account-key.json` in the automation directory
6. Update `.env`: `GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json`

#### 3. Share Your Documents

Share with the service account email (found in the JSON file):

**Google Sheets:**
- Open your spreadsheet: https://docs.google.com/spreadsheets/d/1KWGeHUOjKtYINSqeneEF8U9hKjEs3U1UTUPaff6OWpA/
- Click "Share" 
- Add the service account email
- Give "Viewer" permissions

**Google Docs:**
- Each document linked in Column B must be shared with the service account
- Give "Viewer" permissions to all documents

### OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Ensure billing is setup with sufficient credits
3. DALL-E 3 costs ~$0.04 per image
4. System generates 1 feature + 2-3 content images per post

### Spreadsheet Structure

Your Google Sheet should have:

- **Column B**: Post URL (Google Docs links)
- **Column O**: Approval Status ("YES" to publish)

The system will:
1. Find all rows where Column O = "YES"
2. Extract Google Docs ID from Column B URL
3. Fetch content from each approved document
4. Generate images and create MDX files

## Usage Patterns

### Manual Publishing

```bash
# Check what would be published
npm run test-connection

# Test run (recommended first)
npm run publish-posts -- --dry-run

# Publish approved posts  
npm run publish-posts

# Force publish (skip approval check)
npm run publish-posts -- --force
```

### Automated Scheduling

#### Option 1: Cron Jobs (Linux/Mac)

```bash
# Show setup instructions
npm run schedule-setup

# Test scheduler
npm run schedule-test

# Add to crontab (choose frequency):
# Every 6 hours:
0 */6 * * * cd /path/to/scripts/blog-automation && node scheduler.js

# Business hours only (9 AM - 5 PM, Mon-Fri):
0 9-17 * * 1-5 cd /path/to/scripts/blog-automation && node scheduler.js

# Daily at 10 AM:
0 10 * * * cd /path/to/scripts/blog-automation && node scheduler.js
```

#### Option 2: GitHub Actions

1. Copy `github-action.yml` to `.github/workflows/blog-automation.yml`
2. Add repository secrets:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` (entire JSON file content)
   - `GOOGLE_SPREADSHEET_ID` 
   - `OPENAI_API_KEY`
   - `SLACK_WEBHOOK_URL` (optional, for notifications)
3. Workflow runs every 6 hours or manually

#### Option 3: Task Scheduler (Windows)

```powershell
# Create scheduled task
schtasks /create /tn "BlogAutomation" /tr "node C:\path\to\scheduler.js" /sc hourly /mo 6
```

### Environment Variables for Automation

```bash
# Publishing Control
AUTO_PUBLISH=true           # Enable automatic publishing
DRY_RUN=false              # Set to true for testing
REQUIRE_APPROVAL=true      # Check approval column

# Deployment Integration
DEPLOYMENT_METHOD=vercel   # vercel, netlify, github, manual
AUTO_PUSH=true            # Automatically push to git repo

# Notification Settings  
NOTIFICATION_METHOD=log   # log, email, slack, webhook

# Image Generation
IMAGE_MODEL=dall-e-3      # OpenAI image model
IMAGE_SIZE=1024x1024      # Image dimensions
IMAGE_QUALITY=standard    # standard or hd
```

## File Structure & Output

### Generated Files

```
src/content/blog/
├── 2024/
│   ├── post-slug-1.mdx
│   └── post-slug-2.mdx
└── 2025/
    └── another-post.mdx

public/images/blog/
├── post-slug-1/
│   ├── feature.jpg
│   ├── feature.webp
│   ├── content-1.jpg
│   └── content-2.jpg
└── post-slug-2/
    ├── feature.jpg
    └── content-1.jpg
```

### MDX Structure

Each generated `.mdx` file includes:

- **Complete Frontmatter**: Title, description, tags, SEO metadata
- **Processed Content**: Markdown with embedded images
- **Interactive Components**: Table of contents, reading progress
- **SEO Optimization**: Meta tags, structured data ready
- **Image Integration**: AI-generated images placed strategically

## Integration with Blog System

### React Components

The automation integrates with your React blog:

- **Route**: `/blog` (listing) and `/blog/:year/:slug` (individual posts)
- **Components**: `Blog.tsx` and `BlogPost.tsx` are already configured
- **Styling**: Complete CSS with responsive design
- **Navigation**: Blog added to header menu

### Next Steps After Setup

1. **Test the system**: Run dry-run mode first
2. **Publish sample posts**: Create test entries in your Google Sheet
3. **Verify output**: Check generated MDX files and images
4. **Setup automation**: Choose scheduling method
5. **Monitor logs**: Check automation logs for issues

## Troubleshooting

### Common Issues

**❌ Authentication Failed**
```
Solution: Check service account JSON file and permissions
Verify: Google APIs enabled, documents shared correctly
```

**❌ No Approved Posts Found**  
```
Solution: Check Column O contains "YES" exactly
Verify: Column B has valid Google Docs URLs
```

**❌ Image Generation Failed**
```
Solution: Check OpenAI API key and billing status
Verify: Account has sufficient credits (~$0.12 per post)
```

**❌ File Creation Failed**
```  
Solution: Check write permissions on blog directories
Verify: Paths in .env are correct and accessible
```

### Debug Commands

```bash
# Test individual components
npm run test-connection     # Test all APIs

# Verbose logging
DEBUG=true npm run publish-posts

# Check logs
tail -f logs/scheduler.log

# Manual verification
node -e "
import { SheetsService } from './services/sheetsService.js';
const service = new SheetsService();
await service.initialize();
console.log(await service.getApprovedPosts());
"
```

## Security & Best Practices

### Credentials Management

- ✅ Never commit `.env` or service account JSON files
- ✅ Use environment-specific configurations
- ✅ Rotate API keys regularly
- ✅ Use minimal required permissions

### API Usage

- ✅ Monitor OpenAI usage and costs
- ✅ Set up billing alerts
- ✅ Use rate limiting (built into system)
- ✅ Handle failures gracefully

### Content Quality

- ✅ Review generated content before publishing
- ✅ Use meaningful approval process
- ✅ Monitor SEO metadata quality
- ✅ Check image relevance and quality

## Monitoring & Maintenance

### Logs

- **Location**: `logs/scheduler.log`
- **Retention**: Automatic cleanup of old logs
- **Content**: Timestamps, status, errors, statistics

### Health Checks

```bash
# Regular health check
npm run test-connection

# Scheduler status
npm run schedule -- --test

# Manual verification
ls -la src/content/blog/    # Check new files
ls -la public/images/blog/  # Check new images
```

### Performance Monitoring

- **Image Generation**: ~30-60 seconds per image
- **Content Processing**: ~5-10 seconds per post
- **Total Time**: ~2-3 minutes per post
- **API Limits**: Built-in rate limiting and retry logic

## Support

For issues or questions:

1. **Check Logs**: Review `logs/scheduler.log` for errors
2. **Test Components**: Use `npm run test-connection`
3. **Verify Setup**: Review this guide step by step
4. **Debug Mode**: Run with `DEBUG=true` for verbose output

## Advanced Configuration

### Custom Image Prompts

Modify `services/imageService.js` to customize image generation:

```javascript
// Customize feature image prompts
createFeatureImagePrompt(title, content) {
  return `Your custom prompt for ${title}`;
}

// Add custom content image logic
createContentImagePrompts(title, content, count) {
  return ['prompt1', 'prompt2', 'prompt3'];
}
```

### Custom MDX Processing

Modify `services/mdxService.js` to add custom frontmatter or processing:

```javascript
// Add custom frontmatter fields
generateFrontmatter(postData) {
  return {
    // Standard fields
    title: postData.title,
    // Custom fields
    customField: 'custom value',
    businessMetrics: this.extractBusinessMetrics(postData.content)
  };
}
```

### Webhook Integration

Add webhook notifications in `scheduler.js`:

```javascript
async sendWebhookNotification(data) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    await axios.post(webhookUrl, {
      event: 'blog_published',
      timestamp: new Date().toISOString(),
      data: data
    });
  }
}
```

This completes the full blog automation system setup. The system is now ready to automatically convert approved Google Docs into published blog posts with AI-generated images.