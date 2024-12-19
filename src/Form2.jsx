import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = 'http://localhost:3000/api/'; 
const Form2 = () => {
  const [formData, setFormData] = useState({
    mainForm: {
      firstName: "",
      lastName: "",
      dropDown: "",
      image: null,
    },
    stepForms: [], // Array to hold step form objects
  });
  const [errors, setErrors] = useState({ mainForm: {}, stepForms: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const handleMainFormChange = (event) => {
    const value =
      event.target.name === "image"
        ? event.target.files[0]
        : event.target.value;
    setFormData((prev) => ({
      ...prev,
      mainForm: {
        ...prev.mainForm,
        [event.target.name]: value,
      },
    }));
  };

  const handleAddStepForm = () => {
    setFormData((prev) => ({
      ...prev,
      stepForms: [
        ...prev.stepForms,
        { firstName: "", lastName: "", files: [] },
      ],
    }));
  };

  const handleStepFormChange = (event, index) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const updatedStepForms = [...prev.stepForms];
      updatedStepForms[index][name] = value;
      return { ...prev, stepForms: updatedStepForms };
    });
  };

  const handleStepFormFileChange = (event, index) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => {
      const updatedStepForms = [...prev.stepForms];
      updatedStepForms[index].files = files;
      return { ...prev, stepForms: updatedStepForms };
    });
  };
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/fetchData");
      console.log("response from get api", res.data);
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const validate = () => {
    const newErrors = {
      mainForm: {},
      stepForms: [],
    };
    let isValid = true;

    // Validate main form
    if (!formData.mainForm.firstName) {
      newErrors.mainForm.firstName = "First name is required";
      isValid = false;
    }
    if (!formData.mainForm.lastName) {
      newErrors.mainForm.lastName = "Last name is required";
      isValid = false;
    }
    if (!formData.mainForm.dropDown) {
      newErrors.mainForm.dropDown = "Please select an option";
      isValid = false;
    }
    if (!formData.mainForm.image) {
      newErrors.mainForm.image = "Please upload an image";
      isValid = false;
    }

    // Validate step forms
    formData.stepForms.forEach((step, index) => {
      const stepErrors = {};
      if (!step.firstName) {
        stepErrors.firstName = "First name is required";
        isValid = false;
      }
      if (!step.lastName) {
        stepErrors.lastName = "Last name is required";
        isValid = false;
      }
      if (step.files.length === 0) {
        stepErrors.files = "Please upload at least one file";
        isValid = false;
      }
      newErrors.stepForms[index] = stepErrors;
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation
    if (!validate()) {
      return;
    }
    setIsLoading(true)
    try {
      const combinedData = new FormData();
      const { mainForm, stepForms } = formData;

      // Append main form data
      combinedData.append("firstName", mainForm.firstName);
      combinedData.append("lastName", mainForm.lastName);
      combinedData.append("dropDown", mainForm.dropDown);
      if (mainForm.image) {
        combinedData.append("image", mainForm.image);
      }

      // Append step form data
      stepForms.forEach((step, index) => {
        combinedData.append(`stepForms[${index}][firstName]`, step.firstName);
        combinedData.append(`stepForms[${index}][lastName]`, step.lastName);
        step.files.forEach((file, fileIndex) => {
          combinedData.append(`stepForms[${index}][files][${fileIndex}]`, file);
        });
      });

      // Submit data to the API
      const response = await axios.post("http://localhost:3000/api/submit", combinedData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsLoading(false)
      console.log("Response:", response.status);
      fetchData();

      // Reset form after successful submission
      setFormData({
        mainForm: {
          firstName: "",
          lastName: "",
          dropDown: "",
          image: null,
        },
        stepForms: [],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  

  const handleFormDelete = async (formId) => {
try {
  const response = await axios.delete(`${API_BASE_URL}delete-form/${formId}`)
  console.log("response from form delete form api======>",response)
  if(response.status === 200){
    fetchData();
  }
} catch (error) {
  console.log(error)
}
  }
  const handleImageDelete = async (public_id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}delete/${public_id}`)
      console.log("response from form delete image api======>",response)
      if(response.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
    <div className="h-screen w-full grid grid-cols-2">
      <div className="shadow-lg w-[500px] max-h-[700px] overflow-auto mx-auto px-5 py-5">
        <form onSubmit={handleSubmit}>
          {/* Main Form */}
          <h1 className="text-lg my-1">First Name</h1>
          {errors.mainForm.firstName && (
            <span className="text-red-500">{errors.mainForm.firstName}</span>
          )}
          <input
            type="text"
            name="firstName"
            value={formData.mainForm.firstName}
            onChange={handleMainFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          />
          <h1 className="text-lg my-1 mt-3">Last Name</h1>
          <input
            type="text"
            name="lastName"
            value={formData.mainForm.lastName}
            onChange={handleMainFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          />
          {errors.mainForm.lastName && (
            <span className="text-red-500">{errors.mainForm.lastName}</span>
          )}
          <h1 className="text-lg my-1 mt-3">Select</h1>
          <select
            name="dropDown"
            value={formData.mainForm.dropDown}
            onChange={handleMainFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          >
            <option value="">Select an option</option>
            <option value="valueOne">Value One</option>
            <option value="valueTwo">Value Two</option>
            <option value="valueThree">Value Three</option>
          </select>
          {errors.mainForm.dropDown && (
            <span className="text-red-500">{errors.mainForm.dropDown}</span>
          )}
          <h1 className="text-lg my-1 mt-3">Add Image</h1>
          <input
            type="file"
            name="image"
            onChange={handleMainFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          />
          {errors.mainForm.image && (
            <span className="text-red-500">{errors.mainForm.image}</span>
          )}
         
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-3"
              disabled={isLoading}
            >
          {isLoading? "isLoading...":"Submit"}    
            </button>
        
        </form>

        {/* Step Forms */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-5"
          onClick={handleAddStepForm}
        >
          Add Step Form
        </button>
        {formData.stepForms.map((step, index) => (
          <div key={index} className="mt-5">
            <h1 className="text-lg my-1">Step Form - First Name</h1>
            <input
              type="text"
              name="firstName"
              value={step.firstName}
              onChange={(event) => handleStepFormChange(event, index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
            {errors.stepForms[index]?.firstName && (
              <span className="text-red-500">
                {errors.stepForms[index]?.firstName}
              </span>
            )}

            <h1 className="text-lg my-1">Step Form - Last Name</h1>
            <input
              type="text"
              name="lastName"
              value={step.lastName}
              onChange={(event) => handleStepFormChange(event, index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
            {errors.stepForms[index]?.lastName && (
              <span className="text-red-500">
                {errors.stepForms[index]?.lastName}
              </span>
            )}
            <h1 className="text-lg my-1">Step Form - Files</h1>
            <input
              type="file"
              multiple
              onChange={(event) => handleStepFormFileChange(event, index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
            {errors.stepForms[index]?.files && (
              <span className="text-red-500">
                {errors.stepForms[index]?.files}
              </span>
            )}
          </div>
        ))}
      </div>
    
    </div>
    
    
    <div className="p-4 max-h-full overflow-hidden overflow-y-auto">
        {data.length > 0 &&
          data.map((form, index) => {
            return (

              <div className="shadow-lg mt-8 p-4 rounded-mg" key={index}>
                <h1 className="text-sm">FirstName: {form.firstName}</h1>
                <h1 className="text-sm">LastName: {form.lastName}</h1>
                <h1 className="text-sm">DropDown: {form.dropDown}</h1>

                {/* Display root-level image */}
                {form.image &&
                  form.image.length > 0 &&
                  form.image.map((img, imgIndex) => (
                    <>
                    <div className="w-[100px] h-[100px]" key={imgIndex}>
                      <img
                        src={img.url}
                        alt="Root level image"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button onClick={(event)=>handleImageDelete(img.publicId)} className="  inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md">
	<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
	</svg>
	Delete
  </button>
                    </>
                  ))}

                {/* Display stepForms */}
                {form.stepForms &&
                  form.stepForms.length > 0 &&
                  form.stepForms.map((step, stepIndex) => {
                    return (
                      <div key={stepIndex}>
                        <h1 className="text-lg">Step Form: {stepIndex + 1}</h1>
                        <h1 className="text-sm">FirstName: {step.firstName}</h1>
                        <h1 className="text-sm">LastName: {step.lastName}</h1>

                        {/* Display files in each stepForm */}
                        {step.files &&
                          step.files.length > 0 &&
                          step.files.map((file, fileIndex) => {
                            return (
                              <>
                              <div className="w-[100px] h-[100px]" key={fileIndex}>
                                <img
                                  src={file.url}
                                  alt="Step Form image"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <button onClick={(event)=>handleImageDelete(file.publicId)} className="  inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md">
	<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
	</svg>
	Delete
  </button>
                              </>
                            );
                          })}
                      </div>
                    );
                  })}
                   <button className="bg-green-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-5">
                  <Link
                    to={`/edit2/${form._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    Edit
                  </Link>
                </button>
                <div class="bg-white p-4">
  <button onClick={(event)=>handleFormDelete(form._id)} className="w-full justify-center inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md">
	<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
	</svg>
	Delete
  </button>

 
</div>
              </div>



            );
          })}
      </div>

    </>
  );
};

export default Form2;
