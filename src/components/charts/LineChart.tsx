import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../../contexts/ThemeContext';

interface LineChartProps {
  data: Array<{
    time: string;
    temperature: number;
    humidity: number;
  }>;
  type: 'temperature' | 'humidity';
  title: string;
  width?: number;
  height?: number;
}

export function LineChart({ data, type, title, width = 500, height = 300 }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Цвета для темной и светлой темы
    const colors = {
      background: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f3f4f6' : '#374151',
      grid: isDark ? '#374151' : '#e5e7eb',
      line: type === 'temperature' ? '#3b82f6' : '#10b981',
      dot: type === 'temperature' ? '#3b82f6' : '#10b981',
    };

    // Парсинг времени
    const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%fZ');
    const formatTime = d3.timeFormat('%H:%M');

    const processedData = data.map(d => ({
      ...d,
      parsedTime: parseTime(d.time) || new Date(),
    }));

    // Шкалы
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, d => d.parsedTime) as [Date, Date])
      .range([0, innerWidth]);

    const yValue = type === 'temperature' ? 'temperature' : 'humidity';
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(processedData, d => d[yValue]) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Линия
    const line = d3
      .line<typeof processedData[0]>()
      .x(d => xScale(d.parsedTime))
      .y(d => yScale(d[yValue]))
      .curve(d3.curveMonotoneX);

    // Сетка
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', colors.grid)
      .style('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', colors.grid)
      .style('stroke-dasharray', '2,2');

    // Оси
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(formatTime))
      .selectAll('text')
      .style('fill', colors.text);

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.text);

    // Линия графика
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', colors.line)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Точки
    g.selectAll('.dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.parsedTime))
      .attr('cy', d => yScale(d[yValue]))
      .attr('r', 3)
      .attr('fill', colors.dot)
      .on('mouseover', function(event, d) {
        // Tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div>Время: ${formatTime(d.parsedTime)}</div>
            <div>${type === 'temperature' ? 'Температура' : 'Влажность'}: ${d[yValue]}${type === 'temperature' ? '°C' : '%'}</div>
          `);

        d3.select(this).attr('r', 5);
      })
      .on('mouseout', function() {
        d3.selectAll('.chart-tooltip').remove();
        d3.select(this).attr('r', 3);
      });

    // Подписи осей
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text(type === 'temperature' ? 'Температура (°C)' : 'Влажность (%)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Время');

  }, [data, type, isDark, width, height]);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}