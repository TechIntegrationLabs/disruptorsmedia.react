import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

interface MenuItem {
  id: number;
  title: string;
  url: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, title: 'Services', url: '/services' },
    { id: 2, title: 'Portfolio', url: '/portfolio' },
    { id: 3, title: 'About', url: '/about' },
    { id: 4, title: 'Studio', url: '/studio' },
    { id: 5, title: 'Contact', url: '/contact' }
  ]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-wrapper">
            <Link to="/" className="logo hide-res">
              <img src="/images/logo-menu.png" alt="Disruptors Media" />
            </Link>

            <nav className="navigation hide-res">
              <ul>
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url}>{item.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link to="/contact" className="primary-btn hide-res">
              <span>Get Started</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <div className="mobile-header show-res">
              <Link to="/" className="mobile-logo">
                <img src="/images/mobile-menu-logo.png" alt="Disruptors Media" />
              </Link>

              <button 
                className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-inner">
          <nav className="mobile-navigation">
            <ul>
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link 
                    to={item.url} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-menu-footer">
            <div className="company-info">
              <p>Disruptors Media Inc.</p>
              <p>AI Marketing Agency</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;