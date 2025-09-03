# Blog Automation System

Automated blog post publishing system that reads from Google Sheets, fetches content from Google Docs, generates AI images, and creates MDX blog posts.

## Features

- 📊 **Google Sheets Integration** - Reads blog post queue from spreadsheet
- 📄 **Google Docs Content** - Extracts full article content from Google Docs
- 🤖 **AI Image Generation** - Creates feature and content images with DALL-E 3
- 📝 **MDX Blog Posts** - Generates complete MDX files with frontmatter
- ✅ **Approval System** - Only processes posts marked as approved
- 🧪 **Dry Run Mode** - Test without creating actual files
- 📈 **Progress Tracking** - Detailed logging and error reporting

## Quick Start

### 1. Installation

```bash
cd scripts/blog-automation
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required configuration:
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google service account JSON
- `SPREADSHEET_ID` - Your Google Sheets ID 
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. Test Connections

```bash
npm run test-connection
```

This will verify all APIs are working and show you a preview of approved posts.

### 4. Run Blog Automation

**Dry Run (Recommended First)**:
```bash
npm run publish-posts -- --dry-run
```

**Real Publishing**:
```bash
npm run publish-posts
```

## How It Works

### Data Flow

```
Google Sheets (Approval: YES) 
    ↓
Google Docs (Content Extraction)
    ↓  
DALL-E 3 (Image Generation)
    ↓
MDX File (Blog Post Creation)
```

### Google Sheets Structure

The system reads from your spreadsheet and looks for:
- **Column B**: Post URL (Google Docs link)
- **Column O**: Approval Status ("YES" to publish)

### Google Docs Processing

- Extracts title and full content
- Converts formatting to Markdown
- Calculates reading time
- Analyzes content for image generation

### Image Generation

- **Feature Image**: Main blog header image
- **Content Images**: 2-3 supporting illustrations placed throughout article
- **Optimization**: Converts to JPEG and WebP formats
- **Responsive**: Sized appropriately for web usage

### MDX Output

Creates complete blog posts with:
- **Frontmatter**: Title, description, tags, SEO metadata
- **Content**: Formatted markdown with embedded images
- **Components**: Table of contents, reading progress
- **Organization**: Filed by year in `/src/content/blog/`

## Configuration Options

### Environment Variables

```bash
# Required
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
SPREADSHEET_ID=your_spreadsheet_id
OPENAI_API_KEY=your_openai_key

# Optional
SHEET_NAME=Sheet1                              # Sheet tab name
BLOG_CONTENT_PATH=../../src/content/blog       # Output directory
BLOG_IMAGES_PATH=../../public/images/blog      # Images directory
IMAGE_MODEL=dall-e-3                          # OpenAI image model
IMAGE_SIZE=1024x1024                          # Image dimensions
IMAGE_QUALITY=standard                         # Image quality (standard/hd)
DRY_RUN=false                                 # Enable dry run mode
REQUIRE_APPROVAL=true                          # Check approval column
```

### CLI Options

```bash
npm run publish-posts -- --help          # Show help
npm run publish-posts -- --dry-run       # Test mode
npm run publish-posts -- --force         # Skip approval check
```

## Google API Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Google Sheets API
   - Google Docs API

### 2. Service Account Creation

1. Go to **IAM & Admin > Service Accounts**
2. Create a new service account
3. Download the JSON key file
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the file path

### 3. Share Your Documents

Share your Google Sheets and Google Docs with the service account email address:
- Give **Viewer** permissions to the spreadsheet
- Give **Viewer** permissions to all Google Docs linked in the sheet

## OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Ensure you have sufficient credits for image generation
3. DALL-E 3 costs approximately $0.04 per image

## File Structure

```
scripts/blog-automation/
├── package.json                    # Dependencies and scripts
├── publishPosts.js                 # Main automation script
├── testConnection.js               # Connection testing
├── config/
│   └── googleAuth.js              # Google API authentication
├── services/
│   ├── sheetsService.js           # Google Sheets integration
│   ├── docsService.js             # Google Docs integration
│   ├── imageService.js            # OpenAI image generation
│   └── mdxService.js              # MDX file generation
└── .env.example                   # Environment template
```

## Troubleshooting

### Common Issues

**❌ Google API Authentication Failed**
- Check service account JSON file path
- Verify APIs are enabled in Google Cloud Console
- Confirm documents are shared with service account email

**❌ OpenAI API Failed**
- Verify API key is correct
- Check OpenAI account has sufficient credits
- Rate limits: System includes automatic retry logic

**❌ No Approved Posts Found**
- Check Column O contains "YES" (case insensitive)
- Verify Column B has valid Google Docs URLs
- Ensure sheet name matches configuration

**❌ Image Generation Failed**
- Check OpenAI billing status
- Verify API key permissions
- System continues without images if generation fails

### Debug Mode

Enable detailed logging:

```bash
DEBUG=true npm run publish-posts -- --dry-run
```

### Manual Testing

Test individual components:

```bash
# Test Google Sheets only
node -e "
import { SheetsService } from './services/sheetsService.js';
const service = new SheetsService();
await service.initialize();
const posts = await service.getApprovedPosts();
console.log(posts);
"

# Test image generation only
node -e "
import { ImageService } from './services/imageService.js';
const service = new ImageService();
const url = await service.generateImage('A test blog image');
console.log(url);
"
```

## Security Notes

- Keep `.env` file secure and never commit it
- Service account JSON files contain sensitive credentials
- OpenAI API keys should be kept private
- Consider using environment-specific configurations for production

## Performance Considerations

- **Rate Limits**: Built-in delays between API calls
- **Image Generation**: Most time-consuming step (~30-60 seconds per image)
- **Batch Processing**: Processes multiple posts in sequence
- **Error Recovery**: Continues processing even if individual posts fail

## Monitoring

The system provides detailed logging:
- ✅ Success indicators
- ❌ Error messages with context  
- ⚠️ Warnings for non-critical issues
- 📊 Summary statistics
- 🧪 Dry run simulation markers

## Integration with Blog System

Generated MDX files integrate with the blog system planned in `BLOG_DEVELOPMENT_PLAN.md`:

- **File Location**: `src/content/blog/YYYY/slug.mdx`
- **Image Storage**: `public/images/blog/slug/`
- **URL Structure**: `/blog/YYYY/slug`
- **Metadata**: Complete frontmatter with SEO, tags, categories
- **Components**: Ready for React component integration

## License & Usage

This automation system is part of the Disruptors Media project and should be used in accordance with:
- Google APIs Terms of Service
- OpenAI Usage Policies  
- Disruptors Media content guidelines