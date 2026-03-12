import { useState } from "react";
import { apiFetch } from "@/api/apiFetch";
import "./DriverApplicationPage.scss";

export default function DriverApplicationPage() {
  const [formData, setFormData] = useState({
    orgId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthday: "",
    previousEmployee: false,
    truckMake: "",
    truckModel: "",
    truckYear: "",
    licensePlate: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("");

  function updateField(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function validateForm() {
    const errors = {};

    const orgId = parseInt(formData.orgId, 10);
    if (isNaN(orgId) || orgId <= 0) {
      errors.orgId = "Organization ID required";
    }

    if (!formData.firstName) errors.firstName = "First name required";
    if (!formData.lastName) errors.lastName = "Last name required";

    if (!/^\d{10}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Phone must be 10 digits";

    const year = parseInt(formData.truckYear, 10);
    if (isNaN(year) || year < 1980 || year > new Date().getFullYear())
      errors.truckYear = "Truck year invalid";

    if (formData.licensePlate.length < 5 || formData.licensePlate.length > 8)
      errors.licensePlate = "License plate must be 5-8 characters";

    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      if (age < 18) errors.birthday = "Driver must be at least 18";
    }

    return errors;
  }

  async function submitApplication() {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitStatus("error");
      return;
    }

    const payload = {
      sponsorOrgId: parseInt(formData.orgId, 10),
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      phoneNumber: formData.phoneNumber || null,
      birthday: formData.birthday || null,
      previousEmployee: formData.previousEmployee,
      truckMake: formData.truckMake || null,
      truckModel: formData.truckModel || null,
      truckYear: formData.truckYear ? parseInt(formData.truckYear, 10) : null,
      licensePlate: formData.licensePlate || null
    };

    try {
      const response = await apiFetch("/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to submit");

      setSubmitStatus("success");
      setFormData({
        orgId: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        birthday: "",
        previousEmployee: false,
        truckMake: "",
        truckModel: "",
        truckYear: "",
        licensePlate: ""
      });
      setFormErrors({});
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
    }
  }

  return (
    <div className="application-page">
      <div className="application-card">
        <h1 className="title">Driver Application</h1>

        {submitStatus === "success" && (
          <p className="success-message">Application submitted successfully!</p>
        )}
        {submitStatus === "error" && Object.keys(formErrors).length > 0 && (
          <p className="error-message">Please fix the errors below</p>
        )}
        {submitStatus === "error" && Object.keys(formErrors).length === 0 && (
          <p className="error-message">Submission failed. Try again later.</p>
        )}

        <p className="section-title">Organization</p>
        <div className="form-field">
          <input
            type="number"
            placeholder=" "
            value={formData.orgId}
            onChange={e => updateField("orgId", e.target.value)}
            required
          />
          <label>Organization ID</label>
          {formErrors.orgId && <p className="field-error">{formErrors.orgId}</p>}
        </div>

        <p className="section-title">Personal Information</p>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder=" "
              value={formData.firstName}
              onChange={e => updateField("firstName", e.target.value)}
              required
            />
            <label>First Name</label>
            {formErrors.firstName && <p className="field-error">{formErrors.firstName}</p>}
          </div>
          <div className="form-field">
            <input
              type="text"
              placeholder=" "
              value={formData.lastName}
              onChange={e => updateField("lastName", e.target.value)}
              required
            />
            <label>Last Name</label>
            {formErrors.lastName && <p className="field-error">{formErrors.lastName}</p>}
          </div>
        </div>

        <div className="form-field">
          <input
            type="text"
            placeholder=" "
            value={formData.phoneNumber}
            onChange={e => updateField("phoneNumber", e.target.value)}
            required
          />
          <label>Phone Number</label>
          {formErrors.phoneNumber && <p className="field-error">{formErrors.phoneNumber}</p>}
        </div>

        <div className="form-field">
          <input
            type="date"
            placeholder=" "
            value={formData.birthday}
            onChange={e => updateField("birthday", e.target.value)}
            required
          />
          <label>Birthday</label>
          {formErrors.birthday && <p className="field-error">{formErrors.birthday}</p>}
        </div>

        <p className="section-title">Employment</p>
        <div className="form-field">
          <select
            value={String(formData.previousEmployee)}
            onChange={e => updateField("previousEmployee", e.target.value === "true")}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
          <label>Previously Employed?</label>
        </div>

        <p className="section-title">Truck Information</p>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder=" "
              value={formData.truckMake}
              onChange={e => updateField("truckMake", e.target.value)}
              required
            />
            <label>Truck Make</label>
          </div>
          <div className="form-field">
            <input
              type="text"
              placeholder=" "
              value={formData.truckModel}
              onChange={e => updateField("truckModel", e.target.value)}
              required
            />
            <label>Truck Model</label>
          </div>
        </div>

        <div className="form-field">
          <input
            type="text"
            placeholder=" "
            value={formData.truckYear}
            onChange={e => updateField("truckYear", e.target.value)}
            required
          />
          <label>Truck Year</label>
          {formErrors.truckYear && <p className="field-error">{formErrors.truckYear}</p>}
        </div>

        <div className="form-field">
          <input
            type="text"
            placeholder=" "
            maxLength={8}
            value={formData.licensePlate}
            onChange={e => updateField("licensePlate", e.target.value)}
            required
          />
          <label>License Plate</label>
          {formErrors.licensePlate && <p className="field-error">{formErrors.licensePlate}</p>}
        </div>

        <button className="submit-btn" onClick={submitApplication}>
          Submit Application
        </button>
      </div>
    </div>
  );
}