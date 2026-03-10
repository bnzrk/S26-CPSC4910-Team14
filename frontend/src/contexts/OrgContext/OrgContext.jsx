import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { USER_TYPES } from '@/constants/userTypes';

const OrgContext = createContext(null);

export function OrgProvider ({ user, orgs, children }) {
  const isDriver = user?.userType === USER_TYPES.DRIVER;
  const isSponsor = user?.userType === USER_TYPES.SPONSOR;
  const isAdmin = user?.userType === USER_TYPES.ADMIN;

  const driverOrgs = (isDriver) ? (orgs || []) : null; // drivers
  const sponsorOrg = (isSponsor) ? (orgs[0] || null) : null; // sponsors

  const sponsorOrgId = sponsorOrg?.id;
  const [driverSelectedOrgId, setDriverSelectedOrgId] = useState(null);

  // Set the selected driver org from local storage or passed orgs if none saved
  useEffect(() => {
    if (!isDriver) return;

    const saved = localStorage.getItem("selectedDriverOrgId");
    const validSaved = driverOrgs.some((org) => org.id === saved);

    if (validSaved) {
      setDriverSelectedOrgId(saved);
    } else if (driverOrgs.length > 0) {
      setDriverSelectedOrgId(driverOrgs[0].id);
    } else {
      setDriverSelectedOrgId(null);
    }
  }, [isDriver, driverOrgs]);

  // Set the selected driver org
  const setSelectedOrgId = (orgId) => {
    if (!isDriver) return;
    setDriverSelectedOrgId(orgId);
    localStorage.setItem("selectedDriverOrgId", orgId);
  };

  // Stores and updates selected org
  const selectedOrgId = useMemo(() => {
    if (isAdmin) return null;
    if (isSponsor) return sponsorOrgId;
    if (isDriver) return driverSelectedOrgId;
    return null;
  }, [isAdmin, isSponsor, isDriver, sponsorOrgId, driverSelectedOrgId]);

  const value = {
    canSelectOrg: isDriver,
    selectedOrgId,
    setSelectedOrgId,
    driverOrgs,
    sponsorOrg,
  };

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrgContext() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrgContext must be used within OrgProvider");
  }
  return context;
}