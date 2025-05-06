import * as yup from "yup";

export const createValidationSchema = (containers) => {
  const shape = {};
  containers.forEach((container) => {
    const containerShape = {};
    container.fields.forEach((field) => {
      if (field.required && field.type === "number") {
        containerShape[field.name] = yup
          .number()
          .typeError(`${field.label} must be a number.`)
          .required(`${field.label} is required.`);
      } else if (field.required) {
        containerShape[field.name] = yup
          .string()
          .required(`${field.label} is required.`)
          .trim();
      } else if (field.type === "number") {
        containerShape[field.name] = yup
          .number()
          .typeError(`${field.label} must be a number.`)
          .notRequired()
          .nullable();
      } else {
        containerShape[field.name] = yup.string().notRequired();
      }
    });
    shape[container.id] = yup.object().shape(containerShape);
  });
  return yup.object().shape(shape);
};
