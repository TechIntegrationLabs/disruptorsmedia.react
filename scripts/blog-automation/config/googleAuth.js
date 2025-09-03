import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

dotenv.config();

/**
 * Google API Authentication Setup
 */
export class GoogleAuthService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.docs = null;
  }

  /**
   * Initialize Google API authentication
   */
  async initialize() {
    try {
      // Load service account credentials
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!credentialsPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set in environment');
      }

      const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));

      // Create JWT authentication
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/documents.readonly'
        ]
      });

      // Initialize API clients
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.docs = google.docs({ version: 'v1', auth: this.auth });

      console.log('✅ Google API authentication initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google API authentication:', error.message);
      throw error;
    }
  }

  /**
   * Get authenticated Sheets API client
   */
  getSheetsClient() {
    if (!this.sheets) {
      throw new Error('Google Sheets API not initialized. Call initialize() first.');
    }
    return this.sheets;
  }

  /**
   * Get authenticated Docs API client
   */
  getDocsClient() {
    if (!this.docs) {
      throw new Error('Google Docs API not initialized. Call initialize() first.');
    }
    return this.docs;
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: process.env.SPREADSHEET_ID
      });
      
      console.log('✅ Google Sheets connection test successful');
      console.log(`📊 Connected to spreadsheet: "${response.data.properties.title}"`);
      return true;
    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error.message);
      return false;
    }
  }
}