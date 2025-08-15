import React, { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sitemapData } from './sitemapData';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      alert(`Searching for: ${searchQuery}`);
    }
  };

  const handleLinkClick = (path, e) => {
    // Only prevent default for external links or special cases
    if (!path.startsWith('http') && !path.startsWith('mailto') && !path.startsWith('tel')) {
      e.preventDefault();
      navigate(path);
    }
    closeMenu();
  };

  const getFilteredItems = () => {
    if (!searchQuery.trim()) return null;

    const allItems = [
      ...sitemapData.companyPages,
      ...sitemapData.mainCategories,
      ...sitemapData.mainCategories.flatMap(cat => cat.subcategories)
    ];

    return allItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredItems = getFilteredItems();

  return (
    <>
      {/* Main Navbar */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar-container">
          <button
            onClick={toggleMenu}
            className="menu-button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="overlay-menu"
            aria-haspopup="true"
          >
            <Menu size={24} aria-hidden="true" />
          </button>

          <div className="logo-container">
            <Link 
              to="/" 
              className="logo"
              onClick={closeMenu}
              aria-label="FERZ - Go to homepage"
            >
              <img src="/FERZLETTERS.svg" alt="FERZ" />
            </Link>
          </div>

          <div className="navbar-right">
            <button 
              className="search-button"
              onClick={() => setSearchQuery('')}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              className="contact-button"
              onClick={(e) => handleLinkClick('/contact-us', e)}
              aria-label="Access a briefing"
            >
              Access a Briefing
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Overlay Menu */}
      {isMenuOpen && (
        <div 
          className="overlay-menu" 
          id="overlay-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="overlay-header">
            <button
              onClick={closeMenu}
              className="close-button"
              aria-label="Close navigation menu"
            >
              <X size={24} aria-hidden="true" />
            </button>

            <div className="overlay-logo-container">
              <Link 
                to="/" 
                className="overlay-logo"
                onClick={closeMenu}
                aria-label="FERZ - Go to homepage"
              >
                <img src="/FERZLETTERS.svg" alt="FERZ" />
              </Link>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-container" role="search">
              <label htmlFor="search-input" className="sr-only">Search</label>
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                placeholder="Search"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search website content"
                aria-describedby="search-results-count"
              />
            </form>

            <button 
              className="overlay-contact-button"
              onClick={(e) => handleLinkClick('/contact-us', e)}
              aria-label="Access a briefing"
            >
              Access a Briefing
            </button>
          </div>

          <div className="menu-content">
            <div className="sidebar">
              <div className="sidebar-content">
                <h2 className="sidebar-title">Services</h2>
                <nav className="nav-section" aria-label="Services navigation">
                  {sitemapData.mainCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`nav-link ${selectedCategory?.id === category.id ? 'nav-link-active' : ''}`}
                      onClick={() => handleCategoryClick(category)}
                      aria-expanded={selectedCategory?.id === category.id}
                      aria-controls={`category-${category.id}`}
                      aria-label={`${category.title} - ${selectedCategory?.id === category.id ? 'expanded' : 'collapsed'}`}
                    >
                      {category.title}
                    </button>
                  ))}
                </nav>

                <h2 className="sidebar-title sidebar-title-secondary">Company</h2>
                <nav className="nav-section" aria-label="Company pages navigation">
                  {sitemapData.companyPages.filter(page => page.id !== 'home').map((page) => (
                    <Link
                      key={page.id}
                      to={page.path}
                      className="nav-link"
                      onClick={closeMenu}
                      aria-label={`Go to ${page.title} page`}
                    >
                      {page.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            <div className="content-area">
              {searchQuery.trim() && filteredItems ? (
                <div className="search-results" role="region" aria-label="Search results">
                  <div className="search-results-header">
                    <h2 className="search-results-title">
                      Search Results for "{searchQuery}"
                    </h2>
                    <p className="search-results-count" id="search-results-count">
                      {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="search-results-grid" role="list" aria-label="Search results list">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="search-result-card" role="listitem">
                        <Link 
                          to={item.path}
                          className="search-result-link"
                          onClick={closeMenu}
                          aria-label={`Go to ${item.title} page`}
                        >
                          <h3 className="search-result-title">{item.title}</h3>
                          <p className="search-result-description">{item.description}</p>
                          <div className="visit-page-button" aria-hidden="true">
                            Visit Page
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedCategory ? (
                <div className="category-content" id={`category-${selectedCategory.id}`} role="region" aria-label={`${selectedCategory.title} content`}>
                  <div className="category-header">
                    <h2 className="category-title">{selectedCategory.title}</h2>
                    <p className="category-description">{selectedCategory.description}</p>
                  </div>
                  
                  <div className="subcategories-grid" role="list" aria-label={`${selectedCategory.title} subcategories`}>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="subcategory-card" role="listitem">
                        <Link 
                          to={subcategory.path}
                          className="subcategory-link"
                          onClick={closeMenu}
                          aria-label={`Go to ${subcategory.title} page`}
                        >
                          <h3 className="subcategory-title">{subcategory.title}</h3>
                          <p className="subcategory-description">{subcategory.description}</p>
                          <div className="visit-page-button" aria-hidden="true">
                            Visit Page
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="placeholder-content">
                  <div className="placeholder-text">
                    Select a category or search
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
