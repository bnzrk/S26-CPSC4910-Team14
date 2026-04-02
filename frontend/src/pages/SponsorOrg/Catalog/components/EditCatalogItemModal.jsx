import { useState, useEffect } from 'react';
import { normalizedDecimalString } from '@/helpers/formatting';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { useUpdateCatalogItem } from '@/api/catalog';
import { useToast } from '@/components/Toast/ToastContext';
import Modal from '@/components/Modal/Modal';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import Button from '@/components/Button/Button';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import UsdInput from '@/components/UsdInput/UsdInput';
import ProductImage from '@/components/ProductImage/ProductImage';
import styles from './EditCatalogItemModal.module.scss';

export default function EditCatalogItemModal({ item, onClose, isOpen })
{
    const numberToDecimalString = (number) => new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);

    const { push } = useToast();
    const [price, setPrice] = useState(item ? numberToDecimalString(item.price) : '');
    const { data: org, isLoading: isOrgLoading, isError: isOrgError } = useSponsorOrg();

    const updateCatalogItemMutation = useUpdateCatalogItem(org ? org.id : null);

    const [isPriceValid, setIsPriceValid] = useState(false);

    useEffect(() =>
    {
        if (!isOpen)
        {
            setPrice(null);
        }
        if (isOpen && item)
        {
            setPrice(numberToDecimalString(item.price));
        }
    }, [isOpen, item]);

    const priceToPoints = (decimalString) =>
    {
        var decimalNum = Number(decimalString);
        var ratio = org.pointRatio;
        var points = ratio ? decimalNum / ratio : 0;
        return points;
    }

    const handleClose = () =>
    {
        setPrice(null);
        onClose();
    }

    async function handleUpdateCatalogItem()
    {
        try
        {
            await updateCatalogItemMutation.mutateAsync({ id: item.id, price: Number(price) });
            push({ type: 'success', message: 'Item successfully updated.' });
            onClose();
        }
        catch (err)
        {
            push({ type: 'error', message: 'Failed to update item.' });
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Header title='Add Catalog Item' />
            <Modal.Body>
                <div className={styles.item}>
                    <div className={styles.thumbnail}>
                        {item && <ProductImage src={item.images[0]} alt={item.title} />}
                    </div>
                    {item &&
                        <div className={styles.details}>
                            <ProductDetails 
                                item={item}
                                categoryTitle={item.categoryTitle}
                                price={isPriceValid ? price : 0}
                                points={isPriceValid ? priceToPoints(normalizedDecimalString(price)) : 0}
                            />
                            <UsdInput
                                className={styles.priceInput}
                                value={price}
                                label='Catalog Price'
                                onChange={(e) => setPrice(e.target.value)}
                                onValidChange={(v) => setIsPriceValid(v)}
                            />
                        </div>
                    }
                </div>
            </Modal.Body>
            <Modal.Buttons position='right'>
                <Button className={styles.button} text='Cancel' onClick={handleClose} />
                <AsyncButton
                    className={styles.button}
                    text='Update'
                    color='primary'
                    action={handleUpdateCatalogItem}
                    disabled={!isPriceValid}
                />
            </Modal.Buttons>
        </Modal>
    )
}