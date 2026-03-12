import { useState } from 'react';
import { useCreateDriverApplication } from './useCreateDriverApplication';

export default function DriverApplicationForm() {
  const createApplication = useCreateDriverApplication();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthday: '',
    previousEmployee: '',
    truckMake: '',
    truckYear: '',
    truckModel: '',
    licensePlate: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!/^\d{10}$/.test(form.phoneNumber)) newErrors.phoneNumber = "Phone must be 10 digits";
    if (form.licensePlate.length < 5 || form.licensePlate.length > 8)
      newErrors.licensePlate = "License plate must be 5-8 characters";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    createApplication.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="First Name" onChange={handleChange} />
      {errors.firstName && <p>{errors.firstName}</p>}

      <input name="lastName" placeholder="Last Name" onChange={handleChange} />
      {errors.lastName && <p>{errors.lastName}</p>}

      <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
      {errors.phoneNumber && <p>{errors.phoneNumber}</p>}

      <input type="date" name="birthday" onChange={handleChange} />

      <input
        name="previousEmployee"
        placeholder="Previous Sponsor Employer (optional)"
        onChange={handleChange}
      />

      <h3>Truck Information</h3>
      <input name="truckMake" placeholder="Truck Make" onChange={handleChange} />
      <input name="truckModel" placeholder="Truck Model" onChange={handleChange} />
      <input name="truckYear" placeholder="Truck Year" onChange={handleChange} />

      <input
        name="licensePlate"
        placeholder="License Plate"
        maxLength={8}
        onChange={handleChange}
      />
      {errors.licensePlate && <p>{errors.licensePlate}</p>}

      <button type="submit">Submit Application</button>
    </form>
  );
}