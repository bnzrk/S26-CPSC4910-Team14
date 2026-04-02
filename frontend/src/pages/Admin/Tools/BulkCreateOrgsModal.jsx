import { useBulkCreateSponsorOrgs } from '@/api/admin';
import BulkUploadModal from '@/components/BulkUploadModal/BulkUploadModal';

const TEMPLATE_COLS = ['sponsorName', 'pointDollarValue'];

export default function BulkCreateOrgsModal({ isOpen, onClose, onSuccess })
{
    const mutation = useBulkCreateSponsorOrgs();

    return (
        <BulkUploadModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Bulk Create Sponsor Organizations"
            description={
                'Upload a CSV to create multiple sponsor organizations at once. ' +
                'Required column: sponsorName. Optional: pointDollarValue (default 0.01).'
            }
            templateCols={TEMPLATE_COLS}
            templateName="bulk_create_orgs_template.csv"
            mutation={mutation}
        />
    );
}