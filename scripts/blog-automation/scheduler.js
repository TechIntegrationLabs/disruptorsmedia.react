#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnvLoader } from './config/envLoader.js';

EnvLoader.load();

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automated Blog Publishing Scheduler
 */
class BlogScheduler {
  constructor() {
    this.logFile = path.join(__dirname, 'logs', 'scheduler.log');
    this.lockFile = path.join(__dirname, 'scheduler.lock');
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Initialize scheduler
   */
  async initialize() {
    // Ensure logs directory exists
    await fs.ensureDir(path.dirname(this.logFile));
    
    // Check for existing lock file
    if (await fs.pathExists(this.lockFile)) {
      const lockContent = await fs.readFile(this.lockFile, 'utf8');
      const lockData = JSON.parse(lockContent);
      
      // If lock is older than 1 hour, remove it (stale process)
      if (Date.now() - lockData.timestamp > 3600000) {
        await fs.remove(this.lockFile);
        this.log('Removed stale lock file');
      } else {
        this.log('Another scheduler instance is running. Exiting.');
        process.exit(0);
      }
    }

    // Create lock file
    await fs.writeFile(this.lockFile, JSON.stringify({
      pid: process.pid,
      timestamp: Date.now()
    }));

    // Clean up on exit
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * Run automated blog publishing
   */
  async runScheduledPublishing() {
    try {
      this.log('Starting scheduled blog publishing run');

      // Check if publishing is enabled
      if (process.env.AUTO_PUBLISH !== 'true') {
        this.log('Auto-publishing disabled. Set AUTO_PUBLISH=true to enable.');
        return;
      }

      let attempt = 0;
      let success = false;

      while (attempt < this.maxRetries && !success) {
        attempt++;
        this.log(`Publishing attempt ${attempt}/${this.maxRetries}`);

        try {
          // Run the blog publishing script
          const { stdout, stderr } = await execAsync(
            'node publishPosts.js',
            { 
              cwd: __dirname,
              timeout: 600000 // 10 minute timeout
            }
          );

          if (stdout) {
            this.log('Publishing output:', stdout);
          }

          if (stderr) {
            this.log('Publishing warnings:', stderr);
          }

          // If we get here, the command completed successfully
          success = true;
          this.log('Blog publishing completed successfully');

          // Trigger deployment if configured
          await this.triggerDeployment();

        } catch (error) {
          this.log(`Publishing attempt ${attempt} failed:`, error.message);
          
          if (attempt < this.maxRetries) {
            this.log(`Retrying in ${this.retryDelay/1000} seconds...`);
            await this.delay(this.retryDelay);
          } else {
            this.log('All publishing attempts failed');
            await this.notifyFailure(error);
          }
        }
      }

    } catch (error) {
      this.log('Scheduler error:', error.message);
      await this.notifyFailure(error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Trigger deployment after successful publishing
   */
  async triggerDeployment() {
    try {
      const deploymentMethod = process.env.DEPLOYMENT_METHOD || 'manual';
      
      this.log(`Triggering deployment (method: ${deploymentMethod})`);

      switch (deploymentMethod) {
        case 'vercel':
          await this.deployToVercel();
          break;
          
        case 'netlify':
          await this.deployToNetlify();
          break;
          
        case 'github':
          await this.triggerGitHubDeploy();
          break;
          
        case 'manual':
          this.log('Manual deployment required - new blog posts are ready');
          break;
          
        default:
          this.log(`Unknown deployment method: ${deploymentMethod}`);
      }

    } catch (error) {
      this.log('Deployment trigger failed:', error.message);
      // Don't fail the entire process if deployment fails
    }
  }

  /**
   * Deploy to Vercel
   */
  async deployToVercel() {
    try {
      // Check if there are new files to deploy
      const { stdout: gitStatus } = await execAsync('git status --porcelain', {
        cwd: path.resolve(__dirname, '../../')
      });

      if (!gitStatus.trim()) {
        this.log('No changes to deploy');
        return;
      }

      // Add new blog files
      await execAsync('git add src/content/blog/ public/images/blog/', {
        cwd: path.resolve(__dirname, '../../')
      });

      // Commit changes
      const commitMessage = `feat: Auto-publish blog posts - ${new Date().toISOString()}`;
      await execAsync(`git commit -m "${commitMessage}"`, {
        cwd: path.resolve(__dirname, '../../')
      });

      // Push to trigger deployment
      if (process.env.AUTO_PUSH === 'true') {
        await execAsync('git push origin main', {
          cwd: path.resolve(__dirname, '../../')
        });
        this.log('Changes pushed to repository - Vercel deployment triggered');
      } else {
        this.log('Changes committed locally - set AUTO_PUSH=true to automatically push');
      }

    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error.message}`);
    }
  }

  /**
   * Deploy to Netlify
   */
  async deployToNetlify() {
    try {
      // Similar to Vercel but using Netlify CLI if available
      const { stdout } = await execAsync('netlify deploy --prod --dir=dist', {
        cwd: path.resolve(__dirname, '../../')
      });
      
      this.log('Netlify deployment completed:', stdout);
    } catch (error) {
      throw new Error(`Netlify deployment failed: ${error.message}`);
    }
  }

  /**
   * Trigger GitHub Actions deployment
   */
  async triggerGitHubDeploy() {
    try {
      // Add and commit new files
      const repoDir = path.resolve(__dirname, '../../');
      
      await execAsync('git add src/content/blog/ public/images/blog/', {
        cwd: repoDir
      });

      const commitMessage = `feat: Auto-publish blog posts - ${new Date().toISOString()}`;
      await execAsync(`git commit -m "${commitMessage}"`, {
        cwd: repoDir
      });

      if (process.env.AUTO_PUSH === 'true') {
        await execAsync('git push origin main', {
          cwd: repoDir
        });
        this.log('Changes pushed - GitHub Actions deployment triggered');
      } else {
        this.log('Changes committed - set AUTO_PUSH=true to automatically trigger deployment');
      }

    } catch (error) {
      throw new Error(`GitHub deployment failed: ${error.message}`);
    }
  }

  /**
   * Send failure notifications
   */
  async notifyFailure(error) {
    try {
      const notificationMethod = process.env.NOTIFICATION_METHOD || 'log';
      
      const errorDetails = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      };

      switch (notificationMethod) {
        case 'email':
          await this.sendEmailNotification(errorDetails);
          break;
          
        case 'slack':
          await this.sendSlackNotification(errorDetails);
          break;
          
        case 'webhook':
          await this.sendWebhookNotification(errorDetails);
          break;
          
        default:
          this.log('Blog automation failed:', JSON.stringify(errorDetails, null, 2));
      }

    } catch (notificationError) {
      this.log('Failed to send failure notification:', notificationError.message);
    }
  }

  /**
   * Send email notification (placeholder)
   */
  async sendEmailNotification(errorDetails) {
    // Implementation would depend on email service (SendGrid, AWS SES, etc.)
    this.log('Email notification would be sent:', errorDetails);
  }

  /**
   * Send Slack notification (placeholder)
   */
  async sendSlackNotification(errorDetails) {
    // Implementation would use Slack webhook URL
    this.log('Slack notification would be sent:', errorDetails);
  }

  /**
   * Send webhook notification (placeholder)
   */
  async sendWebhookNotification(errorDetails) {
    // Implementation would POST to configured webhook URL
    this.log('Webhook notification would be sent:', errorDetails);
  }

  /**
   * Log messages with timestamp
   */
  log(...messages) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${messages.join(' ')}`;
    
    console.log(logMessage);
    
    // Append to log file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  /**
   * Delay utility
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (await fs.pathExists(this.lockFile)) {
        await fs.remove(this.lockFile);
      }
    } catch (error) {
      this.log('Cleanup error:', error.message);
    }
  }
}

/**
 * Cron job setup instructions
 */
function printCronInstructions() {
  console.log(`
📅 SCHEDULING SETUP INSTRUCTIONS

To schedule automatic blog publishing, add one of these cron jobs:

# Every hour during business hours (9 AM - 5 PM, Mon-Fri)
0 9-17 * * 1-5 cd ${__dirname} && node scheduler.js

# Every 6 hours, every day
0 */6 * * * cd ${__dirname} && node scheduler.js

# Daily at 10 AM
0 10 * * * cd ${__dirname} && node scheduler.js

To add a cron job:
1. Run: crontab -e
2. Add one of the lines above
3. Save and exit

Environment Variables for Automation:
- AUTO_PUBLISH=true           Enable automatic publishing
- AUTO_PUSH=true             Automatically push to git
- DEPLOYMENT_METHOD=vercel   Set deployment method
- NOTIFICATION_METHOD=log    Set notification method

Current Status:
- Auto Publish: ${process.env.AUTO_PUBLISH || 'false'}
- Auto Push: ${process.env.AUTO_PUSH || 'false'}
- Deployment: ${process.env.DEPLOYMENT_METHOD || 'manual'}
- Notifications: ${process.env.NOTIFICATION_METHOD || 'log'}
`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 Blog Automation Scheduler

Usage: node scheduler.js [options]

Options:
  --help, -h        Show this help message
  --setup          Show cron job setup instructions
  --test           Run a test publishing attempt
  --force          Force run even if auto-publish is disabled

Examples:
  node scheduler.js              # Run scheduled publishing
  node scheduler.js --setup      # Show setup instructions
  node scheduler.js --test       # Test run
`);
    return;
  }

  // Show setup instructions
  if (args.includes('--setup')) {
    printCronInstructions();
    return;
  }

  // Run scheduler
  const scheduler = new BlogScheduler();
  
  try {
    await scheduler.initialize();
    
    // Force mode or test mode
    if (args.includes('--force')) {
      process.env.AUTO_PUBLISH = 'true';
    }
    
    if (args.includes('--test')) {
      process.env.DRY_RUN = 'true';
      scheduler.log('Running in test mode');
    }
    
    await scheduler.runScheduledPublishing();
    
  } catch (error) {
    console.error('Scheduler failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}