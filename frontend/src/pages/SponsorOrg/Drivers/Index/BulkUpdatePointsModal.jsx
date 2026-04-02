import { useBulkUpdateDriverPoints } from '@/api/sponsorOrg';
import BulkUploadModal from '@/components/BulkUploadModal/BulkUploadModal';

const TEMPLATE_COLS = ['driverEmail', 'balanceChange', 'reason'];

/**
 * Modal for sponsors to bulk-update driver point balances via CSV.
 * CSV columns:
 *   driverEmail   — the driver's email address (used to identify the driver)
 *   balanceChange — positive integer to add points, negative to deduct
 *   reason        — required reason string for the transaction
 */
export default function BulkUpdatePointsModal({ isOpen, onClose, onSuccess })
{
    const mutation = useBulkUpdateDriverPoints();

    return (
        <BulkUploadModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Bulk Update Driver Points"
            description={
                'Upload a CSV to add or deduct points for multiple drivers at once. ' +
                'Required columns: driverEmail, balanceChange (positive to add, negative to deduct), reason.'
            }
            templateCols={TEMPLATE_COLS}
            templateName="bulk_update_points_template.csv"
            mutation={mutation}
        />
    );
}