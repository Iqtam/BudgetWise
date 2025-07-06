const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Upload = require("../models/Upload");
const AIExtraction = require("../models/AIExtraction");
const User = require("../models/User");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/receipts";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Get today's date for chat processing
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD format
};

// OCR extraction function
const extractReceiptData = async (imagePath) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Read the image file
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const prompt = `You are a financial assistant for a budget tracking app.

Given the image of a receipt, extract the following transaction details and return only a valid JSON object in this exact format:

{
  "type": "expense",
  "amount": 1980.0,
  "date": "2024-11-05T17:03:05",
  "vendor": "DESCO",
  "description": "electricity card recharge",
  "category": "Utilities"
}

If a value is missing on the receipt, make a reasonable guess, but always include all 6 keys. Return the JSON only. No explanation.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to parse AI response");
    }

    return extractedData;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};

// Chat-based transaction extraction function
const extractChatTransactionData = async (userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const TODAY_STRING = getTodayString();

    const prompt = `You are a financial assistant for a budget tracking app.

Today's date is ${TODAY_STRING}.

Given a user message in plain English that describes a financial transaction, extract the following transaction details and return only a valid JSON object in this exact format:

{
  "type": "expense",
  "amount": 1980.0,
  "date": "2024-11-05T17:03:05",
  "vendor": "DESCO",
  "description": "electricity card recharge",
  "category": "Utilities"
}

Always include all 6 keys: type, amount, date, vendor, description, and category.
The "type" field should be either "income" or "expense".
The "amount" field should be a float representing the total amount paid or received, without currency symbols.
The "date" field should be in ISO 8601 format (YYYY-MM-DDTHH:MM:SS), using 12:00 PM as the time if not specified.
The "vendor" field should be the name of the vendor or service provider.
The "description" field should be a short one-line summary of the transaction.
The "category" field should be a suggested category for the transaction, based on common financial categories (e.g., Food, Utilities, Travel, etc.).

Choose the best fit based on context.
If any value is not explicitly provided, make a reasonable guess based on context. For relative dates like "yesterday", "today", or "last week", resolve them to exact ISO 8601 timestamps based on today's date.

Return the JSON only. No explanation.`;

    const result = await model.generateContent([prompt, userMessage]);

    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to parse AI response");
    }

    return extractedData;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};

// OCR Receipt endpoint
exports.processReceipt = async (req, res) => {
  try {
    // Use multer middleware
    upload.single("receipt")(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            message: "File upload error",
            error: err.message,
          });
        }
        return res.status(400).json({
          message: "Invalid file type. Only images are allowed.",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const firebaseUid = req.user?.uid; // From Firebase auth middleware
      if (!firebaseUid) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      try {
        // Find user by Firebase UID
        const user = await User.findOne({
          where: { firebase_uid: firebaseUid },
        });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Save upload record
        const uploadRecord = await Upload.create({
          user_id: user.id,
          file_name: req.file.originalname,
          file_type: req.file.mimetype,
          storage_url: req.file.path,
          parsed_text: null, // Will be filled after OCR
        });

        // Process the image with Gemini
        const extractedData = await extractReceiptData(req.file.path);

        // Save AI extraction record
        const aiExtraction = await AIExtraction.create({
          user_id: user.id,
          upload_id: uploadRecord.id,
          source: `OCR from ${req.file.originalname}`,
          interpreted_type: extractedData.type,
          category_suggestion: extractedData.category,
          amount: extractedData.amount,
          extraction_method: "ocr",
          confidence_score: 0.85, // Default confidence for Gemini
        });

        // Update upload record with parsed text
        await uploadRecord.update({
          parsed_text: JSON.stringify(extractedData),
        });

        // Clean up the uploaded file (optional)
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn("Failed to cleanup uploaded file:", cleanupError);
        }

        // Return the extracted data
        res.status(200).json({
          message: "Receipt processed successfully",
          data: {
            ...extractedData,
            upload_id: uploadRecord.id,
            extraction_id: aiExtraction.id,
          },
        });
      } catch (extractionError) {
        console.error("OCR processing error:", extractionError);

        // Clean up file on error
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn(
            "Failed to cleanup uploaded file after error:",
            cleanupError
          );
        }

        res.status(500).json({
          message: "Failed to process receipt",
          error: extractionError.message,
        });
      }
    });
  } catch (error) {
    console.error("OCR endpoint error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get OCR history for user
exports.getOCRHistory = async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const extractions = await AIExtraction.findAll({
      where: {
        user_id: user.id,
        extraction_method: "ocr",
      },
      include: [
        {
          model: Upload,
          attributes: ["file_name", "file_type", "uploaded_at"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 50,
    });

    res.json({
      message: "OCR history retrieved successfully",
      data: extractions,
    });
  } catch (error) {
    console.error("Get OCR history error:", error);
    res.status(500).json({ message: "Failed to retrieve OCR history" });
  }
};

// Chat-based transaction processing endpoint
exports.processChatTransaction = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("message", message);
    console.log("typeof message", typeof message);
    // console.log("message.trim().length", message.trim().length);
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Message is required and must be a non-empty string",
      });
    }

    const firebaseUid = req.user?.uid; // From Firebase auth middleware
    if (!firebaseUid) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    try {
      // Find user by Firebase UID
      const user = await User.findOne({
        where: { firebase_uid: firebaseUid },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Process the message with Gemini
      const extractedData = await extractChatTransactionData(message.trim());

      // Save AI extraction record
      const aiExtraction = await AIExtraction.create({
        user_id: user.id,
        upload_id: null, // No upload for chat-based processing
        source: `Chat: "${message.trim()}"`,
        interpreted_type: extractedData.type,
        category_suggestion: extractedData.category,
        amount: extractedData.amount,
        extraction_method: "chat",
        confidence_score: 0.8, // Default confidence for chat processing
      });

      // Return the extracted data
      res.status(200).json({
        message: "Transaction processed successfully",
        data: {
          ...extractedData,
          extraction_id: aiExtraction.id,
        },
      });
    } catch (extractionError) {
      console.error("Chat processing error:", extractionError);

      res.status(500).json({
        message: "Failed to process transaction",
        error: extractionError.message,
      });
    }
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
