import Joi from 'joi';

export const githubSync = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'GitHub access token is required',
  }),
});

export const leetcodeSync = Joi.object({
  username: Joi.string().max(50).required().messages({
    'any.required': 'LeetCode username is required',
    'string.max': 'Username cannot exceed 50 characters',
  }),
});
export default {
  githubSync,
  leetcodeSync,
};
