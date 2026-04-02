import { useBulkCreateDriverUsers } from '@/api/sponsorOrg';
import BulkUploadModal from '@/components/BulkUploadModal/BulkUploadModal';

const TEMPLATE_COLS = ['email', 'firstName', 'lastName', 'password'];

/**
 * Modal for sponsors to bulk-create driver user accounts via CSV.
 * CSV columns: email, firstName, lastName, password
 */
export default function BulkCreateDriversModal({ isOpen, onClose, onSuccess })
{
    const mutation = useBulkCreateDriverUsers();

    return (
        <BulkUploadModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Bulk Create Driver Users"
            description={
                'Upload a CSV to create multiple driver accounts and link them to your organization. ' +
                'Required columns: email, firstName, lastName, password.'
            }
            templateCols={TEMPLATE_COLS}
            templateName="bulk_create_drivers_template.csv"
            mutation={mutation}
        />
    );
}