import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import slugify from 'slugify';
import { fileURLToPath } from 'url';
import { EnvLoader } from '../config/envLoader.js';

EnvLoader.load();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MDX File Generation Service
 */
export class MdxService {
  constructor() {
    this.contentPath = process.env.BLOG_CONTENT_PATH || '../../src/content/blog';
    this.baseUrl = process.env.BLOG_BASE_URL || 'https://disruptorsmedia.com';
  }

  /**
   * Create MDX blog post file
   */
  async createBlogPost(postData) {
    try {
      const slug = this.generateSlug(postData.title);
      const publishDate = new Date();
      const year = publishDate.getFullYear();
      
      console.log(`📝 Creating MDX file for: ${postData.title}`);

      // Create frontmatter
      const frontmatter = this.generateFrontmatter({
        ...postData,
        slug,
        publishDate
      });

      // Process content for MDX
      const processedContent = this.processContentForMdx(postData.content, postData.images);

      // Create full MDX content
      const mdxContent = matter.stringify(processedContent, frontmatter);

      // Ensure directory exists
      const yearDir = path.resolve(__dirname, this.contentPath, year.toString());
      await fs.ensureDir(yearDir);

      // Write file
      const filename = `${slug}.mdx`;
      const filepath = path.join(yearDir, filename);
      
      await fs.writeFile(filepath, mdxContent, 'utf8');

      console.log(`✅ MDX file created: ${filepath}`);

      return {
        slug,
        filepath,
        year,
        filename,
        url: `/blog/${year}/${slug}`
      };
    } catch (error) {
      console.error('❌ Error creating MDX file:', error.message);
      throw error;
    }
  }

  /**
   * Generate URL-safe slug from title
   */
  generateSlug(title) {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }

