import React, { useEffect, useRef, memo } from 'react';
import { Activity } from 'lucide-react';

interface TradingViewWidgetProps { symbols: string[]; }

const TradingViewMarketOverview = memo(({ symbols }: TradingViewWidgetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scriptId = `tradingview-script-${Math.random()}`;
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        script.async = true;

        const widgetConfig = {
            "colorTheme": "light", "dateRange": "12M", "showChart": true, "locale": "es",
            "largeChartUrl": "", "isTransparent": true, "showSymbolLogo": true,
            "showFloatingTooltip": false, "width": "100%", "height": "450",
            "plotLineColorGrowing": "rgba(41, 98, 255, 1)", "plotLineColorFalling": "rgba(255, 74, 104, 1)",
            "gridLineColor": "rgba(240, 243, 250, 0)", "scaleFontColor": "rgba(120, 123, 134, 1)",
            "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)", "belowLineFillColorFalling": "rgba(255, 74, 104, 0.12)",
            "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
            "tabs": [{
                "title": "Acciones",
                "symbols": symbols.map(s => ({ "s": `NASDAQ:${s}`, "d": s })),
            }]
        };
        script.innerHTML = JSON.stringify(widgetConfig);
        
        container.innerHTML = '';
        container.appendChild(script);

    }, [symbols]);

    return <div ref={containerRef} className="tradingview-widget-container"></div>;
});

export const TradingViewWidget = ({ symbols }: TradingViewWidgetProps) => {
  if (!symbols || symbols.length === 0) return null;

  return (
    <div className="my-6 -mx-5">
      <div className="px-5 mb-4 flex items-center gap-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Análisis de Mercado en Tiempo Real</h3>
      </div>
      <TradingViewMarketOverview symbols={symbols} />
    </div>
  );
};

