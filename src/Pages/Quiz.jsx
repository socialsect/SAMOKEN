import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../Components/TopNavbar';
import BottomNavbar from '../Components/BottomNavbar';
import '../Styles/page-template.css';
import '../Styles/quiz.css';

const Quiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [consumedPosture, setConsumedPosture] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState({});

  const quizKey = 'AJKrszOMFjxDh97SifetMS1128600';
  const baseURL = 'https://api.quizell.com';

  useEffect(() => {
    loadQuiz();
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Restore position if returning from posture screen
  useEffect(() => {
    try {
      const idx = sessionStorage.getItem('posture_origin_index');
      if (idx != null) {
        const parsed = parseInt(idx, 10);
        if (!Number.isNaN(parsed)) {
          setCurrentPageIndex(parsed);
        }
        sessionStorage.removeItem('posture_origin_index');
      }
    } catch {}
  }, []);
  // Auto-apply posture result on question 8 when coming back from /posture-detection
  useEffect(() => {
    if (!quizData?.data?.totalPages) return;
    const question8 = quizData.data.totalPages[7];
    if (!question8) return;
    const onQuestion8 = currentPageIndex === 7;
    if (!onQuestion8 || consumedPosture) return;
    try {
      const raw = sessionStorage.getItem('posture_result');
      if (!raw) return;
      const { answerId } = JSON.parse(raw);
      if (!answerId) return;
      // Apply selection and clear
      setSelectedAnswers(prev => ({ ...prev, [String(question8.id)]: String(answerId) }));
      sessionStorage.removeItem('posture_result');
      setConsumedPosture(true);
      // Immediately advance to question 9
      setTimeout(() => {
        handleNextPage();
      }, 0);
    } catch {}
  }, [quizData, currentPageIndex, consumedPosture]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        api_token: quizKey
      };

      const urlParams = new URLSearchParams(window.location.search);
      const lang = urlParams.get('lang');
      if (lang) {
        payload.lang = lang;
      }

      console.log('Making API request with payload:', payload);
      console.log('API URL:', `${baseURL}/api/loadQuiz`);

      const response = await axios.get(`${baseURL}/api/loadQuiz`, { 
        params: payload 
      });

      console.log("Full Quiz Response:", response);
      console.log("Quiz Response Data:", response.data);
      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      // Modify the quiz data to add the posture detector option to question 7
      const modifiedData = addPostureDetectorOption(response.data);
      setQuizData(modifiedData);
    } catch (error) {
      console.error("Error loading quiz:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      setError(`Failed to load quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to add posture detector option to the 8th question
  const addPostureDetectorOption = (quizData) => {
    if (!quizData?.data?.totalPages) return quizData;

    const modifiedData = { ...quizData };
    
    // Get the 8th question (index 7 since it's 0-indexed)
    const question8 = modifiedData.data.totalPages[7];
    
    if (question8 && question8.pageDesign?.blocksArray) {
      // Find the option block
      const optionBlock = question8.pageDesign.blocksArray.find(block => block.type === 'option');
      
      if (optionBlock && optionBlock.options) {
        // Add the new posture detector option
        const newOption = {
          id: 'posture_detector_option',
          value: 'Or check your posture with our state of the art AI posture detector',
          image: null
        };
        
        optionBlock.options.push(newOption);
        console.log('Added posture detector option to the 8th question (index 7)');
        console.log('Question details:', question8);
      }
    }
    
    return modifiedData;
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
    
    // Check if the selected option is the posture detector option
    if (answerId === 'posture_detector_option') {
      // Redirect to posture detector page
      try {
        sessionStorage.setItem('posture_origin_index', String(currentPageIndex));
        sessionStorage.setItem('posture_origin_question_id', String(questionId));
      } catch {}
      setTimeout(() => {
        window.location.href = '/posture-detection'; // Redirect to posture detection page
      }, 500);
      return;
    }
    
    // Automatically move to next page after a short delay
    setTimeout(() => {
      handleNextPage();
    }, 500); // 500ms delay to show the selection
  };

  const handleNextPage = () => {
    if (quizData && quizData.data && quizData.data.totalPages && currentPageIndex < quizData.data.totalPages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentPageIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setCheckboxStates({});
  };

  const applyStyles = (styleObj) => {
    if (!styleObj) return {};
    
    const styles = {};
    Object.keys(styleObj).forEach(key => {
      if (key !== 'jsCode' && key !== 'hoverStatus' && key !== 'customizeStatus') {
        styles[key] = styleObj[key];
      }
    });
    return styles;
  };

  const renderBlock = (block, questionId) => {
    const blockStyles = applyStyles(block.style);
    
    switch (block.type) {
      case 'text':
        // Process HTML content to remove conflicting inline styles
        let processedContent = block.content;
        if (processedContent) {
          // Remove font-family from inline styles to let CSS handle it
          processedContent = processedContent.replace(/font-family\s*:\s*[^;]+;?/gi, '');
          processedContent = processedContent.replace(/font-family\s*=\s*["'][^"']*["']/gi, '');
        }
        
        // Check if this is a heading (questionTitle) or regular text
        const isHeading = block.questionTitle;
        
        return (
          <div 
            key={block.content}
            className="quiz-text-block"
            style={{
              ...blockStyles,
              textAlign: 'center',
              maxWidth: '100%',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
              padding: '0 20px',
              boxSizing: 'border-box',
              fontFamily: isHeading ? 'GoodTimes, monospace' : 'Avenir, sans-serif',
              fontWeight: isHeading ? 'bold' : 'normal'
            }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        );

      case 'option':
        return (
          <div key={questionId} className="quiz-options-container" style={{
            ...blockStyles,
            padding: '0 20px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {block.options?.map((option) => {
              const isSelected = selectedAnswers[questionId] === option.id;
              const optionStyles = {
                ...blockStyles,
                // Enforce consistent card styling: white card, black text
                backgroundColor: '#ffffff',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isSelected ? '2px solid #cb0000' : '1px solid #e5e5e5',
                padding: '15px',
                margin: '5px',
                borderRadius: (block.style?.defaultTab?.borderRadius || block.style?.borderRadius || '8px'),
                maxWidth: '100%',
                boxSizing: 'border-box'
              };

              return (
                <div
                  key={option.id}
                  className={`quiz-option-item ${isSelected ? 'selected' : ''}`}
                  style={optionStyles}
                  onClick={() => handleAnswerSelect(questionId, option.id)}
                >
                  {option.image && (
                    <img 
                      src={option.image} 
                      alt={option.value}
                      style={{
                        width: block.style?.imageWidth || '100px',
                        height: block.style?.imageHeight || '100px',
                        objectFit: 'contain',
                        marginBottom: '10px'
                      }}
                    />
                  )}
                  <div className="quiz-option-text" style={{
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}>{option.value}</div>
                </div>
              );
            })}
          </div>
        );

      case 'freeText': {
        const fieldType = block.selectedInfoType?.type || 'text';
        const placeholder = block.InfoTypePlaceholder || '';
        const fieldName = block.selectedInfoType?.fieldName || `field_${questionId}`;
        const isRequired = block.isRequired || false;
        
        return (
          <div key={`freetext-${questionId}`} className="quiz-freetext-block" style={{ 
            margin: '16px 0',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 20px'
          }}>
            <input
              type={fieldType}
              placeholder={placeholder}
              name={fieldName}
              required={isRequired}
              style={{
                width: '100%',
                maxWidth: 400,
                padding: '12px 16px',
                fontSize: 14,
                border: '1px solid #e5e5e5',
                borderRadius: 6,
                backgroundColor: '#000',
                color: '#fff',
                outline: 'none',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#cb0000';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e5e5';
              }}
            />
          </div>
        );
      }

      case 'checkbox': {
        const checkboxKey = `checkbox-${questionId}`;
        const isChecked = checkboxStates[checkboxKey] || false;
        
        return (
          <div key={checkboxKey} className="quiz-checkbox-block" style={{ 
            margin: '16px 0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 8,
            padding: '0 20px',
            flexWrap: 'wrap',
            textAlign: 'center'
          }}>
            <input
              type="checkbox"
              id={checkboxKey}
              checked={isChecked}
              onChange={(e) => {
                setCheckboxStates(prev => ({
                  ...prev,
                  [checkboxKey]: e.target.checked
                }));
              }}
              required={block.isRequired || false}
              style={{
                width: 16,
                height: 16,
                accentColor: '#cb0000'
              }}
            />
            <label htmlFor={checkboxKey} style={{ 
              color: '#fff', 
              fontSize: 14,
              textAlign: 'center',
              maxWidth: '100%',
              overflowWrap: 'break-word'
            }}>
              {block.text} 
              <a 
                href={block.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#ff2600', textDecoration: 'underline', marginLeft: 4 }}
              >
                {block.linkText}
              </a>
              {block.isRequired && <span style={{ color: '#ff2600' }}>*</span>}
            </label>
          </div>
        );
      }

      case 'skipButton': {
        return (
          <div key={`skip-${questionId}`} className="quiz-skip-block" style={{ 
            textAlign: 'center', 
            margin: '16px 0',
            padding: '0 20px'
          }}>
            <button
              onClick={handleNextPage}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {block.text}
            </button>
          </div>
        );
      }

      case 'product': {
        const products = Array.isArray(block.content) ? block.content : [];
        const badgeText = block.productRankOption?.[0]?.text || '';
        
        // Debug logging for product data
        console.log('Product block data:', block);
        console.log('Products array:', products);
        
        return (
          <div key={`product-${questionId}`} className="quiz-product-block" style={{ width: '100%', padding: '0 20px' }}>
            {products.slice(0, Number(block.limitProductLength || products.length)).map((p, idx) => {
              console.log('Product item:', p);
              return (
                <div
                  key={p.id || idx}
                  className="quiz-product-card"
                  style={{
                    background: '#fff',
                    color: '#000',
                    borderRadius: 8,
                    border: '1px solid #e5e5e5',
                    padding: 16,
                    margin: '12px auto',
                    maxWidth: 900,
                  }}
                >
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      {badgeText && idx === 0 && (
                        <div style={{
                          position: 'absolute', top: -10, left: -10,
                          background: '#8B0000', color: '#fff', borderRadius: 20,
                          padding: '6px 12px', fontWeight: 700, fontSize: 12
                        }}>{badgeText}</div>
                      )}
                      {p.image && p.image !== 'https://cdn.shopify.com/s/files/1/0428/3872/0663/files/Default_image.png?v=1646417708' ? (
                        <img
                          src={p.image}
                          alt={p.title || p.name || 'Product'}
                          style={{ 
                            width: 320, 
                            height: 'auto', 
                            objectFit: 'contain', 
                            background: '#f8f8f8', 
                            borderRadius: 6 
                          }}
                          onError={(e) => {
                            console.log('Image failed to load:', p.image);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 320,
                          height: 200,
                          background: '#f8f8f8',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          fontSize: 14
                        }}>
                          Product Image
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, textAlign: 'center' }}>
                        {p.title || p.name || 'Your Runner Configuration'}
                      </div>
                      {p.description && (
                        <div style={{ marginTop: 8, color: '#333', whiteSpace: 'pre-wrap' }}>{p.description}</div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={() => { if (p.url) window.open(p.url, '_blank'); }}
                          className="quiz-regular-button"
                          style={{
                            marginTop: 16,
                            backgroundColor: '#8B0000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 20px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}>
                          {block.buttonText || 'Show my product'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      case 'shareLink': {
        const shareUrl = encodeURIComponent(window.location.href);
        const title = block.titlePlaceholder || 'Check out your quiz results!';
        return (
          <div key={`share-${questionId}`} style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 24, marginBottom: 12 }}>
              {block.text || 'Share your configuration !'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {block.isWhatsappVisible !== false && (
                <a
                  href={`https://api.whatsapp.com/send?text=${title}%20${shareUrl}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: '#25D366', textDecoration: 'none', fontWeight: 700 }}
                >WhatsApp</a>
              )}
              {block.isTelegramVisible && (
                <a
                  href={`https://t.me/share/url?url=${shareUrl}&text=${title}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: '#2AABEE', textDecoration: 'none', fontWeight: 700 }}
                >Telegram</a>
              )}
              {block.isCopyLinkVisible !== false && (
                <button
                  onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); } catch {} }}
                  style={{ background: 'transparent', border: '1px solid #e5e5e5', color: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}
                >Copy Link</button>
              )}
            </div>
          </div>
        );
      }

      case 'button':
        // console.log('Rendering button block, currentPageIndex:', currentPageIndex);
        // console.log('Should show back button:', currentPageIndex > 0);
        // console.log('Button block:', block);
        
        // Check if this is a navigation button or a regular button
        if (block.text === 'START' || block.content === 'this is button') {
          // This is a regular button, not navigation
          return (
            <div key="regular-button" className="quiz-regular-button-container" style={blockStyles}>
              <button 
                className="quiz-regular-button"
                onClick={handleNextPage}
                style={{
                  ...applyStyles(block.style),
                  backgroundColor: block.style?.backgroundColor || '#cb0000',
                  color: block.style?.color || 'white',
                  border: 'none',
                  borderRadius: block.style?.borderRadius || '4px',
                  padding: '15px 25px',
                  fontSize: block.style?.fontSize || '16px',
                  fontWeight: block.style?.fontWeight || 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: 'GoodTimes, monospace',
                  width: block.style?.buttonWidth || 'auto',
                  height: block.style?.buttonHeight || 'auto',
                  margin: `${block.style?.marginTop || '0'} ${block.style?.marginRight || '0'} ${block.style?.marginBottom || '0'} ${block.style?.marginLeft || '0'}`,
                  boxShadow: '0 4px 8px rgba(139, 0, 0, 0.3)',
                  transform: 'translateY(0)'
                }}
              >
                {block.text || block.content || 'Continue'}
              </button>
            </div>
          );
        } else {
          // This is a navigation button
          return (
            <div key="navigation" className="quiz-navigation" style={blockStyles}>
              {/* Always show previous button if not on first page */}
              {currentPageIndex > 0 ? (
                <button 
                  className="quiz-nav-button back-button"
                  onClick={handlePreviousPage}
                  style={{
                    ...applyStyles(block.content?.backButton?.style),
                    lineHeight: '1',
                    margin: '0px',
                    visibility: 'visible',
                    opacity: '1',
                    display: 'flex',
                    position: 'relative',
                    zIndex: '10',
                    minWidth: '80px'
                  }}
                >
                  {block.content?.backButton?.text || '<'}
                </button>
              ) : (
                <div className="quiz-nav-button-placeholder"></div>
              )}
              
              {/* Show next button if not on last page */}
              {currentPageIndex < (quizData?.data?.totalPages?.length || 0) - 1 ? (
                <button 
                  className="quiz-nav-button next-button"
                  onClick={handleNextPage}
                  style={{
                    ...applyStyles(block.content?.nextButton?.style),
                    lineHeight: '1',
                    margin: '0px',
                    visibility: 'visible',
                    opacity: '1',
                    display: 'flex',
                    position: 'relative',
                    zIndex: '10',
                    minWidth: '80px'
                  }}
                >
                  {block.content?.nextButton?.text || '>'}
                </button>
              ) : (
                <div className="quiz-nav-button-placeholder"></div>
              )}
            </div>
          );
        }

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <TopNavbar />
        <div className="quiz-loading-container">
          <div className="quiz-loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <TopNavbar />
        <div className="quiz-error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadQuiz} className="quiz-retry-btn">
            Retry
          </button>
        </div>
        <BottomNavbar />
      </div>
    );
  }



  if (!quizData || !quizData.data || !quizData.data.totalPages) {
    return (
      <div className="page-container">
        <TopNavbar />
        <div className="quiz-error-container">
          <h2>Invalid Quiz Data</h2>
          <p>The quiz data structure is not as expected.</p>
          <button onClick={loadQuiz} className="quiz-retry-btn">
            Retry
          </button>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const currentPage = quizData.data.totalPages[currentPageIndex];
  const questionId = currentPage.id;
  const pageStyles = applyStyles(currentPage.pageDesign?.pageStyles);
  
  // Debug logging for button visibility
  console.log('Current page index:', currentPageIndex);
  console.log('Total pages:', quizData.data.totalPages.length);
  console.log('Should show back button:', currentPageIndex > 0);
  console.log('Current page name:', currentPage.name);
  console.log('Is mobile:', isMobile);
  console.log('Current page blocks:', currentPage.pageDesign?.blocksArray);
  console.log('Blocks with type button:', currentPage.pageDesign?.blocksArray?.filter(block => block.type === 'button'));

  if (quizCompleted) {
    return (
      <div className="page-container">
        <TopNavbar />
        <div className="quiz-completion-container">
          <h2>Quiz Completed!</h2>
          <p>Thank you for completing the quiz.</p>
          <div className="quiz-answers-summary">
            <h3>Your Answers:</h3>
            {Object.entries(selectedAnswers).map(([questionId, answerId]) => {
              const page = quizData.data.totalPages.find(p => p.id == questionId);
              const question = page?.pageDesign?.blocksArray?.find(b => b.questionTitle);
              const option = page?.pageDesign?.blocksArray?.find(b => b.type === 'option')?.options?.find(o => o.id == answerId);
              
              return (
                <div key={questionId} className="quiz-answer-item">
                  <strong>{question?.content || `Question ${questionId}`}:</strong> {option?.value || 'Unknown'}
                </div>
              );
            })}
          </div>
          <button onClick={resetQuiz} className="quiz-reset-btn">
            Take Quiz Again
          </button>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopNavbar />
      <div className="quiz-main-content" style={pageStyles}>
        <div className="quiz-progress">
          <div 
            className="quiz-progress-fill"
            style={{
              width: `${((currentPageIndex + 1) / quizData.data.totalPages.length) * 100}%`
            }}
          ></div>
        </div>
        
        <div className="quiz-content">
          {currentPage.pageDesign?.blocksArray?.map((block, index) => 
            renderBlock(block, questionId)
          )}
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Quiz;

