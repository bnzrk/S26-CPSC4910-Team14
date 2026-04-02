import { useBulkUpdateDriverInfo } from '@/api/sponsorOrg';
import BulkUploadModal from '@/components/BulkUploadModal/BulkUploadModal';

const TEMPLATE_COLS = ['driverId', 'email', 'firstName', 'lastName'];

/**
 * Modal for sponsors to bulk-update driver profile information via CSV.
 * CSV columns:
 *   driverId  — required, the driver's system ID
 *   email     — optional, new email address
 *   firstName — optional, new first name
 *   lastName  — optional, new last name
 *
 * Only provide columns you want to update; empty cells are ignored.
 */
export default function BulkUpdateDriversModal({ isOpen, onClose, onSuccess })
{
    const mutation = useBulkUpdateDriverInfo();

    return (
        <BulkUploadModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Bulk Update Driver Information"
            description={
                'Upload a CSV to update profile information for multiple drivers at once. ' +
                'Required column: driverId. Optional: email, firstName, lastName. ' +
                'Empty cells are skipped — only filled columns are updated.'
            }
            templateCols={TEMPLATE_COLS}
            templateName="bulk_update_drivers_template.csv"
            mutation={mutation}
        />
    );
}