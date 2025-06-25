import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoLanguage } from "react-icons/io5";
import '../Styles/Signup.css';

// Password strength checker
const checkPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.match(/[a-z]+/)) strength += 1;
  if (password.match(/[A-Z]+/)) strength += 1;
  if (password.match(/[0-9]+/)) strength += 1;
  if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength += 1;
  return Math.min(Math.floor((strength / 5) * 100), 100);
};

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  // Password strength indicator
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          newErrors[name] = 'This field is required';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field if it's been touched
    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    const newTouched = {};
    
    // Mark all fields as touched
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    // Validate terms acceptance
    if (!acceptTerms) {
      setSubmitError('You must accept the terms and conditions');
      isValid = false;
    } else {
      setSubmitError('');
    }
    
    setTouched(newTouched);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Simulate API call
      console.log('Submitting form:', { ...formData, acceptTerms });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect on success
      navigate('/verification', { state: { email: formData.email } });
    } catch (error) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <button onClick={handleBack} className="back-button" aria-label="Go back">
        <IoIosArrowBack className="back-icon" />
      </button>
      
      <div className="auth-content">
        <img 
          src="/Logos/THE RUNNER-LOGOS-02.svg" 
          alt="RUNNER Logo" 
          className="auth-logo"
          width={280}
          height="auto"
        />
      
        <div className="auth-welcome-text">
          <h2>CREATE ACCOUNT</h2>
          <p>Join our community today!</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className={`form-group half-width ${touched.firstName && errors.firstName ? 'error' : ''} required`}>
              <label htmlFor="firstName" className="form-label">FIRST NAME</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="auth-input"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your first name"
                required
              />
              {touched.firstName && errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>
            <div className={`form-group half-width ${touched.lastName && errors.lastName ? 'error' : ''} required`}>
              <label htmlFor="lastName" className="form-label">LAST NAME</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="auth-input"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your last name"
                required
              />
              {touched.lastName && errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>


          <div className={`form-group ${touched.email && errors.email ? 'error' : ''} required`}>
            <label htmlFor="email" className="form-label">EMAIL</label>
            <input
              type="email"
              id="email"
              name="email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="your.email@example.com"
              required
              autoComplete="username"
            />
            {touched.email && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className={`form-group ${touched.password && errors.password ? 'error' : ''} required`}>
            <label htmlFor="password" className="form-label">PASSWORD</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => togglePasswordVisibility('password')}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? (
                  <FaRegEye style={{ color: '#666', fontSize: '1.1rem' }} />
                ) : (
                  <FaRegEyeSlash style={{ color: '#666', fontSize: '1.1rem' }} />
                )}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div 
                  className="strength-bar" 
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: passwordStrength < 40 ? '#ff4d4d' : 
                                    passwordStrength < 70 ? '#ffaa00' : '#4CAF50'
                  }}
                />
              </div>
            )}
            {touched.password && errors.password ? (
              <span className="error-message">{errors.password}</span>
            ) : (
              <div className="password-hints">
                <small style={{ color: '#888', fontSize: '0.75rem' }}>
                  Use 8+ characters with a mix of letters, numbers & symbols
                </small>
              </div>
            )}
          </div>

          <div className={`form-group ${touched.confirmPassword && errors.confirmPassword ? 'error' : ''} required`}>
            <label htmlFor="confirmPassword" className="form-label">CONFIRM PASSWORD</label>
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className="auth-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <FaRegEye style={{ color: '#666', fontSize: '1.1rem' }} />
                ) : (
                  <FaRegEyeSlash style={{ color: '#666', fontSize: '1.1rem' }} />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className={`form-group terms-container ${!acceptTerms && touched.terms ? 'error' : ''}`}>
            <label className="checkbox-container">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  setTouched(prev => ({ ...prev, terms: true }));
                  if (e.target.checked) {
                    setSubmitError('');
                  }
                }}
                onBlur={() => setTouched(prev => ({ ...prev, terms: true }))}
                aria-describedby="termsError"
              />
              <span className="checkmark"></span>
              <span className="terms-text">
                I agree to the <Link to="/terms" className="terms-link" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/privacy" className="terms-link" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
              </span>
            </label>
            {!acceptTerms && touched.terms && (
              <div id="termsError" className="error-message" style={{ marginTop: '0.5rem' }}>
                You must accept the terms and conditions
              </div>
            )}
          </div>

          {submitError && (
            <div className="form-group" style={{ color: '#ff4d4d', textAlign: 'center' }}>
              {submitError}
            </div>
          )}
          <button 
            type="submit" 
            className="auth-btn signup-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  borderTopColor: '#fff',
                  animation: 'spin 1s ease-in-out infinite',
                  marginRight: '0.5rem'
                }}></span>
                SIGNING UP...
              </>
            ) : 'SIGN UP'}
          </button>
          <style jsx={"true"}>
            {`@keyframes spin { to { transform: rotate(360deg); } }`}
          </style>

          <p className="login-redirect">
            Already have an account? <Link to="/login" className="login-link">Log In</Link>
          </p>
        </form>
      </div>

      <footer className="auth-footer">
        <IoLanguage size={30} />
        <div className="auth-help-privacy">
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
