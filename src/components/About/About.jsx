import React from 'react';
import { ArrowRight, CheckCircle, BookOpen, Target, BarChart, Layers, Lock, MessageSquare, Mail, Send } from 'lucide-react';
import './About.css';

const About = () => {
  const features = [
    {
      icon: <Target size={24} />,
      title: "Specialized Focus",
      description: "FERZ isn't the broadest consultancy—our specialized focus on deterministic linguistic governance defines where we engage and excel. We serve organizations where precision isn't merely preferred but essential to operations, compliance, and trust."
    },
    {
      icon: <BarChart size={24} />,
      title: "Measurable Impact",
      description: "Our results are verifiable and consequential—regulated domains see consistent, deterministic outcomes from our governance frameworks. Precision isn't merely our aspiration; it's our demonstrable record in environments where approximation creates unacceptable risk."
    },
    {
      icon: <Layers size={24} />,
      title: "Unmatched Depth",
      description: "Years observing, analyzing, testing, and refining—we've developed unmatched expertise at the intersection of theoretical linguistics and enterprise governance. Our approach is systematically deterministic where others remain reactively probabilistic."
    },
    {
      icon: <Lock size={24} />,
      title: "Proven Methodology",
      description: "Our proprietary LASO(f) framework addresses what others miss: the critical need for multi-dimensional linguistic governance in high-stakes AI applications. We don't improvise solutions; we implement proven methodologies refined through years of specialized research."
    }
  ];

  const articles = [
    {
      title: "The Runtime Revolution: Why Static AI Governance Is Already Obsolete",
      type: "Article",
      link: "#"
    },
    {
      title: "Runtime Enforcement vs. Governance Theater",
      type: "Article",
      link: "#"
    },
    {
      title: "Using AI to Write versus Having AI Write",
      type: "Article",
      link: "#"
    }
  ];

  const solutions = [
    { 
      name: "LASO(f)", 
      description: "AI linguistic governance for regulatory compliance.",
      icon: <Layers size={24} />,
      features: ["Regulatory compliance", "Linguistic precision", "Deterministic outputs"]
    },
    { 
      name: "LASO(f)-AG", 
      description: "Constitutional control over AI system actions.",
      icon: <Lock size={24} />,
      features: ["Action governance", "Constitutional AI", "Behavioral control"]
    },
    { 
      name: "MRCF", 
      description: "Recursive cognitive enhancement for human-AI partnership.",
      icon: <BarChart size={24} />,
      features: ["Cognitive enhancement", "Human-AI collaboration", "Recursive improvement"]
    },
    { 
      name: "SCM", 
      description: "Deterministic semantic compression for AI.",
      icon: <Target size={24} />,
      features: ["Semantic analysis", "Data compression", "Deterministic processing"]
    },
    { 
      name: "DELIA", 
      description: "Constraint-based enforcement for AI language and behavior.",
      icon: <CheckCircle size={24} />,
      features: ["Behavioral constraints", "Language enforcement", "Policy compliance"]
    }
  ];

  return (
    <section className="about" id="about">
      <div className="container">
        {/* Why FERZ Section */}
        <div className="section-header text-center mb-16">
          <h2 className="section-title">Why FERZ</h2>
          <p className="section-subtitle">Where precision meets expertise</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Popular Resources */}
        <div className="resources-section">
          <div className="section-header flex justify-between items-center mb-8">
            <div>
              <h2 className="section-title">Check out our most popular resources</h2>
            </div>
            <a href="#" className="view-all">View All Articles</a>
          </div>
          
          <div className="articles-grid">
            {articles.map((article, index) => (
              <div key={index} className="article-card">
                <div className="article-type">{article.type}</div>
                <h3>{article.title}</h3>
                <a href={article.link} className="read-more">
                  Read Full Article <ArrowRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Solutions Section */}
        <div className="solutions-section">
          <div className="container">
            <div className="section-header text-center mb-16">
              <h2 className="section-title">Explore Our Solutions</h2>
              <p className="section-subtitle">Specialized frameworks for deterministic AI governance</p>
            </div>
            
            <div className="solutions-grid">
              {solutions.map((solution, index) => (
                <div key={index} className="solution-card group">
                  <div className="solution-icon">
                    {solution.icon}
                  </div>
                  <h3>{solution.name}</h3>
                  <p className="solution-description">{solution.description}</p>
                  <div className="solution-features">
                    {solution.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">
                        <CheckCircle size={14} className="inline mr-1.5" />
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button className="solution-cta">
                    Learn More <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                View All Solutions
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-section">
          <div className="contact-content">
            <div className="contact-text">
              <h2>Begin Your Transformation</h2>
              <h3>From probabilistic approximation to deterministic precision</h3>
              <p>Your AI systems are producing outputs—but are they delivering deterministic precision where it matters most? Linguistic variance creates exponential risk in regulated environments. We close these critical gaps through governance frameworks others haven't yet conceptualized.</p>
              <p className="highlight">Share your challenges—let's address them with systematic precision.</p>
            </div>
            
            <form className="contact-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Please Enter Your Full Name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Please Enter your Email" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="Please describe your AI governance challenges, project needs, or questions for our team."></textarea>
                <p className="helper-text">Include details about your AI project, ethical concerns, or specific challenges you'd like to discuss.</p>
              </div>
              <button type="submit" className="submit-btn">
                Send Message <Send size={16} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
