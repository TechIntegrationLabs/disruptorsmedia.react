import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

interface SocialLink {
  id: number;
  name: string;
  url: string;
  icon: string;
}

const Footer: React.FC = () => {
  const scrambleRef1 = useRef<HTMLSpanElement>(null);
  const scrambleRef2 = useRef<HTMLSpanElement>(null);

  const socialLinks: SocialLink[] = [
    { id: 1, name: 'Instagram', url: 'https://instagram.com/disruptorsmedia', icon: '/images/insta.svg' },
    { id: 2, name: 'Facebook', url: 'https://facebook.com/disruptorsmedia', icon: '/images/fb.svg' },
    { id: 3, name: 'Twitter', url: 'https://twitter.com/disruptorsmedia', icon: '/images/twitter.svg' },
    { id: 4, name: 'YouTube', url: 'https://youtube.com/disruptorsmedia', icon: '/images/youtube.svg' }
  ];

  useEffect(() => {
    // Scramble text animation for coordinates
    const scrambleText = (element: HTMLElement, finalText: string) => {
      if (!element) return;
      
      const chars = '!<>-_\\/[]{}—=+*^?#________';
      let iterations = 0;
      const animationSpeed = 50;
      const maxIterations = finalText.length;

      const interval = setInterval(() => {
        element.innerText = finalText
          .split('')
          .map((letter, index) => {
            if (index < iterations) {
              return finalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iterations >= maxIterations) {
          element.innerText = finalText;
          clearInterval(interval);
        }

        iterations += 1;
      }, animationSpeed);
    };

    // Observer for scramble animation trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const finalText = target.getAttribute('data-text') || target.textContent || '';
            scrambleText(target, finalText);
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (scrambleRef1.current) {
      observer.observe(scrambleRef1.current);
    }
    if (scrambleRef2.current) {
      observer.observe(scrambleRef2.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer className="footer bg-emboss">
      <div className="container">
        <div className="footer-wrapper">
          <div className="footer-left">
            <p className="copyright">© {new Date().getFullYear()} Disruptors Media Inc.</p>
            <address className="address">
              Lancaster, CA 93534<br />
              AI Marketing Agency
            </address>
          </div>

          <div className="footer-center">
            <div className="social-links">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={link.name}
                >
                  <img src={link.icon} alt={link.name} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-right">
            <div className="coordinates">
              <span 
                ref={scrambleRef1}
                className="scramble"
                data-text="34.6868° N"
              >
                34.6868° N
              </span>
              <br />
              <span 
                ref={scrambleRef2}
                className="scramble"
                data-text="118.1542° W"
              >
                118.1542° W
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;