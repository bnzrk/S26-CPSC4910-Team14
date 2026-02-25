import { useState } from 'react';
import { API_URL } from '../../config';
import { queryClient } from '../../api/queryClient';
import { useNavigate } from "react-router-dom";
import { usePoints } from "../../api/points";
import styles from './PointsPage.module.scss';

export default function PointsPage()
{
  const navigate = useNavigate();
  const { data: points, isLoading: pointsLoading } = usePoints();

  const showPoints = !pointsLoading && points;

  return (
    <div>
      {showPoints && (
        <span style={{ padding: '1rem', textAlign: 'right' }}>{points}</span>
      )}
    </div>
  );
}