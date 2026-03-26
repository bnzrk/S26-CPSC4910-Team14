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

    return (
        <CardHost title='Shop' subtitle="Spend points on your organization's catalog">
            <Card title='Catalog'>
                <div className={styles.grid}>
                    {catalog && catalog.length > 0 && catalog.sort((a, b) => b.isAvailable - a.isAvailable)
                        .filter((item) => item.isAvailable)
                        .map((item) => (
                            <ShopItem
                                key={item.id}
                                imageUrl={item.images[0]}
                                title={item.title}
                                category={item.categoryTitle}
                                price={item.price}
                                points={org ? item.price / org.pointRatio : undefined}
                            />
                        ))}
                    {(!catalog || catalog.length < 1) &&
                        <p>No items available</p>
                    }
                </div>
            </Card>
        </CardHost>
    );
}