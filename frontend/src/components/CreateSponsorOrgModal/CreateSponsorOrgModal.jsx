import { useState } from 'react';
import { useToast } from '@/components/Toast/ToastContext';
import { useCreateSponsorOrg } from '@/api/sponsorOrg';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import AsyncButton from '../AsyncButton/AsyncButton';
import TextInput from '../TextInput/TextInput';

export default function CreateSponsorOrgModal({ isOpen, onClose, onSuccess })
{
    const { push } = useToast();
    const createOrg = useCreateSponsorOrg();
    const [sponsorName, setSponsorName] = useState('');

    async function handleSubmit()
    {
        try
        {
            if (!sponsorName.trim()) return Promise.reject();
            
            await createOrg.mutateAsync({ sponsorName });
            push({ type: 'success', message: 'Sponsor organization created.' });
            onSuccess?.();
            onClose();
        }
        catch (err)
        {
            push({ type: 'error', message: err?.message ?? 'Failed to create organization.' });
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={() => { setSponsorName(''); onClose(); }} closeButton>
            <Modal.Header title="Create Sponsor Organization" />
            <Modal.Body>
                <TextInput
                    label="Organization Name"
                    required
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="Acme Freight"
                />
            </Modal.Body>
            <Modal.Buttons>
                <Button text="Cancel" color="secondary" onClick={() => { setSponsorName(''); onClose(); }} />
                <AsyncButton
                    text="Create"
                    color="primary"
                    disabled={!sponsorName.trim()}
                    action={handleSubmit}
                />
            </Modal.Buttons>
        </Modal>
    );
}