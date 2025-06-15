import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../../contexts/ThemeContext';

interface MovingAverageChartProps {
  data: Array<{
    time: string;
    temperature: number;
  }>;
  title: string;
  windowSize?: number;
  width?: number;
  height?: number;
}

export function MovingAverageChart({ 
  data, 
  title, 
  windowSize = 3, 
  width = 500, 
  height = 300 
}: MovingAverageChartProps) {
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
      text: isDark ? '#f3f4f6' : '#374151',
      grid: isDark ? '#374151' : '#e5e7eb',
      originalLine: '#94a3b8',
      movingAverageLine: '#3b82f6',
    };

    // Парсинг времени
    const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%fZ');
    const formatTime = d3.timeFormat('%H:%M');

    const processedData = data.map(d => ({
      ...d,
      parsedTime: parseTime(d.time) || new Date(),
    }));

    // Вычисление скользящего среднего
    const calculateMovingAverage = (data: typeof processedData, window: number) => {
      return data.map((item, index) => {
        const start = Math.max(0, index - Math.floor(window / 2));
        const end = Math.min(data.length, index + Math.ceil(window / 2));
        const slice = data.slice(start, end);
        const average = slice.reduce((sum, d) => sum + d.temperature, 0) / slice.length;
        
        return {
          ...item,
          movingAverage: average,
        };
      });
    };

    const dataWithMA = calculateMovingAverage(processedData, windowSize);

    // Шкалы
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataWithMA, d => d.parsedTime) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataWithMA, d => d.temperature) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Линии
    const originalLine = d3
      .line<typeof dataWithMA[0]>()
      .x(d => xScale(d.parsedTime))
      .y(d => yScale(d.temperature))
      .curve(d3.curveMonotoneX);

    const movingAverageLine = d3
      .line<typeof dataWithMA[0]>()
      .x(d => xScale(d.parsedTime))
      .y(d => yScale(d.movingAverage))
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

    // Оригинальная линия
    g.append('path')
      .datum(dataWithMA)
      .attr('fill', 'none')
      .attr('stroke', colors.originalLine)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('d', originalLine);

    // Линия скользящего среднего
    g.append('path')
      .datum(dataWithMA)
      .attr('fill', 'none')
      .attr('stroke', colors.movingAverageLine)
      .attr('stroke-width', 3)
      .attr('d', movingAverageLine);

    // Точки для скользящего среднего
    g.selectAll('.dot')
      .data(dataWithMA)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.parsedTime))
      .attr('cy', d => yScale(d.movingAverage))
      .attr('r', 3)
      .attr('fill', colors.movingAverageLine)
      .on('mouseover', function(event, d) {
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div>Время: ${formatTime(d.parsedTime)}</div>
            <div>Температура: ${d.temperature.toFixed(1)}°C</div>
            <div>Скользящее среднее: ${d.movingAverage.toFixed(1)}°C</div>
          `);

        d3.select(this).attr('r', 5);
      })
      .on('mouseout', function() {
        d3.selectAll('.chart-tooltip').remove();
        d3.select(this).attr('r', 3);
      });

    // Легенда
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 150}, 20)`);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', colors.originalLine)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Исходные данные');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 15)
      .attr('y2', 15)
      .attr('stroke', colors.movingAverageLine)
      .attr('stroke-width', 3);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 15)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Скользящее среднее');

    // Подписи осей
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Температура (°C)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Время');

  }, [data, windowSize, isDark, width, height]);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}