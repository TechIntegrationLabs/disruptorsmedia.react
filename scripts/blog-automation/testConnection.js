#!/usr/bin/env node

import { EnvLoader } from './config/envLoader.js';
import { SheetsService } from './services/sheetsService.js';
import { DocsService } from './services/docsService.js';
import OpenAI from 'openai';

EnvLoader.load();

/**
 * Test all service connections
 */
class ConnectionTester {
  constructor() {
    this.results = {
      googleSheets: false,
      googleDocs: false,
      openAI: false,
      environment: false
    };
  }

  /**
   * Test environment variables
   */
  testEnvironment() {
    console.log('🔧 Testing Environment Configuration...');
    
    const required = [
      'GOOGLE_APPLICATION_CREDENTIALS',
      'SPREADSHEET_ID',
      'OPENAI_API_KEY'
    ];

    const optional = [
      'SHEET_NAME',
      'BLOG_CONTENT_PATH',
      'BLOG_IMAGES_PATH',
      'IMAGE_MODEL',
      'DRY_RUN'
    ];

    let allRequired = true;

    console.log('\n📋 Required Variables:');
    required.forEach(varName => {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
      if (!value) allRequired = false;
    });

    console.log('\n📋 Optional Variables:');
    optional.forEach(varName => {
      const value = process.env[varName];
      const status = value ? '✅' : '⚠️ ';
      console.log(`  ${status} ${varName}: ${value || 'Not set (using default)'}`);
    });

    this.results.environment = allRequired;
    
    if (allRequired) {
      console.log('\n✅ Environment configuration is complete');
    } else {
      console.log('\n❌ Environment configuration is incomplete');
    }

    return allRequired;
  }

  /**
   * Test Google Sheets connection
   */
  async testGoogleSheets() {
    console.log('\n📊 Testing Google Sheets Connection...');
    
    try {
      const sheetsService = new SheetsService();
      await sheetsService.initialize();
      
      // Test reading the spreadsheet
      const rows = await sheetsService.getAllRows();
      console.log(`✅ Successfully connected to Google Sheets`);
      console.log(`📄 Found ${rows.length} rows in spreadsheet`);
      
      // Test parsing posts ready for publishing
      const approvedPosts = await sheetsService.getPostsReadyForPublishing();
      console.log(`✅ Found ${approvedPosts.length} posts ready for publishing (approved + date ready)`);
      
      if (approvedPosts.length > 0) {
        console.log('\n📝 Sample approved post:');
        const sample = approvedPosts[0];
        console.log(`   Row: ${sample.rowIndex}`);
        console.log(`   Title: ${sample.title || 'Not specified'}`);
        console.log(`   URL: ${sample.postUrl.substring(0, 50)}...`);
        console.log(`   Approved: ${sample.approved}`);
      }

      this.results.googleSheets = true;
      return true;
    } catch (error) {
      console.error('❌ Google Sheets connection failed:', error.message);
      this.results.googleSheets = false;
      return false;
    }
  }

  /**
   * Test Google Docs connection
   */
  async testGoogleDocs() {
    console.log('\n📄 Testing Google Docs Connection...');
    
    try {
      // First get a sample document URL from sheets
      const sheetsService = new SheetsService();
      await sheetsService.initialize();
      const approvedPosts = await sheetsService.getPostsReadyForPublishing();
      
      if (approvedPosts.length === 0) {
        console.log('⚠️  No posts ready for publishing (approved + date ready) found for testing');
        this.results.googleDocs = false;
        return false;
      }

      const samplePost = approvedPosts[0];
      const docId = sheetsService.extractDocId(samplePost.postUrl);
      
      console.log(`📖 Testing with document ID: ${docId}`);
      
      const docsService = new DocsService();
      await docsService.initialize();
      
      const content = await docsService.getDocumentContent(docId);
      
      console.log('✅ Successfully connected to Google Docs');
      console.log(`📝 Sample document: "${content.title}"`);
      console.log(`📊 Word count: ${content.wordCount}`);
      console.log(`🕐 Reading time: ${docsService.calculateReadingTime(content.content)} minutes`);
      
      this.results.googleDocs = true;
      return true;
    } catch (error) {
      console.error('❌ Google Docs connection failed:', error.message);
      this.results.googleDocs = false;
      return false;
    }
  }

  /**
   * Test OpenAI connection
   */
  async testOpenAI() {
    console.log('\n🤖 Testing OpenAI Connection...');
    
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Test with a simple request to verify API key and connection
      console.log('🔑 Validating API key...');
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: 'A simple test image: a blue circle on white background',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      });

      if (response.data && response.data.length > 0) {
        console.log('✅ OpenAI connection successful');
        console.log(`🎨 Test image generated: ${response.data[0].url.substring(0, 50)}...`);
        console.log('⚠️  Note: This was a real image generation that consumed API credits');
      } else {
        throw new Error('No image data received from OpenAI');
      }

      this.results.openAI = true;
      return true;
    } catch (error) {
      console.error('❌ OpenAI connection failed:', error.message);
      
      if (error.status === 401) {
        console.error('🔑 Invalid API key - check your OPENAI_API_KEY');
      } else if (error.status === 429) {
        console.error('⏳ Rate limit exceeded - try again later');
      } else if (error.status === 402) {
        console.error('💳 Insufficient credits - check your OpenAI billing');
      }
      
      this.results.openAI = false;
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🔍 Blog Automation System - Connection Test\n');
    console.log('='.repeat(50));
    
    // Test environment first
    const envOk = this.testEnvironment();
    
    if (!envOk) {
      console.log('\n❌ Environment test failed. Please fix configuration before testing connections.');
      this.printSummary();
      return false;
    }

    // Test all connections
    await this.testGoogleSheets();
    await this.testGoogleDocs();
    await this.testOpenAI();

    this.printSummary();
    
    const allPassed = Object.values(this.results).every(result => result === true);
    return allPassed;
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 CONNECTION TEST SUMMARY');
    console.log('='.repeat(50));
    
    const tests = [
      { name: 'Environment Configuration', result: this.results.environment },
      { name: 'Google Sheets API', result: this.results.googleSheets },
      { name: 'Google Docs API', result: this.results.googleDocs },
      { name: 'OpenAI DALL-E API', result: this.results.openAI }
    ];

    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
    });

    const passCount = tests.filter(test => test.result).length;
    const totalCount = tests.length;

    console.log(`\n📈 Results: ${passCount}/${totalCount} tests passed`);

    if (passCount === totalCount) {
      console.log('\n🎉 All systems operational! Ready for blog automation.');
      console.log('\nNext steps:');
      console.log('  1. Run: npm run publish-posts --dry-run');
      console.log('  2. Review the dry run results');
      console.log('  3. Run: npm run publish-posts (for real publishing)');
    } else {
      console.log('\n⚠️  Some systems failed. Please resolve issues before proceeding.');
      console.log('\nSetup checklist:');
      if (!this.results.environment) {
        console.log('  [ ] Configure missing environment variables');
      }
      if (!this.results.googleSheets) {
        console.log('  [ ] Set up Google Sheets API access');
      }
      if (!this.results.googleDocs) {
        console.log('  [ ] Set up Google Docs API access');
      }
      if (!this.results.openAI) {
        console.log('  [ ] Configure OpenAI API key and billing');
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

/**
 * Main function
 */
async function main() {
  const tester = new ConnectionTester();
  
  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Test runner crashed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}