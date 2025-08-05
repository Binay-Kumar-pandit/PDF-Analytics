const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const axios = require('axios');
const pdfPoppler = require('pdf-poppler'); // For PDF to image conversion
const Tesseract = require('tesseract.js'); // For OCR on images
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/exports', express.static('exports'));

// Ensure directories exist
const uploadsDir = 'uploads';
const exportsDir = 'exports';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to call GPT-4 via OpenRouter
async function callGPT4(prompt, systemMessage = '') {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'PDF Assistant',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
}

// Helper function to extract currency data
function extractCurrencyData(text) {
  const currencyPatterns = {
    USD: /\$\s*([0-9,]+\.?[0-9]*)/g,
    EUR: /€\s*([0-9,]+\.?[0-9]*)/g,
    GBP: /£\s*([0-9,]+\.?[0-9]*)/g,
    INR: /₹\s*([0-9,]+\.?[0-9]*)/g,
    Rs: /Rs\.?\s*([0-9,]+\.?[0-9]*)/gi,
    JPY: /¥\s*([0-9,]+\.?[0-9]*)/g,
  };

  const currencyTables = [];

  Object.entries(currencyPatterns).forEach(([currency, pattern]) => {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const items = [];
      let total = 0;

      matches.forEach((match, index) => {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          const matchIndex = match.index;
          const contextStart = Math.max(0, matchIndex - 100);
          const contextEnd = Math.min(text.length, matchIndex + 100);
          const context = text.substring(contextStart, contextEnd);

          const lines = context.split('\n');
          const matchLine = lines.find((line) => line.includes(match[0]));
          let description = matchLine ? matchLine.trim() : `Item ${index + 1}`;

          description = description.replace(pattern, '').trim();
          if (!description || description.length < 3) {
            description = `${currency} Transaction ${index + 1}`;
          }

          items.push({ description, amount });
          total += amount;
        }
      });

      if (items.length > 0) {
        currencyTables.push({ currency, total, items });
      }
    }
  });

  return currencyTables;
}

// Convert PDF pages to images using pdf-poppler
async function convertPdfToImages(pdfPath, outputDir) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const opts = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
    page: null,
  };

  await pdfPoppler.convert(pdfPath, opts);

  return fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith('.png'))
    .map((f) => path.join(outputDir, f));
}

// OCR an image using tesseract.js
async function ocrImage(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'eng', {
    logger: (m) => {
      // console.log(m); // uncomment if you want progress logs
    },
  });
  return data.text;
}

// OCR fallback extraction if pdf-parse fails or text is too low
async function extractTextWithOcr(pdfPath) {
  const tempImageDir = path.join(__dirname, 'temp_images');
  if (!fs.existsSync(tempImageDir)) fs.mkdirSync(tempImageDir, { recursive: true });

  let fullText = '';
  try {
    const images = await convertPdfToImages(pdfPath, tempImageDir);

    for (const imagePath of images) {
      const text = await ocrImage(imagePath);
      fullText += text + '\n\n';
      fs.unlinkSync(imagePath); // cleanup image after OCR
    }
  } finally {
    // Cleanup temp image folder if empty
    try {
      fs.rmdirSync(tempImageDir);
    } catch {}
  }

  return fullText;
}

// Updated PDF processing endpoint with OCR fallback
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const filePath = req.file.path;
    const filename = req.file.originalname;
    const buffer = fs.readFileSync(filePath);

    let extractedText = '';
    let pageCount = 1;
    try {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
      pageCount = pdfData.numpages || 1;

      if (!extractedText || extractedText.trim().length < 10) {
        console.log('Low text extracted, applying OCR fallback...');
        extractedText = await extractTextWithOcr(filePath);
      }
    } catch (err) {
      console.log('pdf-parse failed, applying OCR fallback...', err.message);
      extractedText = await extractTextWithOcr(filePath);
    }

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('Unable to extract readable text from PDF even after OCR fallback.');
    }

    // Extract currency data
    const currencyTables = extractCurrencyData(extractedText);

    // Generate AI overview using GPT-4
    const systemMessage = `You are an intelligent PDF analysis assistant. Analyze the provided PDF content and create a comprehensive, well-structured overview. 

Guidelines:
1. Identify the document type (invoice, report, resume, etc.)
2. Provide a clear summary of the main content
3. Highlight key information, dates, names, and important details
4. If it's a financial document, mention key financial figures
5. Use proper formatting with headings and bullet points
6. Be concise but thorough
7. Focus on the most important and relevant information

Format your response with clear sections and bullet points for easy reading.`;

    const prompt = `Please analyze this PDF content and provide a comprehensive overview:

DOCUMENT: ${filename}
CONTENT:
${extractedText.substring(0, 8000)} ${extractedText.length > 8000 ? '...(truncated)' : ''}

Please provide a well-structured analysis of this document.`;

    const overview = await callGPT4(prompt, systemMessage);
    const processingTime = Date.now() - startTime;

    // Cleanup uploaded file
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Failed to delete uploaded file:', e.message);
    }

    res.json({
      success: true,
      filename,
      processingTime,
      overview,
      currencyTables,
      extractedText,
      pageCount,
    });
  } catch (error) {
    console.error('PDF processing error:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    let errorMessage = 'Failed to process PDF';
    let errorDetails = error.message || '';

    if (error.message && error.message.includes('UnknownErrorExceptionClosure')) {
      errorMessage = 'PDF Processing Failed';
      errorDetails =
        'The PDF file might be corrupted, malformed, or contains complex structures that cannot be processed. Please try with a different PDF file.';
    } else if (error.message && error.message.includes('Invalid PDF')) {
      errorMessage = 'Invalid PDF File';
      errorDetails = 'The uploaded file does not appear to be a valid PDF document.';
    } else if (error.code === 'ENOENT') {
      errorMessage = 'File Not Found';
      errorDetails = 'The uploaded file could not be found or accessed.';
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
    });
  }
});

