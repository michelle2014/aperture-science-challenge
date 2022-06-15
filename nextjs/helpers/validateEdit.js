const validate = (values) => {
  const errors = {};

  if (!values.editname) {
    console.log("editname: " + values.editname);
    errors.editname = "Please enter new name";
  } else if (values.editname.length < 5) {
    errors.editname = "Name must be at least 5 characters long";
  }

  if (!values.editdob) {
    console.log("editdob: " + values.editdob);
    errors.editdob = "Please enter the right Date of birth";
  } else if (
    !/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/i.test(values.editdob)
  ) {
    errors.editdob = "Date of birth must be of format as 2002-06-30 22:30:15";
  }

  if (!values.editscore) {
    console.log("editscore: " + values.editscore);
    errors.editscore = "Please enter the new score";
  } else if (typeof parseInt(values.editscore) !== "number") {
    errors.editscore = "Score must be a number";
  }

  if (!values.editalive) {
    console.log("editalive: " + values.editalive);
    errors.editalive = "Please enter the new alive value";
  } else if (values.editalive !== "Y" && values.editalive !== "N") {
    errors.editalive = "Alive must be Y or N";
  }

  if (!values.editchamber) {
    console.log("editchamber: " + values.editchamber);
    errors.editchamber = "Please enter the new test chamber";
  } else if (typeof parseInt(values.editchamber) !== "number") {
    errors.editchamber = "Test chamber must be a number";
  }

  return errors;
};
export default validate;
