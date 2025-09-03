#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interactive Setup Script for Blog Automation
 */
class BlogAutomationSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {};
    this.envFilePath = path.join(__dirname, '.env');
    this.serviceAccountPath = path.join(__dirname, 'service-account-key.json');
  }

  /**
   * Main setup flow
   */
  async run() {
    console.log(`
┌─────────────────────────────────────────────────┐
│          🤖 Blog Automation Setup               │
│                                                 │
│  This will guide you through setting up the    │
│  automated blog publishing system.             │
└─────────────────────────────────────────────────┘
`);

    try {
      await this.checkExistingSetup();
      await this.collectRequiredSettings();
      await this.collectOptionalSettings();
      await this.createDirectories();
      await this.writeEnvFile();
      await this.showNextSteps();
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Check if setup already exists
   */
  async checkExistingSetup() {
    if (await fs.pathExists(this.envFilePath)) {
      const overwrite = await this.askYesNo('⚠️  Existing .env file found. Overwrite it?');
      if (!overwrite) {
        console.log('Setup cancelled. You can manually edit .env or delete it to run setup again.');
        process.exit(0);
      }
    }
  }

  /**
   * Collect required settings
   */
  async collectRequiredSettings() {
    console.log('\n📋 REQUIRED SETTINGS\n');
    
    // OpenAI API Key
    console.log('1. OpenAI API Key');
    console.log('   Get yours from: https://platform.openai.com/api-keys');
    this.config.OPENAI_API_KEY = await this.askQuestion('   Enter your OpenAI API Key: ');
    
    if (!this.config.OPENAI_API_KEY || this.config.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API Key is required');
    }

    // Google Service Account
    console.log('\n2. Google Service Account Setup');
    console.log('   You need to:');
    console.log('   a. Create a service account in Google Cloud Console');
    console.log('   b. Download the JSON key file');
    console.log('   c. Place it in this directory');
    
    const hasServiceAccount = await this.askYesNo('   Do you have the service account JSON file ready?');
    
    if (!hasServiceAccount) {
      console.log('\n   📖 How to create a Google service account:');
      console.log('   1. Go to https://console.cloud.google.com/');
      console.log('   2. Create a new project or select existing');
      console.log('   3. Enable Google Sheets API and Google Docs API');
      console.log('   4. Go to IAM & Admin > Service Accounts');
      console.log('   5. Create Service Account > Download JSON key');
      console.log('   6. Save the file as "service-account-key.json" in this directory');
      console.log('   7. Share your Google Sheets and Docs with the service account email');
      throw new Error('Please set up Google service account first');
    }

    const serviceAccountFile = await this.askQuestion('   Service account filename (press Enter for "service-account-key.json"): ') || 'service-account-key.json';
    this.config.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountFile;

    // Verify service account file exists
    const serviceAccountFullPath = path.join(__dirname, serviceAccountFile);
    if (!await fs.pathExists(serviceAccountFullPath)) {
      throw new Error(`Service account file not found: ${serviceAccountFile}`);
    }

    // Google Spreadsheet ID (already provided in the setup)
    console.log('\n3. Google Spreadsheet');
    console.log('   Using spreadsheet: 1KWGeHUOjKtYINSqeneEF8U9hKjEs3U1UTUPaff6OWpA');
    const useProvidedSheet = await this.askYesNo('   Use this spreadsheet?');
    
    if (useProvidedSheet) {
      this.config.SPREADSHEET_ID = '1KWGeHUOjKtYINSqeneEF8U9hKjEs3U1UTUPaff6OWpA';
    } else {
      this.config.SPREADSHEET_ID = await this.askQuestion('   Enter your Google Spreadsheet ID: ');
    }

    // Sheet name
    this.config.SHEET_NAME = await this.askQuestion('   Sheet tab name (press Enter for "Sheet1"): ') || 'Sheet1';
  }

  /**
   * Collect optional settings
   */
  async collectOptionalSettings() {
    console.log('\n📋 OPTIONAL SETTINGS\n');

    const configureOptional = await this.askYesNo('Configure optional settings (deployment, notifications, etc.)?');
    
    if (configureOptional) {
      // Deployment method
      console.log('\n4. Deployment Method');
      console.log('   Options: manual, vercel, netlify, github');
      this.config.DEPLOYMENT_METHOD = await this.askQuestion('   Deployment method (press Enter for "manual"): ') || 'manual';
      
      if (this.config.DEPLOYMENT_METHOD !== 'manual') {
        this.config.AUTO_PUSH = await this.askYesNo('   Automatically push to git repository?') ? 'true' : 'false';
      }

      // Notification method
      console.log('\n5. Notifications');
      console.log('   Options: log, email, slack, webhook');
      this.config.NOTIFICATION_METHOD = await this.askQuestion('   Notification method (press Enter for "log"): ') || 'log';
      
      if (this.config.NOTIFICATION_METHOD === 'slack') {
        this.config.SLACK_WEBHOOK_URL = await this.askQuestion('   Slack webhook URL: ');
      }
    }

    // Behavior settings
    console.log('\n6. Automation Behavior');
    this.config.DRY_RUN = await this.askYesNo('   Start in dry-run mode (recommended)?') ? 'true' : 'false';
    this.config.AUTO_PUBLISH = await this.askYesNo('   Enable automatic publishing?') ? 'true' : 'false';
    
    // Image settings
    console.log('\n7. Image Generation');
    const imageQuality = await this.askQuestion('   Image quality - standard or hd (press Enter for "standard"): ') || 'standard';
    this.config.IMAGE_QUALITY = imageQuality;
    
    const imageSize = await this.askQuestion('   Image size - 1024x1024, 512x512, or 256x256 (press Enter for "1024x1024"): ') || '1024x1024';
    this.config.IMAGE_SIZE = imageSize;
  }

  /**
   * Create necessary directories
   */
  async createDirectories() {
    console.log('\n📁 Creating directories...');
    
    const dirs = [
      path.join(__dirname, 'logs'),
      path.resolve(__dirname, '../../src/content/blog'),
      path.resolve(__dirname, '../../public/images/blog')
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
      console.log(`   ✓ ${path.relative(__dirname, dir)}`);
    }
  }

  /**
   * Write .env file
   */
  async writeEnvFile() {
    console.log('\n📝 Creating .env file...');
    
    const envContent = this.generateEnvContent();
    await fs.writeFile(this.envFilePath, envContent);
    
    console.log('   ✓ .env file created');
  }

  /**
   * Generate .env file content
   */
  generateEnvContent() {
    const defaults = {
      SHEET_NAME: 'Sheet1',
      BLOG_CONTENT_PATH: '../../src/content/blog',
      BLOG_IMAGES_PATH: '../../public/images/blog',
      BLOG_BASE_URL: 'https://disruptorsmedia.com',
      IMAGE_MODEL: 'dall-e-3',
      IMAGE_SIZE: '1024x1024',
      IMAGE_QUALITY: 'standard',
      AUTO_PUBLISH: 'false',
      DRY_RUN: 'true',
      REQUIRE_APPROVAL: 'true',
      REQUIRE_PUBLISH_DATE: 'true',
      DEPLOYMENT_METHOD: 'manual',
      AUTO_PUSH: 'false',
      NOTIFICATION_METHOD: 'log',
      DEBUG: 'false',
      LOG_LEVEL: 'info',
      LOG_FILE: 'logs/blog-automation.log',
      NODE_ENV: 'development'
    };

    const config = { ...defaults, ...this.config };

    return `# ============================================
# BLOG AUTOMATION CONFIGURATION
# Generated on ${new Date().toISOString()}
# ============================================

# ============================================
# REQUIRED SETTINGS
# ============================================

# Google APIs Configuration
GOOGLE_APPLICATION_CREDENTIALS=${config.GOOGLE_APPLICATION_CREDENTIALS}
SPREADSHEET_ID=${config.SPREADSHEET_ID}

# OpenAI API Configuration  
OPENAI_API_KEY=${config.OPENAI_API_KEY}

# ============================================
# SHEET CONFIGURATION
# ============================================

SHEET_NAME=${config.SHEET_NAME}

# ============================================
# BLOG & IMAGE SETTINGS
# ============================================

BLOG_CONTENT_PATH=${config.BLOG_CONTENT_PATH}
BLOG_IMAGES_PATH=${config.BLOG_IMAGES_PATH}
BLOG_BASE_URL=${config.BLOG_BASE_URL}

# Image Generation Settings
IMAGE_MODEL=${config.IMAGE_MODEL}
IMAGE_SIZE=${config.IMAGE_SIZE}
IMAGE_QUALITY=${config.IMAGE_QUALITY}

# ============================================
# AUTOMATION BEHAVIOR
# ============================================

AUTO_PUBLISH=${config.AUTO_PUBLISH}
DRY_RUN=${config.DRY_RUN}
REQUIRE_APPROVAL=${config.REQUIRE_APPROVAL}
REQUIRE_PUBLISH_DATE=${config.REQUIRE_PUBLISH_DATE}

# ============================================
# DEPLOYMENT INTEGRATION
# ============================================

DEPLOYMENT_METHOD=${config.DEPLOYMENT_METHOD}
AUTO_PUSH=${config.AUTO_PUSH}

# ============================================
# NOTIFICATIONS
# ============================================

NOTIFICATION_METHOD=${config.NOTIFICATION_METHOD}
${config.SLACK_WEBHOOK_URL ? `SLACK_WEBHOOK_URL=${config.SLACK_WEBHOOK_URL}` : '# SLACK_WEBHOOK_URL='}

# ============================================
# DEBUG & LOGGING
# ============================================

DEBUG=${config.DEBUG}
LOG_LEVEL=${config.LOG_LEVEL}
LOG_FILE=${config.LOG_FILE}
NODE_ENV=${config.NODE_ENV}
`;
  }

  /**
   * Show next steps
   */
  async showNextSteps() {
    console.log(`
┌─────────────────────────────────────────────────┐
│               🎉 Setup Complete!               │
└─────────────────────────────────────────────────┘

✅ Configuration saved to .env
✅ Directories created
✅ Dependencies installed

📋 NEXT STEPS:

1. Share your Google documents:
   • Open your Google Sheet: https://docs.google.com/spreadsheets/d/${this.config.SPREADSHEET_ID}/
   • Click "Share" and add your service account email (found in the JSON file)
   • Give "Viewer" permissions
   • Do the same for ALL Google Docs linked in Column B

2. Test your setup:
   npm run test-connection

3. Try a dry run:
   npm run publish-posts -- --dry-run

4. Publish for real:
   npm run publish-posts

📖 AUTOMATION REQUIREMENTS:

Your Google Sheet should have:
• Column B: Google Docs URLs
• Column O: Approval status ("YES" to publish)  
• Publish Date column: Date when post should be published

The system will only publish posts where:
✓ Column O = "YES" 
✓ Publish date ≤ today's date
✓ Valid Google Docs URL in Column B

🔧 CONFIGURATION:

Current settings:
• Dry Run: ${this.config.DRY_RUN}
• Auto Publish: ${this.config.AUTO_PUBLISH}  
• Deployment: ${this.config.DEPLOYMENT_METHOD}
• Notifications: ${this.config.NOTIFICATION_METHOD}

Edit .env to change these settings.

🚀 SCHEDULING (Optional):

For automatic publishing, set up cron jobs:
npm run schedule-setup

📚 DOCUMENTATION:

• Full setup guide: README.md
• API documentation: SETUP.md
• Troubleshooting: Check logs/ directory

Happy blogging! 🎉
`);
  }

  /**
   * Ask a question and return the response
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Ask a yes/no question
   */
  async askYesNo(question) {
    const answer = await this.askQuestion(question + ' (y/N): ');
    return answer.toLowerCase().startsWith('y');
  }
}

/**
 * Run setup if executed directly
 */
async function main() {
  const setup = new BlogAutomationSetup();
  await setup.run();
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

export { BlogAutomationSetup };