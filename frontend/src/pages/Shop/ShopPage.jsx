import { useMemo } from "react";
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import { useCatalog } from "@/api/catalog";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ShopItem from "@/components/ShopItem/ShopItem";
import styles from "./ShopPage.module.scss";

export default function ShopPage()
{
    const { selectedOrgId, driverOrgs } = useOrgContext();
    var org = driverOrgs && selectedOrgId ? driverOrgs[selectedOrgId] : null;

    const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useCatalog(selectedOrgId);

    console.log(catalog);

    const availableItems = useMemo(
        () => catalog ? catalog.sort((a, b) => b.isAvailable - a.isAvailable)
            .filter((item) => item.isAvailable) : [],
        [catalog]);

    return (
        <CardHost>
            <Card title='Catalog'>
                {(!availableItems || availableItems.length < 1) &&
                    <p className={styles.noItems}>No items currently available</p>
                }
                <div className={styles.grid}>
                    {availableItems && availableItems.length > 0 &&
                        availableItems.map((item) => (
                            <ShopItem
                                key={item.id}
                                imageUrl={item.images[0]}
                                title={item.title}
                                category={item.categoryTitle}
                                price={item.price}
                                points={org ? item.price / org.pointRatio : undefined}
                            />
                        ))}
                </div>
            </Card>
        </CardHost>
    );
}