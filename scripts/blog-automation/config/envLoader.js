import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Environment Configuration Loader
 * Loads environment variables from multiple possible locations
 */
export class EnvLoader {
  static load() {
    // Try to load from root directory first (preferred)
    const rootEnvPath = path.resolve(__dirname, '../../../.env');
    
    // Then try local directory as fallback
    const localEnvPath = path.resolve(__dirname, '../.env');
    
    let loaded = false;
    
    if (fs.existsSync(rootEnvPath)) {
      console.log('📄 Loading environment from root .env file');
      dotenv.config({ path: rootEnvPath });
      loaded = true;
    } else if (fs.existsSync(localEnvPath)) {
      console.log('📄 Loading environment from local .env file');
      dotenv.config({ path: localEnvPath });
      loaded = true;
    } else {
      console.log('⚠️  No .env file found. Using environment variables or defaults.');
    }

    // Resolve relative paths based on where we're running from
    this.resolvePaths();
    
    return loaded;
  }

  /**
   * Resolve relative paths in environment variables
   */
  static resolvePaths() {
    const rootDir = path.resolve(__dirname, '../../..');
    
    // Resolve Google credentials path
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      // Try root directory first
      const rootCredPath = path.resolve(rootDir, process.env.GOOGLE_APPLICATION_CREDENTIALS);
      const localCredPath = path.resolve(__dirname, '..', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      
      if (fs.existsSync(rootCredPath)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = rootCredPath;
        console.log(`🔑 Using Google credentials from root: ${rootCredPath}`);
      } else if (fs.existsSync(localCredPath)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = localCredPath;
        console.log(`🔑 Using Google credentials from local: ${localCredPath}`);
      } else {
        console.log(`⚠️  Google credentials file not found: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      }
    }

    // Resolve blog content paths
    if (process.env.BLOG_CONTENT_PATH && !path.isAbsolute(process.env.BLOG_CONTENT_PATH)) {
      if (process.env.BLOG_CONTENT_PATH.startsWith('./')) {
        // Root-relative path
        process.env.BLOG_CONTENT_PATH = path.resolve(rootDir, process.env.BLOG_CONTENT_PATH);
      } else if (process.env.BLOG_CONTENT_PATH.startsWith('../')) {
        // Automation-relative path  
        process.env.BLOG_CONTENT_PATH = path.resolve(__dirname, '..', process.env.BLOG_CONTENT_PATH);
      }
      console.log(`📁 Blog content path: ${process.env.BLOG_CONTENT_PATH}`);
    }

    // Resolve blog images path
    if (process.env.BLOG_IMAGES_PATH && !path.isAbsolute(process.env.BLOG_IMAGES_PATH)) {
      if (process.env.BLOG_IMAGES_PATH.startsWith('./')) {
        // Root-relative path
        process.env.BLOG_IMAGES_PATH = path.resolve(rootDir, process.env.BLOG_IMAGES_PATH);
      } else if (process.env.BLOG_IMAGES_PATH.startsWith('../')) {
        // Automation-relative path
        process.env.BLOG_IMAGES_PATH = path.resolve(__dirname, '..', process.env.BLOG_IMAGES_PATH);
      }
      console.log(`🖼️  Blog images path: ${process.env.BLOG_IMAGES_PATH}`);
    }

    // Resolve log file path
    if (process.env.LOG_FILE && !path.isAbsolute(process.env.LOG_FILE)) {
      process.env.LOG_FILE = path.resolve(__dirname, '..', process.env.LOG_FILE);
    }
  }

  /**
   * Get configuration summary
   */
  static getConfigSummary() {
    return {
      hasOpenAI: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
      hasGoogleCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      spreadsheetId: process.env.SPREADSHEET_ID,
      blogContentPath: process.env.BLOG_CONTENT_PATH,
      blogImagesPath: process.env.BLOG_IMAGES_PATH,
      dryRun: process.env.DRY_RUN === 'true',
      autoPublish: process.env.AUTO_PUBLISH === 'true'
    };
  }
}