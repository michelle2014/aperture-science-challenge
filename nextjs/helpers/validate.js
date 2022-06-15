const validate = (values) => {
  const errors = {};

  if (!values.name) {
    console.log("name: " + values.name);
    errors.name = "Name is required";
  } else if (values.name.length < 5) {
    errors.name = "Name must be at least 5 characters long";
  }

  if (!values.dob) {
    console.log("dob: " + values.dob);
    errors.dob = "Date of birth is required";
  } else if (
    !/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/i.test(values.dob)
  ) {
    errors.dob = "Date of birth must be of format as 2002-06-30 22:30:15";
  }

  if (!values.score) {
    console.log("score: " + values.score);
    errors.score = "Score is required";
  } else if (typeof parseInt(values.score) !== "number") {
    errors.score = "Score must be a number";
  }

  if (!values.alive) {
    console.log("alive: " + values.alive);
    errors.alive = "Alive is required";
  } else if (values.alive !== "Y" && values.alive !== "N") {
    errors.alive = "Alive must be Y or N";
  }

  if (!values.chamber) {
    console.log("chamber: " + values.chamber);
    errors.chamber = "Test chamber is required";
  } else if (typeof parseInt(values.chamber) !== "number") {
    errors.chamber = "Test chamber must be a number";
  }

  return errors;
};
export default validate;
