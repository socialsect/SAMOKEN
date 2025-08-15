import React from 'react';
import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const TestimonialCard = ({ quote, author, position, company, rating }) => (
  <div className="testimonial-card">
    <div className="testimonial-content">
      <div className="quote-icon">
        <Quote size={24} />
      </div>
      <p className="testimonial-quote">{quote}</p>
      <div className="rating">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={16} fill="#fa2132 " color="#fa2132 " />
        ))}
      </div>
    </div>
    <div className="testimonial-author">
      <div className="author-info">
        <h4 className="author-name">{author}</h4>
        <p className="author-position">{position}</p>
        <p className="author-company">{company}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const testimonials = [
    {
      quote: "FERZ transformed our AI governance approach completely. Their deterministic frameworks eliminated the uncertainty we had with probabilistic AI systems.",
      author: "Dr. Sarah Chen",
      position: "Chief AI Officer",
      company: "TechCorp Industries",
      rating: 5
    },
    {
      quote: "The implementation support from FERZ was exceptional. They didn't just provide frameworks - they ensured our team was fully equipped to maintain them.",
      author: "Michael Rodriguez",
      position: "Head of Compliance",
      company: "Global Financial Services",
      rating: 5
    },
    {
      quote: "Working with FERZ gave us the confidence to deploy AI systems at scale while maintaining the highest ethical standards and compliance.",
      author: "Dr. Emily Watson",
      position: "VP of AI Strategy",
      company: "Healthcare Innovations",
      rating: 5
    },
    {
      quote: "FERZ's risk assessment tools helped us identify potential issues before they became problems. Their proactive approach is invaluable.",
      author: "James Thompson",
      position: "CTO",
      company: "Autonomous Systems Ltd",
      rating: 5
    },
    {
      quote: "The strategic advisory from FERZ aligned our AI initiatives with business objectives perfectly. ROI improved significantly.",
      author: "Lisa Park",
      position: "Director of Innovation",
      company: "RetailTech Solutions",
      rating: 5
    },
    {
      quote: "FERZ's training programs built our internal AI governance expertise. Our team now leads industry best practices.",
      author: "David Kumar",
      position: "AI Governance Lead",
      company: "Manufacturing Dynamics",
      rating: 5
    }
  ];

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Trusted by industry leaders worldwide</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
        
        <div className="testimonials-stats">
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Client Satisfaction</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Successful Implementations</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.9/5</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
