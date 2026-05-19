import { Request, Response, NextFunction } from 'express';
import { chatbotService } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const chat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;
    if (!message) {
      return next(new AppError('Please provide a message', 400));
    }

    try {
      const reply = await chatbotService.chat(message);
      res
        .status(200)
        .json(new ApiResponse(200, { reply }, 'AI response generated'));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Gemini API Error:', msg);
      return next(new AppError(`AI Mentor Error: ${msg}`, 503));
    }
  }
);
