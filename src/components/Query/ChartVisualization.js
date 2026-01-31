import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Info,
  Download,
  Maximize2,
} from "lucide-react";

/**
 * ChartVisualization Component
 * Renders different chart types based on the configuration from the backend
 * Uses SVG for rendering charts without external dependencies
 */
const ChartVisualization = ({ chartConfig, reasoning }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 40, 800);
        setDimensions({ width, height: Math.min(width * 0.6, 400) });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!chartConfig) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-700">No chart configuration available</p>
      </div>
    );
  }

  const { chart_type, title, labels, datasets, x_axis_label, y_axis_label, insights } = chartConfig;

  // Color palette for charts
  const colors = [
    "#3B82F6", // blue
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#F97316", // orange
    "#6366F1", // indigo
  ];

  const getChartIcon = () => {
    switch (chart_type) {
      case "bar":
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case "pie":
      case "donut":
        return <PieChart className="w-5 h-5 text-purple-500" />;
      case "line":
        return <LineChart className="w-5 h-5 text-green-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  // Bar Chart Renderer
  const renderBarChart = () => {
    if (!datasets || !datasets[0]?.data || !labels) return null;

    const data = datasets[0].data;
    const maxValue = Math.max(...data.map(d => typeof d === 'number' ? d : 0));
    const padding = { top: 40, right: 30, bottom: 80, left: 60 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;
    const barWidth = Math.min(chartWidth / data.length * 0.7, 60);
    const barGap = chartWidth / data.length - barWidth;

    return (
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left - 5}
              y1={padding.top + chartHeight * (1 - tick)}
              x2={padding.left}
              y2={padding.top + chartHeight * (1 - tick)}
              stroke="#9CA3AF"
            />
            <text
              x={padding.left - 10}
              y={padding.top + chartHeight * (1 - tick) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {(maxValue * tick).toFixed(maxValue < 10 ? 1 : 0)}
            </text>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - tick)}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * (1 - tick)}
              stroke="#F3F4F6"
              strokeDasharray="4"
            />
          </g>
        ))}

        {/* Bars */}
        {data.map((value, index) => {
          const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
          const x = padding.left + index * (barWidth + barGap) + barGap / 2;
          const y = padding.top + chartHeight - barHeight;
          const isHovered = hoveredIndex === index;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors[index % colors.length]}
                opacity={isHovered ? 1 : 0.8}
                rx="4"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-200"
              />
              {/* Value label on hover */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </text>
              )}
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                transform={`rotate(-30, ${x + barWidth / 2}, ${padding.top + chartHeight + 20})`}
              >
                {labels[index]?.length > 15 ? labels[index].slice(0, 12) + "..." : labels[index]}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        {y_axis_label && (
          <text
            x={15}
            y={dimensions.height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${dimensions.height / 2})`}
            className="text-xs fill-gray-500 font-medium"
          >
            {y_axis_label}
          </text>
        )}
        {x_axis_label && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-500 font-medium"
          >
            {x_axis_label}
          </text>
        )}
      </svg>
    );
  };

  // Pie Chart Renderer
  const renderPieChart = () => {
    if (!datasets || !datasets[0]?.data || !labels) return null;

    const data = datasets[0].data;
    const total = data.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2 - 20;
    const radius = Math.min(dimensions.width, dimensions.height) / 3;
    const innerRadius = chart_type === "donut" ? radius * 0.5 : 0;

    let startAngle = -Math.PI / 2;

    const slices = data.map((value, index) => {
      const percentage = total > 0 ? value / total : 0;
      const angle = percentage * 2 * Math.PI;
      const endAngle = startAngle + angle;

      // Calculate path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const x1Inner = centerX + innerRadius * Math.cos(startAngle);
      const y1Inner = centerY + innerRadius * Math.sin(startAngle);
      const x2Inner = centerX + innerRadius * Math.cos(endAngle);
      const y2Inner = centerY + innerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      let path;
      if (innerRadius > 0) {
        path = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
          L ${x2Inner} ${y2Inner}
          A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
          Z
        `;
      } else {
        path = `
          M ${centerX} ${centerY}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
          Z
        `;
      }

      // Label position
      const midAngle = startAngle + angle / 2;
      const labelRadius = radius + 25;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      const result = {
        path,
        color: colors[index % colors.length],
        label: labels[index],
        value,
        percentage: (percentage * 100).toFixed(1),
        labelX,
        labelY,
      };

      startAngle = endAngle;
      return result;
    });

    return (
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.path}
              fill={slice.color}
              opacity={hoveredIndex === index ? 1 : 0.85}
              stroke="white"
              strokeWidth="2"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-all duration-200"
            />
            {/* Show percentage on hover */}
            {hoveredIndex === index && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                className="text-sm font-bold fill-gray-700"
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}
        
        {/* Legend */}
        <g transform={`translate(10, ${dimensions.height - 40})`}>
          {labels.slice(0, 5).map((label, index) => (
            <g key={index} transform={`translate(${index * 120}, 0)`}>
              <rect width="12" height="12" fill={colors[index % colors.length]} rx="2" />
              <text x="18" y="10" className="text-xs fill-gray-600">
                {label?.length > 12 ? label.slice(0, 10) + "..." : label}
              </text>
            </g>
          ))}
        </g>

        {/* Center text for donut */}
        {chart_type === "donut" && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            className="text-lg font-bold fill-gray-700"
          >
            {total.toLocaleString()}
          </text>
        )}
      </svg>
    );
  };

  // Line Chart Renderer
  const renderLineChart = () => {
    if (!datasets || !datasets[0]?.data || !labels) return null;

    const data = datasets[0].data;
    const maxValue = Math.max(...data.map(d => typeof d === 'number' ? d : 0));
    const minValue = Math.min(...data.map(d => typeof d === 'number' ? d : 0));
    const range = maxValue - minValue || 1;
    
    const padding = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;
    const stepX = chartWidth / (data.length - 1 || 1);

    const points = data.map((value, index) => ({
      x: padding.left + index * stepX,
      y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight,
      value,
      label: labels[index],
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    // Area fill path
    const areaPath = `${pathD} L ${points[points.length - 1]?.x || 0} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

    return (
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - tick)}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * (1 - tick)}
              stroke="#F3F4F6"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 10}
              y={padding.top + chartHeight * (1 - tick) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {(minValue + range * tick).toFixed(range < 10 ? 1 : 0)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`${colors[0]}20`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={colors[0]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 8 : 5}
              fill={colors[0]}
              stroke="white"
              strokeWidth="2"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-all duration-200"
            />
            {hoveredIndex === index && (
              <>
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="25"
                  fill="white"
                  stroke="#E5E7EB"
                  rx="4"
                />
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  {typeof point.value === 'number' ? point.value.toLocaleString() : point.value}
                </text>
              </>
            )}
            {/* X-axis labels */}
            {index % Math.ceil(data.length / 8) === 0 && (
              <text
                x={point.x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.label?.length > 10 ? point.label.slice(0, 8) + "..." : point.label}
              </text>
            )}
          </g>
        ))}

        {/* Axis labels */}
        {y_axis_label && (
          <text
            x={15}
            y={dimensions.height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${dimensions.height / 2})`}
            className="text-xs fill-gray-500 font-medium"
          >
            {y_axis_label}
          </text>
        )}
        {x_axis_label && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-500 font-medium"
          >
            {x_axis_label}
          </text>
        )}
      </svg>
    );
  };

  // Histogram Renderer
  const renderHistogram = () => {
    return renderBarChart(); // Reuse bar chart for histogram
  };

  // Scatter Chart Renderer
  const renderScatterChart = () => {
    if (!datasets || !datasets[0]?.data) return null;

    const data = datasets[0].data;
    if (!data.length || !data[0].x) return renderBarChart(); // Fallback

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const maxX = Math.max(...xValues);
    const minX = Math.min(...xValues);
    const maxY = Math.max(...yValues);
    const minY = Math.min(...yValues);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const padding = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    const points = data.map((d, index) => ({
      x: padding.left + ((d.x - minX) / rangeX) * chartWidth,
      y: padding.top + chartHeight - ((d.y - minY) / rangeY) * chartHeight,
      originalX: d.x,
      originalY: d.y,
      index,
    }));

    return (
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
          <g key={`y-${i}`}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - tick)}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * (1 - tick)}
              stroke="#F3F4F6"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 10}
              y={padding.top + chartHeight * (1 - tick) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {(minY + rangeY * tick).toFixed(1)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
          <text
            key={`x-${i}`}
            x={padding.left + chartWidth * tick}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {(minX + rangeX * tick).toFixed(1)}
          </text>
        ))}

        {/* Data points */}
        {points.map((point) => (
          <circle
            key={point.index}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === point.index ? 8 : 5}
            fill={colors[0]}
            opacity={hoveredIndex === point.index ? 1 : 0.7}
            stroke="white"
            strokeWidth="1"
            onMouseEnter={() => setHoveredIndex(point.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer transition-all duration-200"
          />
        ))}

        {/* Axis labels */}
        {y_axis_label && (
          <text
            x={15}
            y={dimensions.height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${dimensions.height / 2})`}
            className="text-xs fill-gray-500 font-medium"
          >
            {y_axis_label}
          </text>
        )}
        {x_axis_label && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-500 font-medium"
          >
            {x_axis_label}
          </text>
        )}
      </svg>
    );
  };

  const renderChart = () => {
    switch (chart_type) {
      case "bar":
        return renderBarChart();
      case "pie":
      case "donut":
        return renderPieChart();
      case "line":
        return renderLineChart();
      case "histogram":
        return renderHistogram();
      case "scatter":
        return renderScatterChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4" ref={containerRef}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getChartIcon()}
          <h3 className="text-lg font-semibold text-gray-800">{title || "Chart"}</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
          {chart_type} chart
        </span>
      </div>

      {/* Chart Reasoning */}
      {reasoning && (
        <div className="flex items-start space-x-2 mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">{reasoning}</p>
        </div>
      )}

      {/* Chart */}
      <div className="flex justify-center mb-4 overflow-x-auto">
        {renderChart()}
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">•</span>
                <span className="text-sm text-gray-600">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dataset info */}
      {datasets && datasets[0]?.insight && (
        <div className="mt-3 text-xs text-gray-500 italic">
          {datasets[0].insight}
        </div>
      )}
    </div>
  );
};

export default ChartVisualization;
