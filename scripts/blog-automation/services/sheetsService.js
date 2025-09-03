import { GoogleAuthService } from '../config/googleAuth.js';
import { EnvLoader } from '../config/envLoader.js';

EnvLoader.load();

/**
 * Google Sheets Service for reading blog post data
 */
export class SheetsService {
  constructor() {
    this.googleAuth = new GoogleAuthService();
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    this.sheetName = process.env.SHEET_NAME || 'Sheet1';
  }

  /**
   * Initialize the service
   */
  async initialize() {
    await this.googleAuth.initialize();
  }

  /**
   * Get all rows from the spreadsheet
   */
  async getAllRows() {
    try {
      const sheets = this.googleAuth.getSheetsClient();
      const range = `${this.sheetName}!A:Z`; // Get all columns A through Z
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        console.log('📄 No data found in spreadsheet');
        return [];
      }

      console.log(`📊 Retrieved ${rows.length} rows from spreadsheet`);
      return rows;
    } catch (error) {
      console.error('❌ Error reading spreadsheet:', error.message);
      throw error;
    }
  }

  /**
   * Parse rows into structured blog post data
   */
  parseRows(rows) {
    if (rows.length < 2) {
      console.log('⚠️  No data rows found (header only or empty sheet)');
      return [];
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Find column indices dynamically
    const postUrlIndex = headers.findIndex(h => h && h.toLowerCase().includes('url'));
    const approvalIndex = 14; // Column O (0-indexed = 14)
    const publishDateIndex = headers.findIndex(h => h && h.toLowerCase().includes('publish'));
    
    console.log(`📝 Found columns - Post URL: ${postUrlIndex}, Approval: ${approvalIndex}, Publish Date: ${publishDateIndex}`);

    const posts = dataRows.map((row, index) => {
      const postUrl = row[postUrlIndex] || '';
      const approval = row[approvalIndex] || '';
      const publishDateRaw = row[publishDateIndex] || '';
      
      return {
        rowIndex: index + 2, // +2 for header row and 1-based indexing
        postUrl: postUrl.trim(),
        approved: approval.toUpperCase() === 'YES',
        publishDate: publishDateRaw.trim(),
        title: row[1] || '', // Assuming title is in column B
        client: row[2] || '', // Assuming client is in column C
        keywords: row[4] || '', // Assuming keywords are in column E
        rawData: row
      };
    });

    // Filter for posts ready to publish
    const readyPosts = posts.filter(post => {
      const isApproved = post.approved;
      const hasValidUrl = post.postUrl.includes('docs.google.com');
      const isDateReady = this.isPublishDateReady(post.publishDate);
      
      // Log detailed status for each post
      if (post.postUrl || post.approved || post.publishDate) {
        console.log(`📄 Row ${post.rowIndex}: ${post.title || 'Untitled'}`);
        console.log(`   ✓ Approved: ${isApproved ? 'YES' : 'NO'}`);
        console.log(`   ✓ Valid URL: ${hasValidUrl ? 'YES' : 'NO'}`);
        console.log(`   ✓ Date Ready: ${isDateReady ? 'YES' : 'NO'} (${post.publishDate || 'No date'})`);
      }
      
      if (isApproved && hasValidUrl && isDateReady) {
        console.log(`✅ Post ready for publishing: Row ${post.rowIndex} - ${post.title || 'Untitled'}`);
        return true;
      }
      
      // Provide specific feedback for posts that aren't ready
      if (isApproved && hasValidUrl && !isDateReady) {
        console.log(`⏰ Post approved but scheduled for future: Row ${post.rowIndex} (${post.publishDate})`);
      } else if (isApproved && !hasValidUrl) {
        console.log(`⚠️  Approved post missing valid Google Docs URL: Row ${post.rowIndex}`);
      } else if (!isApproved && hasValidUrl && isDateReady) {
        console.log(`⏳ Post ready but not approved: Row ${post.rowIndex}`);
      }
      
      return false;
    });

    console.log(`📋 Found ${readyPosts.length} posts ready for publishing (approved + date ready)`);
    return readyPosts;
  }

  /**
   * Check if publish date is today or in the past
   */
  isPublishDateReady(publishDateStr) {
    if (!publishDateStr) {
      console.log(`⚠️  No publish date provided`);
      return false;
    }

    try {
      // Parse the date - handle various formats
      const publishDate = this.parseDate(publishDateStr);
      const today = new Date();
      
      // Set both dates to start of day for comparison
      const publishDateStart = new Date(publishDate.getFullYear(), publishDate.getMonth(), publishDate.getDate());
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const isReady = publishDateStart <= todayStart;
      
      if (isReady) {
        console.log(`📅 Publish date ready: ${publishDateStr} (${publishDateStart.toDateString()})`);
      } else {
        console.log(`📅 Publish date in future: ${publishDateStr} (${publishDateStart.toDateString()}), today: ${todayStart.toDateString()}`);
      }
      
      return isReady;
    } catch (error) {
      console.log(`⚠️  Invalid publish date format: "${publishDateStr}" - ${error.message}`);
      return false;
    }
  }

  /**
   * Parse date from various formats commonly used in spreadsheets
   */
  parseDate(dateStr) {
    if (!dateStr) throw new Error('Empty date string');
    
    // Clean the date string
    const cleanDate = dateStr.trim();
    
    // Try parsing as-is first (works for ISO dates, many standard formats)
    let parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Try common formats if direct parsing failed
    const formats = [
      // MM/DD/YYYY or MM-DD-YYYY
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // DD/MM/YYYY or DD-MM-YYYY (European)
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // YYYY-MM-DD or YYYY/MM/DD
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    ];

    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        // For YYYY-MM-DD format
        if (match[1].length === 4) {
          parsed = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        } else {
          // For MM/DD/YYYY format (assuming US format by default)
          parsed = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
        }
        
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    // If all parsing attempts failed
    throw new Error(`Unable to parse date format: ${dateStr}`);
  }

  /**
   * Get blog posts ready for publishing (approved + date ready)
   */
  async getPostsReadyForPublishing() {
    try {
      const rows = await this.getAllRows();
      const posts = this.parseRows(rows);
      return posts;
    } catch (error) {
      console.error('❌ Error getting posts ready for publishing:', error.message);
      throw error;
    }
  }

  /**
   * @deprecated Use getPostsReadyForPublishing() instead
   * Get approved blog posts ready for publishing
   */
  async getApprovedPosts() {
    console.log('⚠️  getApprovedPosts() is deprecated, use getPostsReadyForPublishing() instead');
    return this.getPostsReadyForPublishing();
  }

  /**
   * Extract Google Docs ID from URL
   */
  extractDocId(url) {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error(`Invalid Google Docs URL: ${url}`);
    }
    return match[1];
  }
}