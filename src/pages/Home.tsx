import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-logo">
              <img src="/images/gold-logo.png" alt="Disruptors Media" />
            </div>
            
            <h1 className="hero-title">AI Marketing Agency</h1>
            
            <div className="hero-buttons">
              <button className="hero-btn services">Services</button>
              <button className="hero-btn contact">Contact</button>
              <button className="hero-btn podcast">Podcast</button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="content-section">
        <div className="container">
          <h2>Welcome to the New Disruptors Media Site</h2>
          <p>This is the new React-based site with the same styling as the original.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;