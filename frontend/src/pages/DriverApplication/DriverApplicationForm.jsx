import { useState } from 'react';
import { useCreateDriverApplication } from './useCreateDriverApplication';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import styles from './DriverApplicationPage.module.scss';

export default function DriverApplicationForm() {
  const createApplication = useCreateDriverApplication();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthday: '',
    previousEmployee: false,
    previousEmployeeDuration: '',
    previousDrivingExperience: '',
    truckMake: '',
    truckYear: '',
    truckModel: '',
    licensePlate: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    setForm({
      ...form,
      previousEmployee: e.target.checked,
      previousEmployeeDuration: '',
      previousDrivingExperience: ''
    });
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

      {/* Personal Information */}
      <Card title="Personal Information">
        <div className={styles.fieldGroup}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input className={styles.input} name="firstName" placeholder="Jane" onChange={handleChange} />
              {errors.firstName && <p className={styles.fieldError}>{errors.firstName}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input className={styles.input} name="lastName" placeholder="Smith" onChange={handleChange} />
              {errors.lastName && <p className={styles.fieldError}>{errors.lastName}</p>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <input className={styles.input} name="phoneNumber" placeholder="8031234567" onChange={handleChange} />
              {errors.phoneNumber && <p className={styles.fieldError}>{errors.phoneNumber}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Date of Birth</label>
              <input className={styles.input} type="date" name="birthday" onChange={handleChange} />
            </div>
          </div>
        </div>
      </Card>

      {/* Previous Experience */}
      <Card title="Previous Experience">
        <div className={styles.fieldGroup}>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={form.previousEmployee}
                onChange={handleCheckbox}
              />
              Do you have previous experience at this sponsor organization?
            </label>
          </div>

          {form.previousEmployee && (
            <div className={styles.field}>
              <label className={styles.label}>How long?</label>
              <input
                className={styles.input}
                name="previousEmployeeDuration"
                placeholder="e.g. 2 years"
                value={form.previousEmployeeDuration}
                onChange={handleChange}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>
              Specify your previous driving experience (if any).
            </label>
            <textarea
              className={styles.textarea}
              name="previousDrivingExperience"
              placeholder="e.g. 5 years of long-haul trucking for XYZ Logistics"
              value={form.previousDrivingExperience}
              onChange={handleChange}
              rows={3}
            />
          </div>

        </div>
      </Card>

      {/* Truck Information */}
      <Card title="Truck Information">
        <div className={styles.fieldGroup}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Make</label>
              <input className={styles.input} name="truckMake" placeholder="Freightliner" onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Model</label>
              <input className={styles.input} name="truckModel" placeholder="Cascadia" onChange={handleChange} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Year</label>
              <input className={styles.input} name="truckYear" placeholder="2020" onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>License Plate</label>
              <input className={styles.input} name="licensePlate" placeholder="ABC1234" maxLength={8} onChange={handleChange} />
              {errors.licensePlate && <p className={styles.fieldError}>{errors.licensePlate}</p>}
            </div>
          </div>
        </div>
      </Card>

      <Button type="submit" color="primary">
        Submit Application
      </Button>

    </form>
  );
}