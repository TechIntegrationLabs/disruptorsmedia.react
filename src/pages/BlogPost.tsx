import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogPost.css';

interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  image: {
    src: string;
    alt: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const BlogPost: React.FC = () => {
  const { year, slug } = useParams<{ year: string; slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (year && slug) {
      loadBlogPost(year, slug);
    }
  }, [year, slug]);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('.blog-post-content');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const articleHeight = article.scrollHeight;
      
      // Calculate how much of the article has been scrolled past
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(100, (scrolled / (articleHeight - windowHeight)) * 100);
      
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const loadBlogPost = async (year: string, slug: string) => {
    try {
      setLoading(true);
      setError(null);

      // This will be replaced with actual MDX loading logic
      // For now, we'll show a mock post structure
      
      const mockPost: BlogPostData = {
        slug: slug,
        title: 'Getting Started with AI Marketing in 2024',
        description: 'A comprehensive guide to implementing AI-powered marketing strategies for modern businesses.',
        content: `
# Introduction

Welcome to the future of marketing! In this comprehensive guide, we'll explore how artificial intelligence is revolutionizing the way businesses connect with their audiences.

## What is AI Marketing?

AI marketing refers to the use of artificial intelligence technologies to make automated decisions based on data collection, data analysis, and additional observations of audience or economic trends that may impact marketing efforts.

### Key Benefits

- **Personalization at Scale**: Deliver personalized experiences to thousands of customers simultaneously
- **Predictive Analytics**: Anticipate customer behavior and preferences
- **Automated Optimization**: Continuously improve campaign performance without manual intervention
- **Enhanced Customer Insights**: Gain deeper understanding of your audience

## Getting Started

Here's how you can begin implementing AI in your marketing strategy:

### 1. Define Your Goals

Before implementing any AI solution, clearly define what you want to achieve:

- Increase conversion rates
- Improve customer retention
- Enhance personalization
- Automate repetitive tasks

### 2. Choose the Right Tools

There are numerous AI marketing tools available. Some popular options include:

- **Email Marketing**: Mailchimp, Constant Contact
- **Social Media**: Hootsuite, Buffer
- **Analytics**: Google Analytics Intelligence, Adobe Analytics
- **Customer Service**: ChatGPT, Intercom

### 3. Start Small

Don't try to implement everything at once. Start with one or two use cases and gradually expand your AI implementation.

## Advanced Strategies

Once you've mastered the basics, you can explore more advanced AI marketing strategies:

### Dynamic Pricing

Use AI to adjust prices in real-time based on demand, competition, and customer behavior.

### Predictive Customer Lifetime Value

Identify your most valuable customers and focus your marketing efforts accordingly.

### Voice and Visual Search Optimization

Optimize your content for voice searches and visual search technologies.

## Conclusion

AI marketing is not just a trend—it's the future of digital marketing. By starting with the basics and gradually implementing more advanced strategies, you can stay ahead of the competition and deliver exceptional customer experiences.

Ready to transform your marketing with AI? Contact Disruptors Media to learn how we can help you implement cutting-edge AI marketing strategies for your business.
        `,
        publishedAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        author: 'disruptors-media',
        category: 'AI & Technology',
        tags: ['ai', 'marketing', 'strategy', 'automation'],
        readingTime: 8,
        featured: true,
        image: {
          src: '/images/blog/getting-started-with-ai-marketing/feature.jpg',
          alt: 'AI Marketing Strategy Featured Image'
        },
        seo: {
          metaTitle: 'AI Marketing Guide 2024 | Disruptors Media',
          metaDescription: 'Learn how to implement AI-powered marketing strategies that drive results. Complete guide with tools, strategies, and best practices.',
          keywords: ['AI marketing', 'artificial intelligence', 'marketing automation', 'digital strategy']
        }
      };

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPost(mockPost);
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Error loading blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="blog-post-loading">
            <h2>Loading article...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="blog-post-error">
            <h2>Article Not Found</h2>
            <p>Sorry, we couldn't find the article you're looking for.</p>
            <Link to="/blog" className="back-to-blog">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      {/* Reading Progress Bar */}
      <div className="reading-progress">
        <div 
          className="reading-progress-bar"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="blog-post-nav">
        <div className="container">
          <Link to="/blog" className="back-link">
            ← Back to Blog
          </Link>
        </div>
      </nav>

      {/* Article Header */}
      <header className="blog-post-header">
        <div className="container">
          <div className="blog-post-header-content">
            <div className="blog-post-meta">
              <span className="category">{post.category}</span>
              <span className="reading-time">{post.readingTime} min read</span>
            </div>
            
            <h1 className="blog-post-title">{post.title}</h1>
            <p className="blog-post-description">{post.description}</p>
            
            <div className="blog-post-author-info">
              <div className="author-details">
                <span className="author-name">Disruptors Media</span>
                <div className="post-dates">
                  <span>Published {formatDate(post.publishedAt)}</span>
                  {post.updatedAt !== post.publishedAt && (
                    <span>Updated {formatDate(post.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="blog-post-image">
        <div className="container">
          <img src={post.image.src} alt={post.image.alt} />
        </div>
      </div>

      {/* Article Content */}
      <article className="blog-post-content">
        <div className="container">
          <div className="content-wrapper">
            <div className="article-content">
              {/* This will be replaced with MDX rendering */}
              <div 
                className="prose"
                dangerouslySetInnerHTML={{ 
                  __html: post.content.replace(/\n/g, '<br>').replace(/### /g, '<h3>').replace(/## /g, '<h2>').replace(/# /g, '<h1>') 
                }}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Article Footer */}
      <footer className="blog-post-footer">
        <div className="container">
          <div className="post-tags">
            <h4>Tags:</h4>
            <div className="tags-list">
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`} className="tag">
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="share-section">
            <h4>Share this article:</h4>
            <div className="share-buttons">
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
              >
                Twitter
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn linkedin"
              >
                LinkedIn
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn facebook"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Call to Action */}
      <section className="blog-post-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Marketing?</h2>
            <p>Let's discuss how AI-powered strategies can accelerate your business growth.</p>
            <Link to="/contact" className="cta-button">
              Get Started
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-to-top ${readingProgress > 20 ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default BlogPost;