import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details
        }
      });
      return;
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const createConstraintSchema = Joi.object({
  stockSymbol: Joi.string().uppercase().min(1).max(10).required().messages({
    'string.uppercase': 'Stock symbol must be uppercase',
    'any.required': 'Stock symbol is required'
  }),
  buyTriggerPercent: Joi.number().min(-100).max(100).required().messages({
    'number.min': 'Buy trigger percent must be between -100 and 100',
    'number.max': 'Buy trigger percent must be between -100 and 100',
    'any.required': 'Buy trigger percent is required'
  }),
  sellTriggerPercent: Joi.number().min(-100).max(100).required().messages({
    'number.min': 'Sell trigger percent must be between -100 and 100',
    'number.max': 'Sell trigger percent must be between -100 and 100',
    'any.required': 'Sell trigger percent is required'
  }),
  profitTriggerPercent: Joi.number().min(0).max(1000).optional().messages({
    'number.min': 'Profit trigger percent must be positive',
    'number.max': 'Profit trigger percent must be reasonable'
  }),
  buyAmount: Joi.number().positive().required().messages({
    'number.positive': 'Buy amount must be positive',
    'any.required': 'Buy amount is required'
  }),
  sellAmount: Joi.number().positive().required().messages({
    'number.positive': 'Sell amount must be positive',
    'any.required': 'Sell amount is required'
  })
});

export const updateConstraintSchema = Joi.object({
  buyTriggerPercent: Joi.number().min(-100).max(100).optional(),
  sellTriggerPercent: Joi.number().min(-100).max(100).optional(),
  profitTriggerPercent: Joi.number().min(0).max(1000).optional(),
  buyAmount: Joi.number().positive().optional(),
  sellAmount: Joi.number().positive().optional(),
  isActive: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const backtestSchema = Joi.object({
  constraintId: Joi.string().uuid().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required()
}).custom((value, helpers) => {
  const startDate = new Date(value.startDate);
  const endDate = new Date(value.endDate);
  
  if (startDate >= endDate) {
    return helpers.error('any.invalid', { message: 'Start date must be before end date' });
  }
  
  if (endDate > new Date()) {
    return helpers.error('any.invalid', { message: 'End date cannot be in the future' });
  }
  
  return value;
});