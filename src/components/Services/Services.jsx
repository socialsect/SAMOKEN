import React from 'react';
import { 
  Shield, 
  Brain, 
  Target, 
  Zap, 
  BarChart3, 
  Users, 
  FileText, 
  Settings 
} from 'lucide-react';
import './Services.css';

const ServiceCard = ({ icon: Icon, title, description, features }) => (
  <div className="service-card">
    <div className="service-icon">
      <Icon size={32} />
    </div>
    <h3 className="service-title">{title}</h3>
    <p className="service-description">{description}</p>
    <ul className="service-features">
      {features.map((feature, index) => (
        <li key={index} className="service-feature">
          <div className="feature-check"></div>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const Services = () => {
  const services = [
    {
      icon: Shield,
      title: "AI Governance Framework",
      description: "Comprehensive governance structures that ensure ethical AI deployment and compliance with regulatory standards.",
      features: [
        "Ethical AI guidelines & policies",
        "Compliance monitoring systems",
        "Risk assessment frameworks",
        "Stakeholder accountability"
      ]
    },
    {
      icon: Brain,
      title: "Deterministic AI Systems",
      description: "Transform probabilistic AI into reliable, predictable systems with guaranteed outcomes and transparent decision-making.",
      features: [
        "Predictable AI behavior",
        "Transparent decision logic",
        "Consistent performance",
        "Audit trail systems"
      ]
    },
    {
      icon: Target,
      title: "Risk Assessment & Mitigation",
      description: "Advanced risk analysis tools and strategies to identify, evaluate, and mitigate AI-related risks across your organization.",
      features: [
        "Comprehensive risk analysis",
        "Mitigation strategies",
        "Real-time monitoring",
        "Incident response plans"
      ]
    },
    {
      icon: Zap,
      title: "Implementation Support",
      description: "End-to-end support for implementing AI governance frameworks, from initial setup to ongoing maintenance.",
      features: [
        "Framework implementation",
        "Training & certification",
        "Ongoing support",
        "Performance optimization"
      ]
    },
    {
      icon: BarChart3,
      title: "Strategic Advisory",
      description: "Expert consultation to develop AI strategies aligned with your business objectives and regulatory requirements.",
      features: [
        "Strategic planning",
        "Technology assessment",
        "Regulatory guidance",
        "ROI optimization"
      ]
    },
    {
      icon: Users,
      title: "Team Training & Development",
      description: "Comprehensive training programs to build AI governance expertise within your organization.",
      features: [
        "Customized training programs",
        "Certification pathways",
        "Best practice workshops",
        "Knowledge transfer"
      ]
    },
    {
      icon: FileText,
      title: "Compliance Documentation",
      description: "Complete documentation and reporting systems to demonstrate compliance with AI governance standards.",
      features: [
        "Policy documentation",
        "Compliance reports",
        "Audit preparation",
        "Regulatory submissions"
      ]
    },
    {
      icon: Settings,
      title: "System Integration",
      description: "Seamless integration of governance frameworks with existing AI systems and workflows.",
      features: [
        "API integration",
        "Workflow automation",
        "Data synchronization",
        "Performance monitoring"
      ]
    }
  ];

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive AI governance solutions</p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
        
        <div className="services-cta">
          <div className="cta-content">
            <h3>Ready to Transform Your AI Governance?</h3>
            <p>Let's discuss how FERZ can help you implement robust, ethical AI frameworks.</p>
            <a href="#contact" className="cta-button">
              Get Started Today
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12,5 19,12 12,19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
