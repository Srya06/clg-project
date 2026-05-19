import Joi from 'joi';

export const updateProfile = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  cgpa: Joi.number().min(0).max(10).messages({
    'number.min': 'CGPA cannot be negative',
    'number.max': 'CGPA cannot exceed 10',
  }),
  branch: Joi.string().max(100),
  year: Joi.number().integer().min(1).max(10), // year stored in DB
  semester: Joi.number().integer().min(1).max(10), // alias accepted from frontend
  bio: Joi.string().max(1000).allow('', null),
  interests: Joi.array().items(Joi.string().max(50)),
  skills: Joi.array().items(Joi.string().max(100)),
  linkedinUrl: Joi.string().uri().allow('', null),
  leetcodeUsername: Joi.string().allow('', null),
  careerGoal: Joi.string().max(200).allow('', null),
  department: Joi.string().max(100).allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'Please provide at least one field to update',
  });
export default {
  updateProfile,
};
