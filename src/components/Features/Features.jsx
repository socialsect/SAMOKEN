import React from 'react';
import { Target, Shield, Brain, Zap } from 'lucide-react';
import './Features.css';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">
      <Icon size={32} />
    </div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: Target,
      title: "Precision Engineering",
      description: "Deterministic frameworks that eliminate probabilistic uncertainty"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Comprehensive risk management and ethical AI development"
    },
    {
      icon: Brain,
      title: "Governance",
      description: "Robust frameworks for AI compliance and oversight"
    },
    {
      icon: Zap,
      title: "Deterministic Systems",
      description: "Convert probabilistic AI into reliable, predictable frameworks"
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why FERZ</h2>
          <p className="section-subtitle">Where precision meets expertise</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
