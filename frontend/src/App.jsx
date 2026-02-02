import { API_URL } from './config';
import { useQuery } from '@tanstack/react-query';
import './App.scss'

async function getHello()
{
  const result = await fetch(`${API_URL}/hello`);
  if (!result.ok)
  {
    throw new Error(`HTTP ${result.status}`);
  }
  return result.text();
}

export default function App()
{
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["hello"],
    queryFn: getHello,
    retry: 0
  })

  return (
    <div>
      <h1>API Test</h1>
      <small>Response from backend:</small>
      {!isError && !isLoading && <p>{data}</p>}
      {isError && <p>{error.message}</p>}
    </div>
  )
}
