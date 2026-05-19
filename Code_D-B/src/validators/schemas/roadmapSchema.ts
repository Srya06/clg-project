import Joi from 'joi';

export const generateRoadmap = Joi.object({
  goal: Joi.string().required().max(100).messages({
    'any.required': 'Career goal is required',
  }),
  skillLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .default('beginner'),
  weeks: Joi.number().integer().min(1).max(12).default(4),
});

export const updateProgress = Joi.object({
  roadmapId: Joi.string().hex().length(24).required().messages({
    'string.length': 'Invalid Roadmap ID format',
    'any.required': 'Roadmap ID is required',
  }),
  taskId: Joi.string().required().messages({
    'any.required': 'Task ID is required',
  }),
  isCompleted: Joi.boolean().required().messages({
    'any.required': 'isCompleted flag is required',
  }),
});

export default {
  generateRoadmap,
  updateProgress,
};
