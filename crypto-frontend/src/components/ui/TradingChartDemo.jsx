import React, { useState } from 'react';

import TradingChart from './TradingChart';
import Button from './Button';

/**
 * Demo component showcasing TradingChart usage
 * This can be used for testing or as a reference
 */
const TradingChartDemo = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [chartHeight, setChartHeight] = useState(500);

  const popularCoins = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'UNI', name: 'Uniswap' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          TradingView Chart Integration Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Live cryptocurrency charts powered by TradingView. Click on any coin to switch the chart.
        </p>
        
        {/* Coin Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Coin:</h3>
          <div className="flex flex-wrap gap-2">
            {popularCoins.map((coin) => (
              <Button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin.symbol)}
                variant={selectedCoin === coin.symbol ? 'primary' : 'secondary'}
                className="text-sm"
              >
                {coin.symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* Height Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Chart Height:</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setChartHeight(300)}
              variant={chartHeight === 300 ? 'primary' : 'secondary'}
            >
              Small (300px)
            </Button>
            <Button
              onClick={() => setChartHeight(500)}
              variant={chartHeight === 500 ? 'primary' : 'secondary'}
            >
              Medium (500px)
            </Button>
            <Button
              onClick={() => setChartHeight(700)}
              variant={chartHeight === 700 ? 'primary' : 'secondary'}
            >
              Large (700px)
            </Button>
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedCoin} Price Chart
          </h2>
          <p className="text-sm text-gray-600">
            Real-time data from TradingView • Updates automatically
          </p>
        </div>
        
        <TradingChart
          coinSymbol={selectedCoin}
          height={chartHeight}
          showLoading={true}
        />
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Usage Instructions:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Basic Usage:</strong> &lt;TradingChart coinSymbol="BTC" /&gt;</p>
          <p>• <strong>Custom Height:</strong> &lt;TradingChart coinSymbol="ETH" height={600} /&gt;</p>
          <p>• <strong>No Loading:</strong> &lt;TradingChart coinSymbol="SOL" showLoading={false} /&gt;</p>
          <p>• <strong>Custom Styling:</strong> &lt;TradingChart coinSymbol="ADA" className="my-custom-class" /&gt;</p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">✅ Responsive</h4>
          <p className="text-sm text-blue-600">
            Automatically adapts to mobile and desktop screens
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">✅ Live Data</h4>
          <p className="text-sm text-green-600">
            Real-time price charts from TradingView
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2">✅ Error Handling</h4>
          <p className="text-sm text-purple-600">
            Graceful fallbacks and loading states
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradingChartDemo; 