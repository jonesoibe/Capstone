const Joi = require("joi");

exports.signupSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required(),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .required(),
  email: Joi.string()
    .min(6)
    .max(30)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$/))
    .message(
      '"password" must have at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long'
    )
    .required(),
});

exports.signinSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(30)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$/))
    .message(
      '"password" must have at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long'
    )
    .required(),
});

