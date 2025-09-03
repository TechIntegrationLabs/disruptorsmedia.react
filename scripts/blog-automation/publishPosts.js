#!/usr/bin/env node

import dotenv from 'dotenv';
import { SheetsService } from './services/sheetsService.js';
import { DocsService } from './services/docsService.js';
import { ImageService } from './services/imageService.js';
import { MdxService } from './services/mdxService.js';

dotenv.config();

/**
 * Main Blog Post Publishing Automation
 */
class BlogPublisher {
  constructor() {
    this.sheetsService = new SheetsService();
    this.docsService = new DocsService();
    this.imageService = new ImageService();
    this.mdxService = new MdxService();
    
    this.dryRun = process.env.DRY_RUN === 'true';
    this.requireApproval = process.env.REQUIRE_APPROVAL !== 'false';
    
    this.publishedPosts = [];
    this.failedPosts = [];
  }

  /**
   * Initialize all services
   */
  async initialize() {
    console.log('🚀 Initializing Blog Publishing System...\n');
    
    try {
      await this.sheetsService.initialize();
      await this.docsService.initialize();
      console.log('✅ All services initialized successfully\n');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error.message);
      throw error;
    }
  }

  /**
   * Main publishing workflow
   */
  async publishApprovedPosts() {
    try {
      console.log('📋 Starting automated blog post publishing...\n');
      
      if (this.dryRun) {
        console.log('🧪 DRY RUN MODE - No files will be created\n');
      }

      // Get posts ready for publishing (approved + date ready)
      const approvedPosts = await this.sheetsService.getPostsReadyForPublishing();
      
      if (approvedPosts.length === 0) {
        console.log('📝 No approved posts found for publishing');
        return { published: [], failed: [] };
      }

      console.log(`📚 Processing ${approvedPosts.length} approved posts...\n`);

      // Process each post
      for (const post of approvedPosts) {
        try {
          console.log(`\n📄 Processing post: Row ${post.rowIndex}`);
          await this.processPost(post);
        } catch (error) {
          console.error(`❌ Failed to process post (Row ${post.rowIndex}):`, error.message);
          this.failedPosts.push({
            post,
            error: error.message
          });
        }

        // Rate limiting between posts
        await this.delay(3000);
      }

      // Summary
      this.printSummary();
      
      return {
        published: this.publishedPosts,
        failed: this.failedPosts
      };

    } catch (error) {
      console.error('❌ Publishing workflow failed:', error.message);
      throw error;
    }
  }

  /**
   * Process individual blog post
   */
  async processPost(post) {
    const stepTimer = Date.now();

    try {
      // Step 1: Extract Google Docs content
      console.log('  📖 Fetching content from Google Docs...');
      const docId = this.sheetsService.extractDocId(post.postUrl);
      const docContent = await this.docsService.getDocumentContent(docId);
      
      console.log(`  ✅ Content retrieved: ${docContent.wordCount} words`);

      // Step 2: Generate images with DALL-E
      console.log('  🎨 Generating blog images...');
      const slug = this.mdxService.generateSlug(docContent.title);
      
      let images = { feature: '', additional: [] };
      
      if (!this.dryRun) {
        try {
          // Generate feature image
          const featureImage = await this.imageService.generateFeatureImage(
            docContent.title, 
            docContent.content, 
            slug
          );
          images.feature = featureImage;

          // Generate additional content images
          const additionalImages = await this.imageService.generateContentImages(
            docContent.title, 
            docContent.content, 
            slug, 
            2
          );
          images.additional = additionalImages;

          console.log(`  ✅ Generated ${1 + additionalImages.length} images`);
        } catch (imageError) {
          console.warn('  ⚠️  Image generation failed, continuing without images:', imageError.message);
        }
      } else {
        console.log('  🧪 DRY RUN: Skipping image generation');
      }

      // Step 3: Create MDX blog post
      console.log('  📝 Creating MDX blog post...');
      
      const blogPostData = {
        title: docContent.title,
        content: docContent.content,
        docId: docContent.docId,
        rowIndex: post.rowIndex,
        keywords: post.keywords,
        publishDate: post.publishDate,
        images: images,
        featured: false // Could be determined by some criteria
      };

      let mdxResult;
      if (!this.dryRun) {
        mdxResult = await this.mdxService.createBlogPost(blogPostData);
        console.log(`  ✅ MDX file created: ${mdxResult.filename}`);
      } else {
        mdxResult = {
          slug: slug,
          filename: `${slug}.mdx`,
          url: `/blog/2024/${slug}` // Mock for dry run
        };
        console.log('  🧪 DRY RUN: MDX file creation simulated');
      }

      // Step 4: Record success
      const processingTime = ((Date.now() - stepTimer) / 1000).toFixed(1);
      
      this.publishedPosts.push({
        post: post,
        result: mdxResult,
        title: docContent.title,
        slug: slug,
        wordCount: docContent.wordCount,
        imagesGenerated: images.additional.length + (images.feature ? 1 : 0),
        processingTime: `${processingTime}s`
      });

      console.log(`  🎉 Post published successfully in ${processingTime}s`);
      console.log(`  🌐 URL: ${mdxResult.url}`);

    } catch (error) {
      console.error(`  ❌ Post processing failed:`, error.message);
      throw error;
    }
  }

  /**
   * Print processing summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BLOG PUBLISHING SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`✅ Successfully Published: ${this.publishedPosts.length} posts`);
    console.log(`❌ Failed: ${this.failedPosts.length} posts`);
    
    if (this.publishedPosts.length > 0) {
      console.log('\n📚 Published Posts:');
      this.publishedPosts.forEach((published, index) => {
        console.log(`  ${index + 1}. ${published.title}`);
        console.log(`     Slug: ${published.slug}`);
        console.log(`     Words: ${published.wordCount} | Images: ${published.imagesGenerated} | Time: ${published.processingTime}`);
        console.log(`     URL: ${published.result.url}`);
      });
    }

    if (this.failedPosts.length > 0) {
      console.log('\n❌ Failed Posts:');
      this.failedPosts.forEach((failed, index) => {
        console.log(`  ${index + 1}. Row ${failed.post.rowIndex}: ${failed.error}`);
      });
    }

    const totalImages = this.publishedPosts.reduce((sum, post) => sum + post.imagesGenerated, 0);
    const totalWords = this.publishedPosts.reduce((sum, post) => sum + post.wordCount, 0);
    
    console.log(`\n📈 Statistics:`);
    console.log(`   Total Images Generated: ${totalImages}`);
    console.log(`   Total Words Processed: ${totalWords.toLocaleString()}`);
    
    if (this.dryRun) {
      console.log('\n🧪 DRY RUN COMPLETED - No files were actually created');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Utility function for delays
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const publisher = new BlogPublisher();
  
  try {
    await publisher.initialize();
    const results = await publisher.publishApprovedPosts();
    
    // Exit with appropriate code
    const exitCode = results.failed.length > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('\n💥 Fatal error in blog publishing system:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Blog Post Publishing Automation

Usage: node publishPosts.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Simulate publishing without creating files
  --force        Skip approval checks (use with caution)

Environment Variables:
  DRY_RUN=true          Enable dry run mode
  REQUIRE_APPROVAL=true Require approval column check
  AUTO_PUBLISH=false    Automatically publish without confirmation

Examples:
  node publishPosts.js                    # Normal publishing
  node publishPosts.js --dry-run          # Test run
  DRY_RUN=true node publishPosts.js       # Test via env var
`);
  process.exit(0);
}

// Set CLI overrides
if (args.includes('--dry-run')) {
  process.env.DRY_RUN = 'true';
}
if (args.includes('--force')) {
  process.env.REQUIRE_APPROVAL = 'false';
}

// Run the main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}