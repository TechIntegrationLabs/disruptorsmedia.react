import { GoogleAuthService } from '../config/googleAuth.js';
import TurndownService from 'turndown';

/**
 * Google Docs Service for extracting blog content
 */
export class DocsService {
  constructor() {
    this.googleAuth = new GoogleAuthService();
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    });
  }

  /**
   * Initialize the service
   */
  async initialize() {
    await this.googleAuth.initialize();
  }

  /**
   * Get document content from Google Docs
   */
  async getDocumentContent(docId) {
    try {
      const docs = this.googleAuth.getDocsClient();
      
      const response = await docs.documents.get({
        documentId: docId
      });

      const document = response.data;
      console.log(`📄 Retrieved document: "${document.title}"`);

      // Extract content
      const content = this.extractTextContent(document);
      const title = document.title;

      return {
        title: title.trim(),
        content: content.trim(),
        wordCount: content.split(' ').length,
        docId: docId
      };
    } catch (error) {
      console.error(`❌ Error reading document ${docId}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract readable text content from Google Docs structure
   */
  extractTextContent(document) {
    let content = '';
    
    if (!document.body || !document.body.content) {
      return content;
    }

    for (const element of document.body.content) {
      if (element.paragraph) {
        const paragraphText = this.extractParagraphText(element.paragraph);
        if (paragraphText.trim()) {
          content += paragraphText + '\n\n';
        }
      } else if (element.table) {
        // Handle tables if needed
        content += this.extractTableText(element.table) + '\n\n';
      }
    }

    return content.trim();
  }

  /**
   * Extract text from a paragraph element
   */
  extractParagraphText(paragraph) {
    let text = '';
    
    if (!paragraph.elements) {
      return text;
    }

    for (const element of paragraph.elements) {
      if (element.textRun && element.textRun.content) {
        let textContent = element.textRun.content;
        
        // Apply formatting if needed
        if (element.textRun.textStyle) {
          const style = element.textRun.textStyle;
          
          if (style.bold) {
            textContent = `**${textContent}**`;
          }
          if (style.italic) {
            textContent = `*${textContent}*`;
          }
          if (style.underline) {
            textContent = `<u>${textContent}</u>`;
          }
        }
        
        text += textContent;
      }
    }

    // Handle paragraph styles (headers, etc.)
    if (paragraph.paragraphStyle && paragraph.paragraphStyle.namedStyleType) {
      const styleType = paragraph.paragraphStyle.namedStyleType;
      
      if (styleType === 'HEADING_1') {
        text = `# ${text}`;
      } else if (styleType === 'HEADING_2') {
        text = `## ${text}`;
      } else if (styleType === 'HEADING_3') {
        text = `### ${text}`;
      } else if (styleType === 'HEADING_4') {
        text = `#### ${text}`;
      } else if (styleType === 'HEADING_5') {
        text = `##### ${text}`;
      } else if (styleType === 'HEADING_6') {
        text = `###### ${text}`;
      }
    }

    return text;
  }

  /**
   * Extract text from table elements
   */
  extractTableText(table) {
    let tableText = '';
    
    if (!table.tableRows) {
      return tableText;
    }

    for (const row of table.tableRows) {
      let rowText = '| ';
      
      if (row.tableCells) {
        for (const cell of row.tableCells) {
          if (cell.content) {
            let cellText = '';
            for (const element of cell.content) {
              if (element.paragraph) {
                cellText += this.extractParagraphText(element.paragraph);
              }
            }
            rowText += `${cellText.replace(/\n/g, ' ').trim()} | `;
          }
        }
      }
      
      tableText += rowText + '\n';
    }

    return tableText;
  }

  /**
   * Generate reading time estimate
   */
  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime); // Minimum 1 minute
  }

  /**
   * Extract key information for image generation prompts
   */
  extractImagePrompts(title, content) {
    // Main feature image prompt
    const featurePrompt = `Create a professional, modern blog header image for an article titled "${title}". The image should be visually appealing, use modern design elements, and be suitable for a digital marketing/AI technology blog. Style: clean, professional, with subtle tech elements.`;

    // Extract key topics for additional images
    const contentLower = content.toLowerCase();
    const additionalPrompts = [];

    // Look for key topics that might benefit from visualization
    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence')) {
      additionalPrompts.push('Create a sleek, modern illustration representing artificial intelligence and machine learning concepts. Style: professional, clean, tech-focused.');
    }

    if (contentLower.includes('marketing') || contentLower.includes('strategy')) {
      additionalPrompts.push('Create a professional illustration showing digital marketing strategy concepts like growth charts, target audiences, and marketing channels. Style: modern, business-focused.');
    }

    if (contentLower.includes('data') || contentLower.includes('analytics')) {
      additionalPrompts.push('Create a modern data visualization illustration showing charts, graphs, and analytics concepts. Style: clean, professional, tech-oriented.');
    }

    // Ensure we have at least 2 additional prompts
    while (additionalPrompts.length < 2) {
      additionalPrompts.push(`Create a supporting illustration for a blog article about ${title}. Style: modern, professional, suitable for business/technology content.`);
    }

    return {
      feature: featurePrompt,
      additional: additionalPrompts.slice(0, 3) // Maximum 3 additional images
    };
  }
}