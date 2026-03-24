import { useState, useEffect } from 'react';
import { formatUsd, normalizedDecimalString } from '@/helpers/formatting';
import { validDecimalString } from '@/helpers/formatting';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { useAddCatalogItem } from '@/api/catalog';
import { useToast } from '@/components/Toast/ToastContext';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import ImageErrorIcon from '@/assets/icons/image-off.svg?react';
import StarIcon from '@/assets/icons/star.svg?react';
import styles from './AddCatalogItemModal.module.scss';
import clsx from 'clsx';

export default function AddCatalogItemModal({ item, showPlaceholder, onClose, isOpen })
{
    const numberToDecimalString = (number) => new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);

    const { push } = useToast();
    const [price, setPrice] = useState(item ? numberToDecimalString(item.price) : '');
    const { data: org, isLoading: isOrgLoading, isError: isOrgError } = useSponsorOrg();

    const addCatalogItemMutation = useAddCatalogItem(org ? org.id : null);

    useEffect(() =>
    {
        if (item)
        {
            setPrice(numberToDecimalString(item.price));
        }
    }, [item]);

    const priceToPoints = (decimalString) =>
    {
        var decimalNum = Number(decimalString);
        var ratio = org.pointRatio;
        var points = ratio ? decimalNum / ratio : 0;
        return points;
    }

    const handleClose = () =>
    {
        setPrice('');
        onClose();
    }

    async function handleAddCatalogItem()
    {
        try
        {
            await addCatalogItemMutation.mutateAsync({ externalItemId: item.id, catalogPrice: Number(price) });
            push({ type: 'success', message: 'Item added to catalog.' });
            onClose();
        }
        catch (err)
        {
            push({ type: 'error', message: 'Failed to add catalog item.' });
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Header title='Add Catalog Item' />
            <Modal.Body>
                <div className={styles.item}>
                    <div className={styles.thumbnail}>
                        {(!showPlaceholder && item) &&
                            <img
                                src={item.images[0]}
                                alt={item.title}
                            />
                        }
                        {(showPlaceholder) &&
                            <div className={styles.placeholder}>
                                <ImageErrorIcon />
                            </div>
                        }
                    </div>
                    {item &&
                        <div className={styles.details}>
                            <div className={styles.header}>
                                <div className={styles.title}>{item.title}</div>
                                <div className={styles.subtitle}>{item.category.name}</div>
                            </div>
                            <div className={styles.prices}>
                                <div className={clsx(styles.retail, styles.price)}>
                                    <div>Retail Price</div>
                                    <div>{formatUsd(item.price)}</div>
                                </div>
                                <div className={clsx(styles.catalog, styles.price)}>
                                    <div>Catalog Price</div>
                                    <div className={styles.row}>
                                        <div>{validDecimalString(price) ? formatUsd(price) : formatUsd(0)}</div>
                                        <div className={styles.points}>
                                            <StarIcon />
                                            {validDecimalString(price) ? priceToPoints(normalizedDecimalString(price)) : 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <label>Catalog Price:</label>
                            <input value={price} type='text' onChange={(e) => setPrice(e.target.value)} />
                        </div>
                    }
                </div>
            </Modal.Body>
            <Modal.Buttons position='right'>
                <Button className={styles.button} text='Cancel' onClick={handleClose} />
                <AsyncButton
                    className={styles.button}
                    text='Add to Catalog'
                    color='primary'
                    action={handleAddCatalogItem}
                    disabled={!validDecimalString(price)}
                />
            </Modal.Buttons>
        </Modal>
    )
}