// Rest of your existing endpoints (chat, edit-text, health, global error handler) remain exactly same
// Copy paste your existing code below from here on...

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, pdfContent, filename } = req.body;

    if (!message || !pdfContent) {
      return res.status(400).json({ error: 'Missing message or PDF content' });
    }

    const systemMessage = `You are an intelligent PDF assistant powered by GPT-4. You have access to the complete content of a PDF document and can answer any questions about it accurately.

Guidelines:
1. Answer questions based ONLY on the PDF content provided
2. Be specific and cite relevant information from the document
3. If asked about page numbers, explain that you analyze the entire document content
4. For financial questions, provide specific numbers and calculations
5. Be helpful, accurate, and conversational
6. If information isn't in the PDF, clearly state that`;

    const prompt = `Document: ${filename}

PDF Content:
${pdfContent.substring(0, 6000)}${pdfContent.length > 6000 ? '...(content continues)' : ''}

User Question: ${message}

Please provide a helpful and accurate answer based on the PDF content.`;

    const response = await callGPT4(prompt, systemMessage);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message,
    });
  }
});

// Text editing endpoint
app.post('/api/edit-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;
    const instructions = req.body.instructions;

    if (!instructions || instructions.trim().length === 0) {
      return res.status(400).json({ error: 'No editing instructions provided' });
    }

    // Extract text from original PDF
    const buffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(buffer);
    const originalText = pdfData.text;

    // Use GPT-4 to process the editing instructions
    const systemMessage = `You are a PDF text editor. You will receive the original text content of a PDF and editing instructions. Your task is to apply the requested changes and return the modified text.

Guidelines:
1. Apply the requested changes accurately
2. Maintain the overall structure and formatting
3. Only change what was specifically requested
4. Preserve important formatting cues like line breaks and spacing
5. Return the complete modified text`;

    const prompt = `Original PDF Text:
${originalText}

Editing Instructions: ${instructions}

Please apply the requested changes and return the complete modified text.`;

    const modifiedText = await callGPT4(prompt, systemMessage);

    // Create a new PDF with the modified text
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Split text into pages (roughly 3000 characters per page)
    const textChunks = [];
    const chunkSize = 3000;
    for (let i = 0; i < modifiedText.length; i += chunkSize) {
      textChunks.push(modifiedText.substring(i, i + chunkSize));
    }

    textChunks.forEach((chunk) => {
      const page = pdfDoc.addPage([612, 792]); // Standard letter size
      const lines = chunk.split('\n');
      let yPosition = 750;

      lines.forEach((line) => {
        if (yPosition < 50) {
          // Start a new page if we're running out of space
          return;
        }

        // Wrap long lines
        const maxWidth = 500;
        const words = line.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = font.widthOfTextAtSize(testLine, 12);

          if (textWidth > maxWidth && currentLine) {
            page.drawText(currentLine, {
              x: 50,
              y: yPosition,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= 15;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          page.drawText(currentLine, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= 15;
        }
      });
    });

    const pdfBytes = await pdfDoc.save();

    const timestamp = Date.now();
    const editedFilename = `edited-pdf-${timestamp}.pdf`;
    const editedPath = path.join(exportsDir, editedFilename);
    fs.writeFileSync(editedPath, pdfBytes);

    // Cleanup uploaded file
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}

    res.json({
      success: true,
      downloadUrl: `/exports/${editedFilename}`,
      filename: editedFilename,
      message: `Successfully applied changes: "${instructions}"`,
    });
  } catch (error) {
    console.error('Text editing error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({
      error: 'Failed to edit PDF text',
      details: error.message,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    openRouterConfigured: !!OPENROUTER_API_KEY,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Intelligent PDF Assistant Server running on port ${PORT}`);
  console.log(`📡 OpenRouter API: ${OPENROUTER_API_KEY ? 'Configured' : 'Not configured'}`);
});
