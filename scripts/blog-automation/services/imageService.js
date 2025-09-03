import OpenAI from 'openai';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * OpenAI Image Generation Service
 */
export class ImageService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.imageModel = process.env.IMAGE_MODEL || 'dall-e-3';
    this.imageSize = process.env.IMAGE_SIZE || '1024x1024';
    this.imageQuality = process.env.IMAGE_QUALITY || 'standard';
    this.imagesPath = process.env.BLOG_IMAGES_PATH || '../../public/images/blog';
  }

  /**
   * Generate feature image for blog post
   */
  async generateFeatureImage(title, content, slug) {
    try {
      console.log(`🎨 Generating feature image for: ${title}`);
      
      const prompt = this.createFeatureImagePrompt(title, content);
      const imageUrl = await this.generateImage(prompt);
      const imagePath = await this.downloadAndOptimizeImage(imageUrl, slug, 'feature');
      
      console.log(`✅ Feature image generated: ${imagePath}`);
      return imagePath;
    } catch (error) {
      console.error('❌ Error generating feature image:', error.message);
      throw error;
    }
  }

  /**
   * Generate additional content images
   */
  async generateContentImages(title, content, slug, count = 2) {
    try {
      console.log(`🎨 Generating ${count} content images for: ${title}`);
      
      const prompts = this.createContentImagePrompts(title, content, count);
      const imagePaths = [];

      for (let i = 0; i < prompts.length; i++) {
        try {
          const imageUrl = await this.generateImage(prompts[i]);
          const imagePath = await this.downloadAndOptimizeImage(imageUrl, slug, `content-${i + 1}`);
          imagePaths.push(imagePath);
          console.log(`✅ Content image ${i + 1} generated: ${imagePath}`);
          
          // Rate limiting - wait between requests
          if (i < prompts.length - 1) {
            await this.delay(2000); // 2 second delay between requests
          }
        } catch (error) {
          console.error(`⚠️  Failed to generate content image ${i + 1}:`, error.message);
          // Continue with other images even if one fails
        }
      }

      return imagePaths;
    } catch (error) {
      console.error('❌ Error generating content images:', error.message);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Generate image using DALL-E
   */
  async generateImage(prompt) {
    try {
      console.log(`🤖 Generating image with prompt: ${prompt.substring(0, 100)}...`);
      
      const response = await this.openai.images.generate({
        model: this.imageModel,
        prompt: prompt,
        n: 1,
        size: this.imageSize,
        quality: this.imageQuality,
        response_format: 'url'
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image generated from OpenAI');
      }

      return response.data[0].url;
    } catch (error) {
      if (error.status === 429) {
        console.log('⏳ Rate limit hit, waiting 60 seconds...');
        await this.delay(60000);
        return this.generateImage(prompt); // Retry
      }
      throw error;
    }
  }

  /**
   * Download image and optimize for web
   */
  async downloadAndOptimizeImage(imageUrl, slug, type) {
    try {
      // Create images directory if it doesn't exist
      const imagesDir = path.resolve(__dirname, this.imagesPath);
      await fs.ensureDir(imagesDir);

      // Create subdirectory for this post
      const postDir = path.join(imagesDir, slug);
      await fs.ensureDir(postDir);

      // Download image
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer'
      });

      // Generate filename
      const filename = `${type}.jpg`;
      const filepath = path.join(postDir, filename);

      // Optimize image with Sharp
      await sharp(response.data)
        .jpeg({ 
          quality: 85, 
          progressive: true 
        })
        .resize(1200, 630, { 
          fit: 'cover',
          withoutEnlargement: false 
        })
        .toFile(filepath);

      // Generate WebP version for better performance
      const webpFilepath = path.join(postDir, `${type}.webp`);
      await sharp(response.data)
        .webp({ 
          quality: 85 
        })
        .resize(1200, 630, { 
          fit: 'cover',
          withoutEnlargement: false 
        })
        .toFile(webpFilepath);

      // Return relative path for use in blog posts
      const relativePath = `/images/blog/${slug}/${filename}`;
      return relativePath;
    } catch (error) {
      console.error('❌ Error downloading/optimizing image:', error.message);
      throw error;
    }
  }

  /**
   * Create feature image prompt based on content
   */
  createFeatureImagePrompt(title, content) {
    const basePrompt = `Create a professional, modern blog header image for an article titled "${title}". `;
    
    // Analyze content for specific themes
    const contentLower = content.toLowerCase();
    let styleAddition = '';

    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence')) {
      styleAddition = 'Include subtle AI and technology elements like neural networks, data flows, or futuristic interfaces. ';
    } else if (contentLower.includes('marketing') || contentLower.includes('digital')) {
      styleAddition = 'Include marketing and digital strategy elements like growth charts, target symbols, or communication networks. ';
    } else if (contentLower.includes('business') || contentLower.includes('strategy')) {
      styleAddition = 'Include business strategy elements like upward trends, collaboration, or success indicators. ';
    }

    const finalPrompt = basePrompt + styleAddition + 
      'Style: clean, professional, modern gradient background, high contrast text areas, 16:9 aspect ratio suitable for blog headers. ' +
      'Colors: use modern tech colors like deep blues, purples, or teals with white/light accents. ' +
      'Avoid text in the image. Focus on visual metaphors and abstract elements.';

    return finalPrompt;
  }

  /**
   * Create content image prompts based on article content
   */
  createContentImagePrompts(title, content, count) {
    const prompts = [];
    const contentLower = content.toLowerCase();

    // First content image - related to main topic
    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence')) {
      prompts.push('Create a sleek illustration of AI concepts: neural networks, machine learning algorithms, or data processing. Style: modern, professional, abstract, suitable for business content. Colors: tech blues and purples with clean backgrounds.');
    } else if (contentLower.includes('marketing')) {
      prompts.push('Create a modern marketing illustration: customer journey, growth metrics, or digital channels. Style: clean, professional, business-focused. Colors: modern gradients with clear visual hierarchy.');
    } else {
      prompts.push(`Create a supporting illustration that complements an article about "${title}". Style: modern, professional, abstract, suitable for business/tech blog content.`);
    }

    // Second content image - more general business/tech theme
    if (contentLower.includes('data') || contentLower.includes('analytics')) {
      prompts.push('Create a data visualization illustration: charts, graphs, dashboards, or analytics concepts. Style: clean, modern, professional. Colors: use data visualization colors like blues, greens, and oranges.');
    } else if (contentLower.includes('strategy') || contentLower.includes('growth')) {
      prompts.push('Create a business growth illustration: upward trends, strategy planning, or success metrics. Style: professional, modern, inspiring. Colors: success-oriented greens and blues.');
    } else {
      prompts.push('Create a modern technology illustration: digital transformation, innovation, or connectivity themes. Style: clean, professional, forward-looking. Colors: tech-inspired blues and purples.');
    }

    // Third content image if requested
    if (count > 2) {
      prompts.push('Create a professional business illustration: teamwork, collaboration, or achievement themes. Style: modern, clean, positive. Colors: warm but professional tones.');
    }

    return prompts.slice(0, count);
  }

  /**
   * Utility function for delays
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate image filename based on content
   */
  generateImageFilename(slug, type, index = null) {
    const timestamp = Date.now();
    const indexSuffix = index !== null ? `-${index}` : '';
    return `${slug}-${type}${indexSuffix}-${timestamp}.jpg`;
  }

  /**
   * Clean up generated images if needed
   */
  async cleanupImages(slug) {
    try {
      const postDir = path.resolve(__dirname, this.imagesPath, slug);
      if (await fs.pathExists(postDir)) {
        await fs.remove(postDir);
        console.log(`🧹 Cleaned up images for: ${slug}`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up images:', error.message);
    }
  }
}