import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/api/apiFetch";
import "./SponsorDriverApplicationsPage.scss";

async function fetchApplications() {
  const response = await apiFetch("/applications");

  if (!response.ok) {
    throw new Error("Failed to load applications");
  }

  return response.json();
}

async function acceptApplication(applicationId) {
  const response = await apiFetch(`/applications/${applicationId}/accept`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to accept application");
  }
}

async function rejectApplication(applicationId) {
  const response = await apiFetch(`/applications/${applicationId}/reject`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to reject application");
  }
}

function formatStatus(status) {
  if (status === null || status === undefined) return "Unknown";

  if (typeof status === "string") {
    return status;
  }

  // fallback in case enum is serialized as number
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Accepted";
    case 2:
      return "Rejected";
    default:
      return "Unknown";
  }
}

function formatDate(value) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString();
}

function getDriverName(application) {
  const first = application.firstName?.trim() ?? "";
  const last = application.lastName?.trim() ?? "";
  const full = `${first} ${last}`.trim();

  return full || "Unnamed Driver";
}

export default function SponsorDriverApplicationsPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [actionError, setActionError] = useState("");

  const {
    data: applications = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["sponsor-applications"],
    queryFn: fetchApplications
  });

  const acceptMutation = useMutation({
    mutationFn: acceptApplication,
    onMutate: async applicationId => {
      setActionError("");

      await queryClient.cancelQueries({ queryKey: ["sponsor-applications"] });

      const previousApplications = queryClient.getQueryData(["sponsor-applications"]);

      queryClient.setQueryData(["sponsor-applications"], old =>
        (old ?? []).map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: typeof app.status === "string" ? "Accepted" : 1,
                isActive: false
              }
            : app
        )
      );

      return { previousApplications };
    },
    onError: (_error, _applicationId, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(["sponsor-applications"], context.previousApplications);
      }
      setActionError("Failed to accept application.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsor-applications"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectApplication,
    onMutate: async applicationId => {
      setActionError("");

      await queryClient.cancelQueries({ queryKey: ["sponsor-applications"] });

      const previousApplications = queryClient.getQueryData(["sponsor-applications"]);

      queryClient.setQueryData(["sponsor-applications"], old =>
        (old ?? []).map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: typeof app.status === "string" ? "Rejected" : 2,
                isActive: false
              }
            : app
        )
      );

      return { previousApplications };
    },
    onError: (_error, _applicationId, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(["sponsor-applications"], context.previousApplications);
      }
      setActionError("Failed to reject application.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsor-applications"] });
    }
  });

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => b.id - a.id);
  }, [applications]);

  function toggleExpanded(applicationId) {
    setExpandedId(current => (current === applicationId ? null : applicationId));
  }

  function handleAccept(e, applicationId) {
    e.stopPropagation();

    if (acceptMutation.isPending || rejectMutation.isPending) return;
    acceptMutation.mutate(applicationId);
  }

  function handleReject(e, applicationId) {
    e.stopPropagation();

    if (acceptMutation.isPending || rejectMutation.isPending) return;
    rejectMutation.mutate(applicationId);
  }

  if (isLoading) {
    return (
      <div className="application-page">
        <div className="application-card applications-card">
          <h1 className="title">Applications</h1>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="application-page">
        <div className="application-card applications-card">
          <h1 className="title">Applications</h1>
          <p className="error-message">{error?.message || "Failed to load applications."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="application-page">
      <div className="application-card applications-card">
        <h1 className="title">Applications</h1>

        {actionError && <p className="error-message">{actionError}</p>}

        {sortedApplications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div className="applications-list">
            {sortedApplications.map(application => {
              const isExpanded = expandedId === application.id;
              const statusLabel = formatStatus(application.status);
              const isResolved =
                statusLabel.toLowerCase() === "accepted" ||
                statusLabel.toLowerCase() === "rejected";

              const isMutatingCurrent =
                acceptMutation.isPending && acceptMutation.variables === application.id ||
                rejectMutation.isPending && rejectMutation.variables === application.id;

              return (
                <div
                  key={application.id}
                  className={`application-item ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    type="button"
                    className="application-summary"
                    onClick={() => toggleExpanded(application.id)}
                  >
                    <div className="summary-main">
                      <div className="summary-name">{getDriverName(application)}</div>
                      <div className="summary-date">
                        Submitted: {formatDate(application.createdAt || application.dateCreated)}
                      </div>
                    </div>

                    <div className="summary-side">
                      <span className={`status-badge status-${statusLabel.toLowerCase()}`}>
                        {statusLabel}
                      </span>

                      <div className="summary-actions">
                        <button
                          type="button"
                          className="action-btn accept-btn"
                          disabled={isResolved || isMutatingCurrent}
                          onClick={e => handleAccept(e, application.id)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="action-btn reject-btn"
                          disabled={isResolved || isMutatingCurrent}
                          onClick={e => handleReject(e, application.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="application-details">
                      <p className="section-title">Personal Information</p>

                      <div className="details-grid">
                        <div className="detail-block">
                          <span className="detail-label">First Name</span>
                          <span className="detail-value">{application.firstName || "-"}</span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">Last Name</span>
                          <span className="detail-value">{application.lastName || "-"}</span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">Phone Number</span>
                          <span className="detail-value">{application.phoneNumber || "-"}</span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">Birthday</span>
                          <span className="detail-value">{application.birthday || "-"}</span>
                        </div>
                      </div>

                      <p className="section-title">Employment</p>
                      <div className="details-grid">
                        <div className="detail-block">
                          <span className="detail-label">Previously Employed</span>
                          <span className="detail-value">
                            {application.previousEmployee === null ||
                            application.previousEmployee === undefined
                              ? "-"
                              : application.previousEmployee
                                ? "Yes"
                                : "No"}
                          </span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">Current Status</span>
                          <span className="detail-value">{statusLabel}</span>
                        </div>
                      </div>

                      <p className="section-title">Truck Information</p>
                      <div className="details-grid">
                        <div className="detail-block">
                          <span className="detail-label">Truck Make</span>
                          <span className="detail-value">{application.truckMake || "-"}</span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">Truck Model</span>
                          <span className="detail-value">{application.truckModel || "-"}</span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">Truck Year</span>
                          <span className="detail-value">{application.truckYear || "-"}</span>
                        </div>
                        <div className="detail-block">
                          <span className="detail-label">License Plate</span>
                          <span className="detail-value">{application.licensePlate || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}