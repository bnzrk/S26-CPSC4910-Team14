import { useMemo, useState } from "react";
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import { usePoints } from "@/api/points";
import { useCatalog } from "@/api/catalog";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ShopItem from "@/components/ShopItem/ShopItem";
import Modal from "@/components/Modal/Modal";
import ProductDetails from "@/components/ProductDetails/ProductDetails";
import ProductImage from "@/components/ProductImage/ProductImage";
import InlineInfo from "@/components/InlineInfo/InlineInfo";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import StarIcon from "@/assets/icons/star.svg?react";
import CartIcon from "@/assets/icons/shopping-cart.svg?react";
import HandbagIcon from "@/assets/icons/handbag.svg?react";
import styles from "./ShopPage.module.scss";

const MODALS = {
    purchase: "purchase"
}

export default function ShopPage()
{
    const { selectedOrgId, driverOrgs } = useOrgContext();
    var org = driverOrgs && selectedOrgId ? driverOrgs[selectedOrgId] : null;
    var { data: points } = usePoints(selectedOrgId);

    const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useCatalog(selectedOrgId);

    const availableItems = useMemo(
        () => catalog ? catalog.filter((item) => item.isAvailable) : [],
        [catalog]);

    const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(null);
    const [currentModal, setCurrentModal] = useState(null);

    const selectedItem = useMemo(
        () => availableItems ? availableItems.find((item) => item.id == selectedCatalogItemId) : null,
        [availableItems, selectedCatalogItemId]);

    const selectedItemPoints = useMemo(
        () => org && selectedItem ? selectedItem.price / org.pointRatio : undefined,
        [selectedItem, org]);

    const remainingBalance = useMemo(
        () => selectedItemPoints && points ? points.balance - selectedItemPoints : null
        , [points, selectedItemPoints]);

    console.log(remainingBalance);

    const handleClickItem = (itemId) =>
    {
        console.log(`Setting item id to ${itemId}`);
        setSelectedCatalogItemId(itemId)
        setCurrentModal(MODALS.purchase);
    }

    async function handlePurchase()
    {
        await new Promise((resolve, reject) =>
        {
            setTimeout(() => reject(), 1000)
        });
    }

    return (
        <>
            <Modal isOpen={currentModal == MODALS.purchase} onClose={() => setCurrentModal(null)}>
                <Modal.Header title='Purchase Item' />
                <Modal.Body>
                    {selectedItem &&
                        <div className={styles.modalBody}>
                            <div className={styles.modalItem}>
                                <div className={styles.thumbnail}>
                                    <ProductImage src={selectedItem.images[0] ?? null} alt={selectedItem.title} />
                                </div>
                                <ProductDetails
                                    item={selectedItem}
                                    categoryTitle={selectedItem ? selectedItem.categoryTitle : ""}
                                    showDescription={true}
                                    showPrice={false}
                                    showRetail={false}
                                    points={org && selectedItem ? selectedItem.price / org.pointRatio : undefined}
                                />
                            </div>
                            {points && remainingBalance >= 0 &&
                                <div className={styles.pointCalculation}>
                                    <table className={styles.balance}>
                                        <tbody>
                                            <tr className={styles.subtracted}>
                                                <td className={styles.label}>Total:</td>
                                                <td className={styles.value}>-{selectedItemPoints} <StarIcon /></td>
                                            </tr>
                                            <tr className={styles.remaining}>
                                                <td className={styles.label}>Remaining Balance:</td>
                                                <td className={styles.value}>{remainingBalance} <StarIcon /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            }
                            {points && remainingBalance < 0 &&
                                <InlineInfo type='warning' messages={["You do not have enough points to purchase this item."]} />
                            }
                        </div>
                    }
                </Modal.Body>
                <Modal.Buttons position='right'>
                    <Button text='Cancel' color='secondary' onClick={() => setCurrentModal(null)} />
                    <AsyncButton text='Purchase' icon={HandbagIcon} color='primary' action={handlePurchase} disabled={remainingBalance < 0} />
                </Modal.Buttons>
            </Modal>

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
                                    onClick={() => handleClickItem(item.id)}
                                />
                            ))}
                    </div>
                </Card>
            </CardHost>
        </>
    );
}