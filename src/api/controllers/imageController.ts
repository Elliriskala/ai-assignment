import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fetchData from '../../lib/fetchData';
import * as fs from 'fs';
import path from 'path';
import {promisify} from 'util';

// OpenAI API response type
type ImageGenerationResponse = {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
};

const writeFileAsync = promisify(fs.writeFile);

// Create uploads directory
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

// Generate an image based on a text prompt

const generateImage = async (
  req: Request<{}, {}, {prompt: string; size?: string; style?: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {prompt, size = '1024x1024', style = 'vivid'} = req.body;

    if (!prompt) {
      next(new CustomError('Prompt is required', 400));
      return;
    }

    // Enhance the user prompt
    const enhancedPrompt = `Create an image for ${prompt}. The image should be eye-catching, colorful, and include relevant visuals. Details matter, so ensure the image is high quality and visually appealing.`;

    if (!process.env.OPENAI_API_URL) {
      next(new CustomError('Missing OpenAI API URL', 500));
      return;
    }

    // OpenAI image generation request
    const request = {
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      model: 'dall-e-3',
      style: style,
      response_format: 'b64_json',
    };

    // Send request to OpenAI API
    const imageResponse = await fetchData<ImageGenerationResponse>(
      process.env.OPENAI_API_URL + '/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    // Validate response
    if (!imageResponse.data || imageResponse.data.length === 0) {
      next(new CustomError('No image data received', 500));
      return;
    }

    const imageData = imageResponse.data[0].b64_json;

    if (!imageData) {
      next(new CustomError('No image content received', 500));
      return;
    }

    // Generate filename and path
    const timestamp = Date.now();
    const filename = `thumbnail_${timestamp}.png`;
    const filepath = path.join(uploadDir, filename);

    // Save the image
    const buffer = Buffer.from(imageData, 'base64');
    await writeFileAsync(filepath, buffer);

    // Return the image information
    res.json({
      success: true,
      message: 'Image generated successfully',
      filename: filename,
      filepath: filepath,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    next(error);
  }
};

export {generateImage};
