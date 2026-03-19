import { useProducts } from '@/api/store';
import { useCatalog } from '@/api/catalog';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import InlineInfo from '@/components/InlineInfo/InlineInfo';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import ShopItem from '@/components/ShopItem/ShopItem';
import EditIcon from '@/assets/icons/square-pen.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import AddIcon from '@/assets/icons/plus.svg?react';
import styles from './SponsorCatalogPage.module.scss';

export default function SponsorCatalogPage()
{
    const productLimit = 12;

    const { selectedOrgId } = useOrgContext();

    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts({ limit: productLimit, offset: 0 });
    const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useCatalog(selectedOrgId);

    return (
        <>
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
                            >
                                {!item.isAvailable && <InlineInfo className={styles.itemWarning} messages={['Unavailable']} type='warning' />}
                                <div className={styles.itemButtons}>
                                    <Button
                                        className={styles.catalogButton}
                                        icon={TrashIcon}
                                        size='small'
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
                <Card title='Add Items'>
                    <div className={styles.grid}>
                        {products &&
                            products.map((item) => (
                                <ShopItem
                                    key={item.id}
                                    imageUrl={item.images[0]}
                                    title={item.title}
                                    category={item.category.name}
                                    price={item.price}
                                    available={true}
                                >
                                    <div className={styles.itemButtons}>
                                        <Button
                                            icon={AddIcon}
                                            color='primary'
                                            size='small'
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