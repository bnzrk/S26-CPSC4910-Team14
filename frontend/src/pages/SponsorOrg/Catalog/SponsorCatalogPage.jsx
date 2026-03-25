import { useState, useMemo } from 'react';
import { useProducts } from '@/api/store';
import { useCatalog } from '@/api/catalog';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { useRemoveCatalogItem } from '@/api/catalog';
import { useToast } from '@/components/Toast/ToastContext';
import { useDebounce } from '@/helpers/debounce';
import Modal from '@/components/Modal/Modal';
import AddCatalogItemModal from './components/AddCatalogItemModal';
import SearchInput from '@/components/SearchInput/SearchInput';
import InlineInfo from '@/components/InlineInfo/InlineInfo';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import ShopItem from '@/components/ShopItem/ShopItem';
import EditIcon from '@/assets/icons/square-pen.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import AddIcon from '@/assets/icons/plus.svg?react';
import styles from './SponsorCatalogPage.module.scss';

export default function SponsorCatalogPage()
{
    const productLimit = 12;
    const searchDebounceMs = 200;

    const { selectedOrgId } = useOrgContext();
    const { push } = useToast();

    const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useCatalog(selectedOrgId);
    const { data: org, isLoading: isOrgLoading, isError: isOrgError } = useSponsorOrg();

    const removeCatalogItemMutation = useRemoveCatalogItem(selectedOrgId);

    const modals = {
        addItem: 'addItem',
        removeItem: 'removeItem',
        editItem: 'editItem',
    }
    const [currentModal, setCurrentModal] = useState(null);

    const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(null);
    const [selectedExternalItemId, setSelectedExternalItemId] = useState(null);

    const [storeSearchString, setStoreSearchString] = useState(null);

    // Store search results
    const debouncedSearch = useDebounce(storeSearchString, searchDebounceMs);
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts({ filters: { title: debouncedSearch }, limit: productLimit, offset: 0 });

    const productInCatalog = useMemo(() =>
    {
        if (!products || !catalog) return {};

        return products.reduce((acc, item) =>
        {
            acc[item.id] = !catalog.some(
                (catalogItem) => catalogItem.externalId == item.id
            );
            return acc;
        }, {});
    }, [products, catalog]);

    function handleItemAddClick(id)
    {
        setSelectedExternalItemId(id);
        setCurrentModal(modals.addItem);
    }

    function handleItemRemoveClick(id)
    {
        setSelectedCatalogItemId(id);
        setCurrentModal(modals.removeItem);
    }

    async function handleRemoveCatalogItem()
    {
        var id = selectedCatalogItemId;

        try
        {
            await removeCatalogItemMutation.mutateAsync({ id: id });
            push({ type: 'success', message: 'Item removed.' });
            setCurrentModal(null);
        }
        catch (err)
        {
            push({ type: 'error', message: 'Failed to remove item.' });
        }
    }

    return (
        <>
            <Modal isOpen={currentModal == modals.removeItem} onClose={() => setCurrentModal(null)}>
                <Modal.Header title='Remove Catalog Item' />
                <Modal.Body>
                    Remove this item from the catalog?
                </Modal.Body>
                <Modal.Buttons position='right'>
                    <Button className={styles.button} text='Cancel' onClick={() => setCurrentModal(null)} />
                    <AsyncButton className={styles.button} text='Remove' color='warn' action={handleRemoveCatalogItem} />
                </Modal.Buttons>
            </Modal>
            <AddCatalogItemModal
                isOpen={currentModal == modals.addItem}
                onClose={() => setCurrentModal(null)}
                item={products ? products.find((p) => p.id == selectedExternalItemId) : null}
            />
            <CardHost title='Catalog' subtitle="Manage your orgnization's product catalog.">
                <Card title='Catalog'>
                    <div className={styles.grid}>
                        {catalog && catalog.sort((a, b) => b.isAvailable - a.isAvailable).map((item) => (
                            <ShopItem
                                key={item.id}
                                imageUrl={item.images[0]}
                                title={item.title}
                                category={item.categoryTitle}
                                price={item.price}
                                available={item.isAvailable}
                                points={org ? item.price / org.pointRatio : undefined}
                            >
                                {!item.isAvailable && <InlineInfo className={styles.itemWarning} messages={['Unavailable']} type='warning' />}
                                <div className={styles.itemButtons}>
                                    <Button
                                        className={styles.catalogButton}
                                        icon={TrashIcon}
                                        size='small'
                                        onClick={() => handleItemRemoveClick(item.id)}
                                    />
                                    <Button
                                        className={styles.catalogButton}
                                        icon={EditIcon}
                                        size='small'
                                    />
                                </div>
                            </ShopItem>
                        ))}
                    </div>
                </Card>
                <Card title='Available Products'>
                    <SearchInput
                        className={styles.productSearch}
                        onChange={(e) => setStoreSearchString(e.target.value)}
                        placeholder='Search products...'
                    />
                    <div className={styles.grid}>
                        {(!products || products.length < 1) &&
                            <p>No results</p>
                        }
                        {products &&
                            products.map((item) => (
                                <ShopItem
                                    key={item.id}
                                    imageUrl={item.images[0]}
                                    title={item.title}
                                    category={item.category.name}
                                    price={item.price}
                                    available={productInCatalog[item.id]}
                                >
                                    {!productInCatalog[item.id] && <InlineInfo className={styles.itemWarning} messages={['In Catalog']} />}
                                    <div className={styles.itemButtons}>
                                        <Button
                                            icon={AddIcon}
                                            color='primary'
                                            size='small'
                                            disabled={!productInCatalog[item.id]}
                                            onClick={() => handleItemAddClick(item.id)}
                                        />
                                    </div>
                                </ShopItem>
                            ))
                        }
                    </div>
                </Card>
            </CardHost>
        </>
    );
}