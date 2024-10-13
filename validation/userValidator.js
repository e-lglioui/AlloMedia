import Joi from 'joi'; 


export const registerValidation = (data) => { 
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(6).email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    address: Joi.string().min(6).required(),
    role:  Joi.string().min(3).max(30).required()
  });

  return schema.validate(data);
};
