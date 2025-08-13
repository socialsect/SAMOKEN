import wixData from 'wix-data';
import { ok, notFound } from 'wix-http-functions';

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // Or replace * with your exact frontend origin
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

/**
 * CORS preflight handlers
 */
export function options_getVideos(request) {
  return ok({ headers: corsHeaders });
}
export function options_addVideo(request) {
  return ok({ headers: corsHeaders });
}
export function options_updateVideo(request) {
  return ok({ headers: corsHeaders });
}
export function options_removeVideo(request) {
  return ok({ headers: corsHeaders });
}

/**
 * GET all videos
 */
export async function get_getVideos(request) {
  try {
    const results = await wixData.query("Web-App-Video-Library")
      .descending("_createdDate")
      .limit(50)
      .find();

    const responseData = {
      success: true,
      videos: results.items?.map(item => ({
        id: item._id,
        title: item.title,
        description: item.description,
        url: item.url,
        category: item.category || 'training',
        difficulty: item.difficulty || 'beginner',
        createdAt: item._createdDate
      })) || []
    };

    return ok({ headers: corsHeaders, body: responseData });

  } catch (error) {
    console.error('getVideos error:', error);
    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: false, 
        error: error.message 
      } 
    });
  }
}

/**
 * POST: Add video - FIXED VERSION
 */
export async function post_addVideo(request) {
  try {
    console.log('addVideo function called');
    console.log('Request object keys:', Object.keys(request));
    
    let body;
    
    // NEW: Try to access the parsed data directly from the request object first
    if (request.body && typeof request.body === 'object') {
      body = request.body;
      console.log('Using request.body directly:', body);
    }
    
    // If that didn't work, try the text() method
    if (!body && typeof request.text === 'function') {
      try {
        const textBody = await request.text();
        console.log('Raw text body:', textBody);
        console.log('Text body type:', typeof textBody);
        
        if (textBody && textBody.trim()) {
          body = JSON.parse(textBody);
          console.log('Successfully parsed body from request.text()');
        }
      } catch (parseError) {
        console.error('Failed to parse text body:', parseError);
      }
    }
    
    // If text() didn't work, try json() method
    if (!body && typeof request.json === 'function') {
      try {
        body = await request.json();
        console.log('Successfully got body from request.json()');
      } catch (parseError) {
        console.error('Failed to parse json body:', parseError);
      }
    }
    
    // If neither worked, try direct properties
    if (!body) {
      // Check if body is already available as a property
      if (request.body) {
        if (typeof request.body === 'string') {
          try {
            body = JSON.parse(request.body);
            console.log('Parsed body from request.body string');
          } catch (parseError) {
            console.error('Failed to parse request.body string:', parseError);
          }
        } else if (typeof request.body === 'object') {
          body = request.body;
          console.log('Body already parsed from request.body object');
        }
      }
    }
    
    // Last resort: check for data in other common properties
    if (!body) {
      const possibleDataProps = ['data', 'payload', 'postData', 'requestBody'];
      for (const prop of possibleDataProps) {
        if (request[prop]) {
          console.log(`Trying property: ${prop}`, request[prop]);
          if (typeof request[prop] === 'string') {
            try {
              body = JSON.parse(request[prop]);
              console.log(`Successfully parsed from ${prop}`);
              break;
            } catch (e) {
              console.log(`Failed to parse ${prop}`);
            }
          } else if (typeof request[prop] === 'object') {
            body = request[prop];
            console.log(`Got object from ${prop}`);
            break;
          }
        }
      }
    }

    // NEW: Check if the data is in a different format (like FormData)
    if (!body && request.body && typeof request.body === 'string') {
      try {
        // Try to parse as JSON first
        body = JSON.parse(request.body);
        console.log('Parsed request.body as JSON:', body);
      } catch (e) {
        // If JSON parsing fails, try to parse as URL-encoded form data
        try {
          const formData = new URLSearchParams(request.body);
          body = {};
          for (const [key, value] of formData.entries()) {
            body[key] = value;
          }
          console.log('Parsed request.body as form data:', body);
        } catch (formError) {
          console.error('Failed to parse as form data:', formError);
        }
      }
    }

    // NEW: Try to access the parsed data from the request object in different ways
    if (!body) {
      // In Wix, sometimes the body is available in different properties
      const possibleBodyProps = ['body', 'data', 'payload', 'postData', 'requestBody', 'json', 'text'];
      for (const prop of possibleBodyProps) {
        if (request[prop]) {
          console.log(`Checking property: ${prop}`, request[prop]);
          if (typeof request[prop] === 'object' && request[prop] !== null) {
            // Check if this object has the expected fields
            if (request[prop].title || request[prop].url) {
              body = request[prop];
              console.log(`Found valid body in ${prop}:`, body);
              break;
            }
          }
        }
      }
    }

    console.log('Final extracted body:', body);
    console.log('Body type:', typeof body);
    
    if (!body) {
      console.error('No body found. Available request properties:', Object.keys(request));
      // Log more details about what's available
      for (const key of Object.keys(request)) {
        console.log(`Property ${key}:`, request[key]);
        console.log(`Property ${key} type:`, typeof request[key]);
      }
      return ok({ 
        headers: corsHeaders, 
        body: { 
          success: false, 
          error: 'No request body found. Available properties: ' + Object.keys(request).join(', ') 
        } 
      });
    }

    console.log('Body keys:', Object.keys(body));
    console.log('Full body content:', JSON.stringify(body, null, 2));

    // Extract values with fallbacks - using your exact field names
    const title = body.title || body.Title || '';
    const description = body.description || body.Description || '';
    const url = body.url || body.URL || body.videoUrl || '';
    
    console.log('Extracted values:', { title, description, url });
    
    // Validate required fields
    if (!title || !url) {
      console.log('Validation failed - missing title or url');
      console.log('Available fields in body:', Object.keys(body));
      console.log('Title value:', title);
      console.log('URL value:', url);
      return ok({ 
        headers: corsHeaders, 
        body: { 
          success: false, 
          error: `Title and URL are required. Received: title="${title}", url="${url}". Available fields: ${Object.keys(body).join(', ')}` 
        } 
      });
    }

    console.log('Validation passed, attempting to insert into Web-App-Video-Library collection...');

    // Insert into your Wix collection with your exact field names
    const newVideo = await wixData.insert("Web-App-Video-Library", {
      Title: title,
      Description: description,
      URL: url
    });

    console.log('Video inserted successfully into Web-App-Video-Library:', newVideo);

    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: true, 
        message: 'Video added successfully',
        video: {
          id: newVideo._id,
          title: newVideo.Title,
          description: newVideo.Description,
          url: newVideo.URL,
          createdAt: newVideo._createdDate
        }
      } 
    });
  } catch (error) {
    console.error('addVideo error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: false, 
        error: error.message 
      } 
    });
  }
}

