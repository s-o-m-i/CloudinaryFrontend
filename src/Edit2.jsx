import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Edit2 = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mainForm: {
      firstName: "",
      lastName: "",
      dropDown: "",
      image: null,
    },
    stepForms: [],
  });
const navigate = useNavigate()
  const fetchUpdatedData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/getUpdatedForm/${id}`
      );
      console.log("response===>", response.data);
      setFormData({
        mainForm: {
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          dropDown: response.data.dropDown,
          image: response.data.image[0],  // Assuming first image is needed
        },
        stepForms: response.data.stepForms || [],  // Ensure stepForms is initialized properly
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleMainFormChange = (event) => {
    const value =
      event.target.name === "image" ? event.target.files[0] : event.target.value;
    setFormData((prev) => ({
      ...prev,
      mainForm: {
        ...prev.mainForm,
        [event.target.name]: value,
      },
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

  const handleStepFormFileChange = (event, publicId, fileIndex, stepIndex) => {
    console.log("publicId=====>", publicId);
    console.log(event.target.files[0]);
    console.log("fileIndex=======>", fileIndex);
    console.log("stepIndex=======>", stepIndex);
    const newFile = event.target.files[0];
    setFormData((prevFormData) => {
      const updatedStepForms = [...prevFormData.stepForms];
      const updatedFiles = [...(updatedStepForms[stepIndex].files || [])];

      // Replace the specific file at the given index
      updatedFiles[fileIndex] = { file: newFile,publicIdd: publicId };
      updatedStepForms[stepIndex].files = updatedFiles;

      return {
        ...prevFormData,
        stepForms: updatedStepForms,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const combinedData = new FormData();
      const { mainForm, stepForms } = formData;
      console.log("mainformData==========>", formData);

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
        step.files?.forEach((file, fileIndex) => {
          combinedData.append(
            `stepForms[${index}][files][${fileIndex}]`,
            file.file
          );
          combinedData.append(`stepForms[${index}][files][${fileIndex}][publicIdd]`, file.publicIdd || '');

        });
      });

      // Submit data to the API
      const response = await axios.put(
        `http://localhost:3000/api/updatedForm/${id}`,
        combinedData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Response status:", response.status);
      setIsLoading(false);
if(response.status === 200){
  navigate("/")
}
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

  useEffect(() => {
    fetchUpdatedData();
  }, [id]);

  useEffect(() => {
    console.log("FormData Updated:", formData);
  }, [formData]);

  return (
    <div className="h-screen w-screen flex bg-black text-red-500 items-center justify-center">
   {isLoading? <h1>Loading...</h1>:    <form
        onSubmit={handleSubmit}
        className="editable-form w-[500px] pr-5 max-h-[600px] overflow-hidden overflow-y-auto"
      >
        <h1 className="text-2xl text-red-600 font-semibold border-b-2 border-red-700 w-fit pb-2">
          Update Form
        </h1>
        <div className="field-box">
          <h5 className="text-sm font-semibold mt-5">FirstName:</h5>
          <input
            value={formData.mainForm.firstName}
            className="bg-transparent border-red-600 border-2 rounded-md w-full"
            type="text"
            name="firstName"
            onChange={handleMainFormChange}
          />
        </div>
        <div className="field-box mt-2">
          <h5 className="text-sm font-semibold mt-5">LastName:</h5>
          <input
            value={formData.mainForm.lastName}
            className="bg-transparent border-red-600 border-2 rounded-md w-full"
            type="text"
            name="lastName"
            onChange={handleMainFormChange}
          />
        </div>
        <div className="field-box mt-2">
          <h5 className="text-sm font-semibold mt-5">DropDown:</h5>
          <input
            value={formData.mainForm.dropDown}
            className="bg-transparent border-red-600 border-2 rounded-md w-full"
            type="text"
            name="dropDown"
            onChange={handleMainFormChange}
          />
        </div>
        <div className="w-full h-[100px]">
          {formData.mainForm.image && (
            <img
              src={formData.mainForm.image.url}
              alt="Uploaded"
              className="mt-5 object-cover w-full h-full"
            />
          )}
        </div>
        <div className="field-box mt-2">
          <h5 className="text-sm font-semibold mt-5">Image:</h5>
          <input
            id="fileInput"
            className="bg-transparent hidden border-red-600 border-2 rounded-md w-full"
            type="file"
            name="image"
            onChange={handleMainFormChange}
          />
          <div
            className="bg-transparent border-red-600 border-2 rounded-md w-full"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <h1 className="text-center text-white">Upload Image</h1>
          </div>
        </div>
        <h1 className="text-2xl mt-5 text-red-600 font-semibold border-b-2 border-red-700 w-fit pb-2">
          Step Forms
        </h1>
        {formData.stepForms.map((step, index) => (
          <div key={index} className="step_form">
            <div className="field-box">
              <h5 className="text-sm font-semibold mt-5">FirstName:</h5>
              <input
                value={step.firstName}
                className="bg-transparent border-red-600 border-2 rounded-md w-full"
                type="text"
                name="firstName"
                onChange={(event) => handleStepFormChange(event, index)}
              />
            </div>
            <div className="field-box mt-2">
              <h5 className="text-sm font-semibold mt-5">LastName:</h5>
              <input
                value={step.lastName}
                className="bg-transparent border-red-600 border-2 rounded-md w-full"
                type="text"
                name="lastName"
                onChange={(event) => handleStepFormChange(event, index)}
              />
            </div>
            <div className="flex items-center gap-5 mt-2">
              {step.files?.map((file, fileIndex) => (
                <div key={fileIndex} className="w-[200px] h-[100px]">
                  <img
                    src={file.url}
                    alt="Uploaded"
                    className="object-cover w-full h-full"
                  />
                  <input
                    type="file"
                    onChange={(event) =>
                      handleStepFormFileChange(
                        event,
                        file.publicId,
                        fileIndex,
                        index
                      )
                    }
                    className="bg-transparent border-red-600 border-2 rounded-md w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="bg-yellow-500 text-black mt-10">Submit</button>
      </form>
      }
    </div>
  );
};

export default Edit2;
