import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  image: {
    src: string;
    alt: string;
  };
  year: number;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      // This will be replaced with actual MDX loading logic
      // For now, we'll show a placeholder structure
      
      const mockPosts: BlogPost[] = [
        {
          slug: 'getting-started-with-ai-marketing',
          title: 'Getting Started with AI Marketing in 2024',
          description: 'A comprehensive guide to implementing AI-powered marketing strategies for modern businesses.',
          publishedAt: '2024-01-15T10:00:00Z',
          author: 'disruptors-media',
          category: 'AI & Technology',
          tags: ['ai', 'marketing', 'strategy', 'automation'],
          readingTime: 8,
          featured: true,
          image: {
            src: '/images/blog/getting-started-with-ai-marketing/feature.jpg',
            alt: 'AI Marketing Strategy Featured Image'
          },
          year: 2024
        },
        {
          slug: 'digital-transformation-guide',
          title: 'The Complete Digital Transformation Guide',
          description: 'Everything you need to know about digital transformation for growing businesses.',
          publishedAt: '2024-01-10T14:30:00Z',
          author: 'disruptors-media',
          category: 'Digital Strategy',
          tags: ['digital-transformation', 'business-growth', 'technology'],
          readingTime: 12,
          featured: false,
          image: {
            src: '/images/blog/digital-transformation-guide/feature.jpg',
            alt: 'Digital Transformation Guide Featured Image'
          },
          year: 2024
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'all',
    'AI & Technology',
    'Digital Strategy',
    'Creative Content', 
    'Case Studies',
    'Industry Insights',
    'Tutorials'
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="container">
          <div className="blog-loading">
            <h2>Loading blog posts...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="container">
          <div className="blog-hero-content">
            <h1>Disruptors Media Blog</h1>
            <p>Insights, strategies, and innovations in AI marketing and digital transformation</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="blog-filters">
        <div className="container">
          <div className="filters-wrapper">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category === 'all' ? 'All Posts' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="blog-posts">
        <div className="container">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <h3>No posts found</h3>
              <p>Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <>
              <div className="posts-count">
                <p>{filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found</p>
              </div>
              
              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <article key={post.slug} className={`blog-card ${post.featured ? 'featured' : ''}`}>
                    <Link to={`/blog/${post.year}/${post.slug}`} className="blog-card-link">
                      <div className="blog-card-image">
                        <img src={post.image.src} alt={post.image.alt} />
                        {post.featured && (
                          <div className="featured-badge">Featured</div>
                        )}
                      </div>
                      
                      <div className="blog-card-content">
                        <div className="blog-card-meta">
                          <span className="category">{post.category}</span>
                          <span className="reading-time">{post.readingTime} min read</span>
                        </div>
                        
                        <h2 className="blog-card-title">{post.title}</h2>
                        <p className="blog-card-description">{post.description}</p>
                        
                        <div className="blog-card-footer">
                          <div className="blog-card-tags">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="tag">#{tag}</span>
                            ))}
                          </div>
                          
                          <div className="blog-card-date">
                            {formatDate(post.publishedAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="blog-cta">
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
    </div>
  );
};

export default Blog;