import { useToast } from "@/components/Toast/ToastContext";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/api/apiFetch";
import { useSponsorOrg } from "@/api/sponsorOrg";
import { CopyIcon } from "lucide-react";
import CardHost from "@/components/CardHost/CardHost";
import ApplicationItem from "./components/ApplicationItem";
import RejectApplicationModal from "@/components/RejectApplicationModal/RejectApplicationModal";
import Card from "@/components/Card/Card";
import TextInput from "@/components/TextInput/TextInput";
import Button from "@/components/Button/Button";
import styles from "./SponsorDriverApplicationsPage.module.scss";

const MODALS = {
  rejectApplication: "rejectApplication"
}

async function fetchApplications()
{
  const response = await apiFetch("/applications");
  if (!response.ok) throw new Error("Failed to load applications");
  return response.json();
}

async function acceptApplication(id)
{
  const res = await apiFetch(`/applications/${id}/accept`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to accept application');
}

async function rejectApplication({ id, reason })
{
  const res = await apiFetch(`/applications/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject application');
}

export default function SponsorDriverApplicationsPage()
{
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");
  const { data: org } = useSponsorOrg();
  const [copied, setCopied] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");

  const [currentModal, setCurrentModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAppId, setSelectedAppId] = useState(null);

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
    onMutate: async applicationId =>
    {
      setActionError("");
      await queryClient.cancelQueries({ queryKey: ["sponsor-applications"] });
      const previousApplications = queryClient.getQueryData(["sponsor-applications"]);
      queryClient.setQueryData(["sponsor-applications"], old =>
        (old ?? []).filter(app => app.id !== applicationId)
      );
      return { previousApplications };
    },
    onError: (_error, _applicationId, context) =>
    {
      if (context?.previousApplications)
      {
        queryClient.setQueryData(["sponsor-applications"], context.previousApplications);
      }
      push({ type: 'error', message: 'Failed to accept application.' });
    },
    onSettled: () =>
    {
      queryClient.invalidateQueries({ queryKey: ["sponsor-applications"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectApplication,
    onMutate: async ({ applicationId }) =>
    {
      setActionError("");
      await queryClient.cancelQueries({ queryKey: ["sponsor-applications"] });
      const previousApplications = queryClient.getQueryData(["sponsor-applications"]);
      queryClient.setQueryData(["sponsor-applications"], old =>
        (old ?? []).filter(app => app.id !== applicationId)
      );
      return { previousApplications };
    },
    onError: (_error, _vars, context) =>
    {
      if (context?.previousApplications)
      {
        queryClient.setQueryData(["sponsor-applications"], context.previousApplications);
      }
      push({ type: 'error', message: 'Failed to reject application.' });
    },
    onSettled: () =>
    {
      queryClient.invalidateQueries({ queryKey: ["sponsor-applications"] });
      queryClient.invalidateQueries({ queryKey: ['sponsorOrgDrivers'] });
    }
  });

  const sortedApplications = useMemo(() =>
  {
    return [...applications].sort((a, b) => b.id - a.id);
  }, [applications]);

  function onAccept(id)
  {
    if (acceptMutation.isPending || rejectMutation.isPending) return;
    acceptMutation.mutate(id);
  }

  function onReject()
  {
    if (acceptMutation.isPending || rejectMutation.isPending) return;
    rejectMutation.mutate({ id: selectedAppId, reason: rejectReason });
    setCurrentModal(null);
  }

  function handleItemReject(applicationId)
  {
    setSelectedAppId(applicationId);
    setCurrentModal(MODALS.rejectApplication)
  }

  return (
    <>
      <RejectApplicationModal
        isOpen={currentModal == MODALS.rejectApplication}
        onClose={() => setCurrentModal(null)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onReject={onReject}
        isRejectDisabled={rejectMutation.isPending || acceptMutation.isPending || !rejectReason}
      />
      <CardHost>
        <Card className={styles.invite}>
          {org?.id && (
            <div>
              <label>Driver Invite Link</label>
              <div className={styles.inviteLinkRow}>
                <TextInput
                  className={styles.inviteLink}
                  type="text"
                  readOnly
                  disabled
                  value={`${window.location.origin}/apply?orgId=${org.id}`}
                />
                <Button
                  className={styles.copyButton}
                  icon={CopyIcon}
                  onClick={() =>
                  {
                    navigator.clipboard.writeText(`${window.location.origin}/apply?orgId=${org.id}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} />
                <span className={styles.copyLabel}>{copied ? "Copied!" : "Copy"}</span>
              </div>
              {/* <div className="invite-block">
                <p className="invite-label">Send Link via Email</p>
                <p className="invite-hint">Enter one or more email addresses, comma separated for bulk</p>
                <textarea
                  className="invite-emails"
                  placeholder="driver@example.com, another@example.com"
                  value={inviteEmails}
                  onChange={e => setInviteEmails(e.target.value)}
                  rows={3}
                />
                <button className="copy-btn" onClick={() =>
                {
                  const link = `${window.location.origin}/apply?orgId=${org.id}`;
                  window.open(`mailto:${inviteEmails}?subject=${encodeURIComponent("Driver Application Invitation")}&body=${encodeURIComponent("You've been invited to apply. Use this link: " + link)}`);
                }}>
                  Send Invite
                </button>
              </div> */}
            </div>
          )}
        </Card>
        <Card title='Applications' className={styles.applications}>
          <div>
            {actionError && <p className={styles.errorMessage}>{actionError}</p>}

            {sortedApplications.length === 0 ? (
              <p>No applications found.</p>
            ) : (
              <div className={styles.applicationsList}>
                {sortedApplications.map(application =>
                  <ApplicationItem
                    key={application.id}
                    application={application}
                    acceptMutation={acceptMutation}
                    rejectMutation={rejectMutation}
                    onAccept={() => onAccept(application.id)}
                    onReject={() => handleItemReject(application.id)}
                    isRejectDisabled={rejectMutation.isPending || acceptMutation.isPending}
                    isAcceptDisabled={rejectMutation.isPending || acceptMutation.isPending}
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      </CardHost>
    </>
  );
}