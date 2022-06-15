import { useState } from "react";

const useForm = (callback, validate, subject, error) => {
  const [values, setValues] = useState(subject || {});
  const [errors, setErrors] = useState(error || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("values in useForm", values);
    setErrors(validate(values));
    setIsSubmitting(true);
    if (Object.keys(errors).length === 0 && isSubmitting) {
      callback(event);
    }
  };

  const handleInputChange = (event) => {
    event.persist();
    console.log("handleInputChange", values);
    setValues((values) => ({
      ...values,
      [event.target.name]: event.target.value,
    }));
  };

  const validateInputs = (event) => {
    console.log("validating inputs");
    if (event.target.value === "error") {
      setErrors({ ...errors, [event.target.name]: true });
    } else setErrors({ ...errors, [event.target.name]: false });
  };

  return {
    handleInputChange,
    handleSubmit,
    validateInputs,
    values,
    errors,
  };
};

export default useForm;
