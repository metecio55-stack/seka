import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  SOL: 'solana',
  DOGE: 'dogecoin',
  DOT: 'polkadot',
  LTC: 'litecoin',
  TRX: 'tron',
  SHIB: 'shiba-inu',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
};

export function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchPrices = useCallback(async () => {
    try {
      const ids = Object.values(CRYPTO_IDS).join(',');
      const response = await axios.get(
        `${COINGECKO_API}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            ids: ids,
            order: 'market_cap_desc',
            sparkline: false,
            price_change_percentage: '24h',
          },
          timeout: 10000,
        }
      );

      const formattedPrices: CryptoPrice[] = response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        volume24h: coin.total_volume,
        marketCap: coin.market_cap,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
      }));

      setPrices(formattedPrices);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError('Failed to fetch prices');
      // Use fallback data if API fails
      setPrices(getFallbackPrices());
    } finally {
      setLoading(false);
    }
  }, []);

  const getFallbackPrices = (): CryptoPrice[] => [
    { symbol: 'BTC', name: 'Bitcoin', price: 66942.30, change24h: 0.27, volume24h: 35000000000, marketCap: 1300000000000, high24h: 68000, low24h: 65500 },
    { symbol: 'ETH', name: 'Ethereum', price: 2048.84, change24h: -0.35, volume24h: 15000000000, marketCap: 250000000000, high24h: 2100, low24h: 2000 },
    { symbol: 'BNB', name: 'BNB', price: 589.60, change24h: 0.88, volume24h: 2000000000, marketCap: 90000000000, high24h: 600, low24h: 570 },
    { symbol: 'XRP', name: 'Ripple', price: 1.31, change24h: -0.39, volume24h: 1500000000, marketCap: 70000000000, high24h: 1.35, low24h: 1.28 },
    { symbol: 'ADA', name: 'Cardano', price: 0.24, change24h: -0.41, volume24h: 500000000, marketCap: 10000000000, high24h: 0.25, low24h: 0.23 },
    { symbol: 'SOL', name: 'Solana', price: 80.18, change24h: 0.41, volume24h: 3000000000, marketCap: 35000000000, high24h: 82, low24h: 78 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.09, change24h: -0.46, volume24h: 800000000, marketCap: 13000000000, high24h: 0.095, low24h: 0.088 },
    { symbol: 'DOT', name: 'Polkadot', price: 4.24, change24h: -0.64, volume24h: 200000000, marketCap: 6000000000, high24h: 4.35, low24h: 4.15 },
    { symbol: 'LTC', name: 'Litecoin', price: 53.16, change24h: 0.61, volume24h: 300000000, marketCap: 4000000000, high24h: 54, low24h: 52 },
    { symbol: 'TRX', name: 'TRON', price: 0.32, change24h: 1.35, volume24h: 400000000, marketCap: 28000000000, high24h: 0.325, low24h: 0.315 },
    { symbol: 'SHIB', name: 'Shiba Inu', price: 0.00000588, change24h: -2.16, volume24h: 200000000, marketCap: 3500000000, high24h: 0.0000061, low24h: 0.0000057 },
    { symbol: 'AVAX', name: 'Avalanche', price: 28.86, change24h: -0.69, volume24h: 350000000, marketCap: 11000000000, high24h: 29.5, low24h: 28.2 },
  ];

  useEffect(() => {
    fetchPrices();
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getPrice = useCallback((symbol: string): CryptoPrice | undefined => {
    return prices.find(p => p.symbol === symbol.toUpperCase());
  }, [prices]);

  const formatPrice = useCallback((price: number): string => {
    if (price < 0.01) return price.toExponential(4);
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const formatVolume = useCallback((volume: number): string => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  }, []);

  return {
    prices,
    loading,
    error,
    lastUpdate,
    getPrice,
    formatPrice,
    formatVolume,
    refresh: fetchPrices,
  };
}