  /**
   * Generate frontmatter for blog post
   */
  generateFrontmatter(postData) {
    const publishDate = postData.publishDate || new Date();
    const updatedAt = new Date();

    return {
      title: postData.title,
      description: this.generateDescription(postData.content),
      slug: postData.slug,
      publishedAt: publishDate.toISOString(),
      updatedAt: updatedAt.toISOString(),
      author: 'disruptors-media',
      category: this.inferCategory(postData.content),
      tags: this.extractTags(postData.content, postData.keywords),
      featured: postData.featured || false,
      readingTime: this.calculateReadingTime(postData.content),
      seo: {
        metaTitle: `${postData.title} | Disruptors Media`,
        metaDescription: this.generateDescription(postData.content),
        keywords: this.extractKeywords(postData.content, postData.keywords)
      },
      image: {
        src: postData.images?.feature || '',
        alt: `${postData.title} - Blog Post Featured Image`,
        width: 1200,
        height: 630
      },
      status: 'published',
      source: {
        googleDocId: postData.docId,
        spreadsheetRow: postData.rowIndex,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Process content for MDX format
   */
  processContentForMdx(content, images = {}) {
    let processedContent = content;

    // Convert basic markdown formatting
    processedContent = this.enhanceMarkdownFormatting(processedContent);

    // Insert images at strategic points
    if (images.additional && images.additional.length > 0) {
      processedContent = this.insertContentImages(processedContent, images.additional);
    }

    // Add table of contents marker if content is long enough
    if (this.calculateReadingTime(processedContent) > 5) {
      processedContent = `<TableOfContents />\n\n${processedContent}`;
    }

    // Add reading progress component for long articles
    if (this.calculateReadingTime(processedContent) > 3) {
      processedContent = `<ReadingProgress />\n\n${processedContent}`;
    }

    return processedContent;
  }

  /**
   * Enhance markdown formatting
   */
  enhanceMarkdownFormatting(content) {
    let enhanced = content;

    // Ensure proper heading hierarchy
    enhanced = enhanced.replace(/^#{7,}/gm, '######'); // Max 6 heading levels

    // Add proper spacing around headings
    enhanced = enhanced.replace(/\n(#{1,6}.*)\n/g, '\n\n$1\n\n');

    // Ensure proper paragraph spacing
    enhanced = enhanced.replace(/\n{3,}/g, '\n\n');

    // Convert quotes to blockquotes if they look like quotes
    enhanced = enhanced.replace(/^"(.+)"$/gm, '> $1');

    // Enhance lists formatting
    enhanced = enhanced.replace(/^(\d+)\.\s+/gm, '$1. ');
    enhanced = enhanced.replace(/^[-*]\s+/gm, '- ');

    return enhanced.trim();
  }

  /**
   * Insert content images strategically throughout the article
   */
  insertContentImages(content, additionalImages) {
    const paragraphs = content.split('\n\n');
    const totalParagraphs = paragraphs.length;
    const imageCount = additionalImages.length;

    if (imageCount === 0 || totalParagraphs < 4) {
      return content;
    }

    // Calculate insertion points (roughly evenly distributed)
    const insertionPoints = [];
    for (let i = 0; i < imageCount; i++) {
      const position = Math.floor((totalParagraphs / (imageCount + 1)) * (i + 1));
      insertionPoints.push(Math.max(2, Math.min(position, totalParagraphs - 2))); // Avoid first and last paragraphs
    }

    // Insert images from bottom to top to maintain indices
    insertionPoints.reverse().forEach((point, index) => {
      const imageIndex = imageCount - 1 - index;
      const imagePath = additionalImages[imageIndex];
      const imageComponent = `\n\n<BlogImage \n  src="${imagePath}" \n  alt="Supporting illustration for blog content" \n  caption="Visual representation of key concepts discussed in this article" \n/>\n\n`;
      
      paragraphs.splice(point, 0, imageComponent);
    });

    return paragraphs.join('\n\n');
  }

  /**
   * Generate meta description from content
   */
  generateDescription(content) {
    // Remove markdown formatting and get first paragraph
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    // Get first sentence or 150 characters, whichever is shorter
    const firstSentence = plainText.split('.')[0];
    const description = firstSentence.length > 150 
      ? plainText.substring(0, 150) + '...'
      : firstSentence + '.';

    return description;
  }

  /**
   * Calculate reading time in minutes
   */
  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Infer category from content
   */
  inferCategory(content) {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence') || contentLower.includes('machine learning')) {
      return 'AI & Technology';
    } else if (contentLower.includes('marketing') || contentLower.includes('digital strategy')) {
      return 'Digital Strategy';  
    } else if (contentLower.includes('case study') || contentLower.includes('client') || contentLower.includes('success')) {
      return 'Case Studies';
    } else if (contentLower.includes('tutorial') || contentLower.includes('how to') || contentLower.includes('step by step')) {
      return 'Tutorials';
    } else if (contentLower.includes('creative') || contentLower.includes('design') || contentLower.includes('content')) {
      return 'Creative Content';
    } else {
      return 'Industry Insights';
    }
  }

  /**
   * Extract tags from content and keywords
   */
  extractTags(content, keywords = '') {
    const tags = new Set();
    const contentLower = content.toLowerCase();
    
    // Add keywords if provided
    if (keywords) {
      keywords.split(',').forEach(keyword => {
        const cleanKeyword = keyword.trim().toLowerCase().replace(/\s+/g, '-');
        if (cleanKeyword) tags.add(cleanKeyword);
      });
    }

    // Auto-detect common topics
    const topicMap = {
      'artificial-intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural network'],
      'digital-marketing': ['marketing', 'digital marketing', 'seo', 'social media'],
      'strategy': ['strategy', 'planning', 'business strategy'],
      'automation': ['automation', 'automated', 'workflow'],
      'analytics': ['analytics', 'data', 'metrics', 'tracking'],
      'content-creation': ['content', 'creative', 'writing', 'storytelling'],
      'technology': ['technology', 'tech', 'software', 'tools'],
      'business-growth': ['growth', 'scaling', 'expansion', 'revenue']
    };

    Object.entries(topicMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        tags.add(tag);
      }
    });

    // Ensure we have at least 3 tags
    const tagArray = Array.from(tags);
    while (tagArray.length < 3) {
      const defaultTags = ['business', 'insights', 'strategy', 'marketing', 'technology'];
      const randomTag = defaultTags[Math.floor(Math.random() * defaultTags.length)];
      if (!tagArray.includes(randomTag)) {
        tagArray.push(randomTag);
      }
    }

    return tagArray.slice(0, 6); // Maximum 6 tags
  }

  /**
   * Extract SEO keywords
   */
  extractKeywords(content, providedKeywords = '') {
    const keywords = [];
    
    if (providedKeywords) {
      keywords.push(...providedKeywords.split(',').map(k => k.trim()));
    }

    // Add automatic keywords based on content
    const contentLower = content.toLowerCase();
    const autoKeywords = [
      'disruptors media',
      'ai marketing agency',
      'digital marketing'
    ];

    if (contentLower.includes('ai')) autoKeywords.push('artificial intelligence marketing');
    if (contentLower.includes('automation')) autoKeywords.push('marketing automation');
    if (contentLower.includes('strategy')) autoKeywords.push('digital strategy');

    keywords.push(...autoKeywords);
    
    return keywords.slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Update existing blog post
   */
  async updateBlogPost(slug, updates) {
    try {
      // Find existing file
      const existingFile = await this.findBlogPostFile(slug);
      if (!existingFile) {
        throw new Error(`Blog post with slug "${slug}" not found`);
      }

      // Read existing content
      const existingContent = await fs.readFile(existingFile.filepath, 'utf8');
      const parsed = matter(existingContent);

      // Update frontmatter
      const updatedFrontmatter = {
        ...parsed.data,
        ...updates.frontmatter,
        updatedAt: new Date().toISOString()
      };

      // Use existing content unless new content provided
      const content = updates.content || parsed.content;

      // Create updated MDX
      const updatedMdx = matter.stringify(content, updatedFrontmatter);

      // Write updated file
      await fs.writeFile(existingFile.filepath, updatedMdx, 'utf8');

      console.log(`✅ Updated blog post: ${existingFile.filepath}`);
      return existingFile;
    } catch (error) {
      console.error('❌ Error updating blog post:', error.message);
      throw error;
    }
  }

  /**
   * Find blog post file by slug
   */
  async findBlogPostFile(slug) {
    try {
      const contentDir = path.resolve(__dirname, this.contentPath);
      const years = await fs.readdir(contentDir);

      for (const year of years) {
        const yearDir = path.join(contentDir, year);
        const stat = await fs.stat(yearDir);
        
        if (stat.isDirectory()) {
          const filename = `${slug}.mdx`;
          const filepath = path.join(yearDir, filename);
          
          if (await fs.pathExists(filepath)) {
            return {
              slug,
              filepath,
              year,
              filename,
              url: `/blog/${year}/${slug}`
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding blog post file:', error.message);
      return null;
    }
  }
}