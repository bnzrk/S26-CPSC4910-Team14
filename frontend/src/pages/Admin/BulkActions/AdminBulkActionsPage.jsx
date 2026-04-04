import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import BulkActionsForm from "@/components/BulkActionsForm/BulkActionsForm";
import styles from "./AdminBulkActionsPage.module.scss";

const TEMPLATE_ROWS = [
    "O|Organization Name", 
    "S|Organization Name|First Name|Last Name|email@mail.com", 
    "D|Organization Name|First Name|Last Name|email@mail.com",
    "D|Organization Name|First Name|Last Name|email@mail.com|100|New Driver"
]

export default function AdminBulkActionsPage()
{
    return (
        <CardHost>
            <BulkActionsForm 
                templateRows={TEMPLATE_ROWS}
            />
        </CardHost>
    );
}