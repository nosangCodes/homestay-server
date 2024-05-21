import { CustomHelpers } from "joi";

const validatePassword = (value: string, helpers: CustomHelpers) => {
  if (value.length < 6) {
    return helpers.message({
      custom: "Password must have at least 6 characters.",
    });
  }

  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message({
      custom: "Password must contain at least 1 letter and 1 number.",
    });
  }

  return value;
};

export { validatePassword };
