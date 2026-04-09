import CardHost from "@/components/CardHost/CardHost";
import BulkActionsForm from "@/components/BulkActionsForm/BulkActionsForm";

const TEMPLATE_ROWS = [
    "S||First Name|Last Name|email@mail.com", 
    "D||First Name|Last Name|email@mail.com",
    "D||First Name|Last Name|email@mail.com|100|New Driver"
]

export default function SponsorBulkActionsPage()
{
    return (
        <CardHost>
            <BulkActionsForm 
                templateRows={TEMPLATE_ROWS}
            />
        </CardHost>
    );
}