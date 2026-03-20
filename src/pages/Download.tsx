import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Download() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/downloads');
  }, [navigate]);

  return null;
}