/**
 * PUT: Update video - FIXED VERSION
 */
export async function put_updateVideo(request) {
  try {
    console.log('updateVideo function called');
    console.log('Request object keys:', Object.keys(request));
    
    let body;
    
    // Try the text() method first
    if (typeof request.text === 'function') {
      try {
        const textBody = await request.text();
        console.log('Raw text body:', textBody);
        if (textBody && textBody.trim()) {
          body = JSON.parse(textBody);
          console.log('Successfully parsed body from request.text()');
        }
      } catch (parseError) {
        console.error('Failed to parse text body:', parseError);
      }
    }
    
    // If text() didn't work, try json() method
    if (!body && typeof request.json === 'function') {
      try {
        body = await request.json();
        console.log('Successfully got body from request.json()');
      } catch (parseError) {
        console.error('Failed to parse json body:', parseError);
      }
    }
    
    // If neither worked, try direct properties (same fallback logic as addVideo)
    if (!body) {
      if (request.body) {
        if (typeof request.body === 'string') {
          try {
            body = JSON.parse(request.body);
            console.log('Parsed body from request.body string');
          } catch (parseError) {
            console.error('Failed to parse request.body string:', parseError);
          }
        } else if (typeof request.body === 'object') {
          body = request.body;
          console.log('Body already parsed from request.body object');
        }
      }
    }
    
    if (!body) {
      return ok({ 
        headers: corsHeaders, 
        body: { 
          success: false, 
          error: 'No request body found. Available properties: ' + Object.keys(request).join(', ') 
        } 
      });
    }

    console.log('Final extracted body:', body);
    console.log('Body keys:', Object.keys(body));

    const { id, ...updates } = body;
    
    // Validate required fields
    if (!id) {
      return ok({ 
        headers: corsHeaders, 
        body: { 
          success: false, 
          error: 'Video ID is required' 
        } 
      });
    }

    console.log('Updating video with ID:', id);
    console.log('Updates:', updates);

    const updatedVideo = await wixData.update("Web-App-Video-Library", { 
      _id: id, 
      ...updates 
    });

    console.log('Video updated successfully:', updatedVideo);

    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: true, 
        video: updatedVideo 
      } 
    });
  } catch (error) {
    console.error('updateVideo error:', error);
    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: false, 
        error: error.message 
      } 
    });
  }
}

/**
 * DELETE: Remove video
 */
export async function delete_removeVideo(request) {
  try {
    // Get ID from query parameter instead of request body
    const id = request.query.id;
    
    // Validate required fields
    if (!id) {
      return ok({ 
        headers: corsHeaders, 
        body: { 
          success: false, 
          error: 'Video ID is required as query parameter' 
        } 
      });
    }

    await wixData.remove("Web-App-Video-Library", id);
    
    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: true,
        message: 'Video deleted successfully'
      } 
    });
  } catch (error) {
    console.error('removeVideo error:', error);
    return ok({ 
      headers: corsHeaders, 
      body: { 
        success: false, 
        error: error.message 
      } 
    });
  }
}