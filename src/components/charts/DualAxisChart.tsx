import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../../contexts/ThemeContext';

interface DualAxisChartProps {
  data: Array<{
    time: string;
    temperature: number;
    humidity: number;
  }>;
  title: string;
  width?: number;
  height?: number;
}

export function DualAxisChart({ data, title, width = 500, height = 300 }: DualAxisChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
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
      temperature: '#ef4444',
      humidity: '#3b82f6',
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

    const yScaleTemp = d3
      .scaleLinear()
      .domain(d3.extent(processedData, d => d.temperature) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    const yScaleHumidity = d3
      .scaleLinear()
      .domain(d3.extent(processedData, d => d.humidity) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Линии
    const temperatureLine = d3
      .line<typeof processedData[0]>()
      .x(d => xScale(d.parsedTime))
      .y(d => yScaleTemp(d.temperature))
      .curve(d3.curveMonotoneX);

    const humidityLine = d3
      .line<typeof processedData[0]>()
      .x(d => xScale(d.parsedTime))
      .y(d => yScaleHumidity(d.humidity))
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

    // Оси
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(formatTime))
      .selectAll('text')
      .style('fill', colors.text);

    // Левая ось Y (температура)
    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScaleTemp))
      .selectAll('text')
      .style('fill', colors.temperature);

    // Правая ось Y (влажность)
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScaleHumidity))
      .selectAll('text')
      .style('fill', colors.humidity);

    // Линия температуры
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', colors.temperature)
      .attr('stroke-width', 2)
      .attr('d', temperatureLine);

    // Линия влажности
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', colors.humidity)
      .attr('stroke-width', 2)
      .attr('d', humidityLine);

    // Точки температуры
    g.selectAll('.temp-dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'temp-dot')
      .attr('cx', d => xScale(d.parsedTime))
      .attr('cy', d => yScaleTemp(d.temperature))
      .attr('r', 3)
      .attr('fill', colors.temperature)
      .on('mouseover', function(event, d) {
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div>Время: ${formatTime(d.parsedTime)}</div>
            <div>Температура: ${d.temperature}°C</div>
            <div>Влажность: ${d.humidity}%</div>
          `);

        d3.select(this).attr('r', 5);
      })
      .on('mouseout', function() {
        d3.selectAll('.chart-tooltip').remove();
        d3.select(this).attr('r', 3);
      });

    // Точки влажности
    g.selectAll('.humidity-dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'humidity-dot')
      .attr('cx', d => xScale(d.parsedTime))
      .attr('cy', d => yScaleHumidity(d.humidity))
      .attr('r', 3)
      .attr('fill', colors.humidity)
      .on('mouseover', function(event, d) {
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div>Время: ${formatTime(d.parsedTime)}</div>
            <div>Температура: ${d.temperature}°C</div>
            <div>Влажность: ${d.humidity}%</div>
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
      .attr('stroke', colors.temperature)
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Температура');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 15)
      .attr('y2', 15)
      .attr('stroke', colors.humidity)
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 15)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Влажность');

    // Подписи осей
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.temperature)
      .text('Температура (°C)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', innerWidth + margin.right)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '-1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.humidity)
      .text('Влажность (%)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Время');

  }, [data, isDark, width, height]);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}