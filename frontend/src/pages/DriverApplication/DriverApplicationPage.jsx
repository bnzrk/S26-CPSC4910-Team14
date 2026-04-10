import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "@/api/apiFetch";
import { useAvailableSponsorOrgs } from "@/api/sponsorOrg";
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import InlineErrors from "@/components/InlineErrors/InlineErrors";
import styles from "./DriverApplicationPage.module.scss";

const COMPANY_TRUCK = {
  truckMake: "Company",
  truckModel: "Fleet Vehicle",
  truckYear: new Date().getFullYear().toString(),
  licensePlate: "COMPANY"
};

export default function DriverApplicationPage()
{
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { driverOrgs } = useOrgContext();
  const { data: orgs } = useAvailableSponsorOrgs();
  const filteredOrgs = (driverOrgs && orgs) ? orgs.filter(o => !driverOrgs.some(d => d.id == o.id)) : null;

  const [formData, setFormData] = useState({
    orgId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthday: "",
    previousEmployee: false,
    previousEmployeeDuration: "",
    previousDrivingExperience: "",
    truckMake: "",
    truckModel: "",
    truckYear: "",
    licensePlate: "",
    isCompanyTruck: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill orgId from URL if present
  useEffect(() =>
  {
    const orgIdFromUrl = searchParams.get("orgId");
    if (orgIdFromUrl)
    {
      if (orgs && driverOrgs && filteredOrgs.some(o => o.id == orgIdFromUrl))
        updateField("orgId", orgIdFromUrl);
      else
        updateField("orgId", "");
    }
  }, [orgs, driverOrgs]);

  function updateField(field, value)
  {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleCompanyTruckToggle(checked)
  {
    if (checked)
    {
      setFormData(prev => ({
        ...prev,
        isCompanyTruck: true,
        truckMake: COMPANY_TRUCK.truckMake,
        truckModel: COMPANY_TRUCK.truckModel,
        truckYear: COMPANY_TRUCK.truckYear,
        licensePlate: COMPANY_TRUCK.licensePlate
      }));
    } else
    {
      setFormData(prev => ({
        ...prev,
        isCompanyTruck: false,
        truckMake: "",
        truckModel: "",
        truckYear: "",
        licensePlate: ""
      }));
    }
  }

  function validateForm()
  {
    const errors = {};

    const orgId = parseInt(formData.orgId, 10);
    if (isNaN(orgId) || orgId <= 0)
      errors.orgId = "Organization ID is required";

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";

    if (!/^\d{10}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Phone number must be 10 digits";

    if (!formData.isCompanyTruck)
    {
      const year = parseInt(formData.truckYear, 10);
      if (isNaN(year) || year < 1980 || year > new Date().getFullYear())
        errors.truckYear = "Please enter a valid truck year";

      if (formData.licensePlate.length < 5 || formData.licensePlate.length > 8)
        errors.licensePlate = "License plate must be 5–8 characters";
    }

    if (formData.birthday)
    {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ) age--;
      if (age < 18) errors.birthday = "Driver must be at least 18 years old";
    }

    return errors;
  }

  async function submitApplication()
  {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
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
      licensePlate: formData.isCompanyTruck ? null : (formData.licensePlate || null)
    };

    try
    {
      const response = await apiFetch("/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to submit");

      setSubmitStatus("success");
      setFormData({
        orgId: "", firstName: "", lastName: "", phoneNumber: "",
        birthday: "", previousEmployee: false, previousEmployeeDuration: "",
        previousDrivingExperience: "", truckMake: "",
        truckModel: "", truckYear: "", licensePlate: "", isCompanyTruck: false
      });
      setFormErrors({});
    } catch (err)
    {
      console.error(err);
      setSubmitStatus("error");
    } finally
    {
      setIsLoading(false);
    }
  }

  if (submitStatus === "success")
  {
    return (
      <main>
        <CardHost title="Application Submitted">
          <Card>
            <div className={styles.successBlock}>
              <p className={styles.successText}>
                Your application has been submitted successfully. The sponsor organization will review it and get back to you.
              </p>
              <Button color="primary" onClick={() => navigate("/driver/points")}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </CardHost>
      </main>
    );
  }

  return (
    <main>
      <CardHost>
        {submitStatus === "error" && (
          <InlineErrors errors={["Submission failed. Please try again."]} />
        )}

        {/* Organization */}
        <Card title="Organization">
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Organization ID</label>
              <select value={formData.orgId} onChange={e => updateField("orgId", e.target.value)}>
                <option value="" disabled hidden>Select a sponsor</option>
                {filteredOrgs && filteredOrgs.map((org) =>
                  <option key={org.id} value={org.id}>{org.name}</option>
                )}
              </select>
              {formErrors.orgId && <p className={styles.fieldError}>{formErrors.orgId}</p>}
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information">
          <div className={styles.fieldGroup}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={formData.firstName}
                  onChange={e => updateField("firstName", e.target.value)}
                  placeholder="Jane"
                />
                {formErrors.firstName && <p className={styles.fieldError}>{formErrors.firstName}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={formData.lastName}
                  onChange={e => updateField("lastName", e.target.value)}
                  placeholder="Smith"
                />
                {formErrors.lastName && <p className={styles.fieldError}>{formErrors.lastName}</p>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Phone Number</label>
                <input
                  className={styles.input}
                  type="text"
                  value={formData.phoneNumber}
                  onChange={e => updateField("phoneNumber", e.target.value)}
                  placeholder="8031234567"
                />
                {formErrors.phoneNumber && <p className={styles.fieldError}>{formErrors.phoneNumber}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  className={styles.input}
                  type="date"
                  value={formData.birthday}
                  onChange={e => updateField("birthday", e.target.value)}
                />
                {formErrors.birthday && <p className={styles.fieldError}>{formErrors.birthday}</p>}
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
                  checked={formData.previousEmployee}
                  onChange={e =>
                  {
                    updateField("previousEmployee", e.target.checked);
                    updateField("previousEmployeeDuration", "");
                  }}
                />
                Have you worked for this sponsor organization before?
              </label>
            </div>

            {formData.previousEmployee && (
              <div className={styles.field}>
                <label className={styles.label}>If yes, for how long?</label>
                <input
                  className={styles.input}
                  type="text"
                  value={formData.previousEmployeeDuration}
                  onChange={e => updateField("previousEmployeeDuration", e.target.value)}
                  placeholder="e.g. 2 years"
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                Do you have any previous driving experience? Please specify.
              </label>
              <textarea
                className={styles.textarea}
                value={formData.previousDrivingExperience}
                onChange={e => updateField("previousDrivingExperience", e.target.value)}
                placeholder="e.g. 5 years of long-haul trucking for XYZ Logistics"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Truck Information */}
        <Card title="Truck Information">
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.isCompanyTruck}
                  onChange={e => handleCompanyTruckToggle(e.target.checked)}
                />
                This is a company provided truck
              </label>
            </div>

            {!formData.isCompanyTruck && (
              <>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Make</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.truckMake}
                      onChange={e => updateField("truckMake", e.target.value)}
                      placeholder="Freightliner"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Model</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.truckModel}
                      onChange={e => updateField("truckModel", e.target.value)}
                      placeholder="Cascadia"
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Year</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.truckYear}
                      onChange={e => updateField("truckYear", e.target.value)}
                      placeholder="2020"
                    />
                    {formErrors.truckYear && <p className={styles.fieldError}>{formErrors.truckYear}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>License Plate</label>
                    <input
                      className={styles.input}
                      type="text"
                      maxLength={8}
                      value={formData.licensePlate}
                      onChange={e => updateField("licensePlate", e.target.value)}
                      placeholder="ABC1234"
                    />
                    {formErrors.licensePlate && <p className={styles.fieldError}>{formErrors.licensePlate}</p>}
                  </div>
                </div>
              </>
            )}

            {formData.isCompanyTruck && (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Truck information will be provided by the company.
              </p>
            )}
          </div>
        </Card>

        <div className={styles.appActions}>
          <Button onClick={() => navigate("/driver/points")}>
            Cancel
          </Button>
          <Button color="primary" onClick={submitApplication} disabled={isLoading}>
            {isLoading ? "Submitting…" : "Submit Application"}
          </Button>
        </div>
      </CardHost>
    </main>
  );
}