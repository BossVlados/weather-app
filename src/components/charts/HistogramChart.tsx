import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../../contexts/ThemeContext';

interface HistogramChartProps {
  data: Array<{
    time: string;
    temperature: number;
  }>;
  title: string;
  width?: number;
  height?: number;
}

export function HistogramChart({ data, title, width = 500, height = 300 }: HistogramChartProps) {
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
      bars: '#3b82f6',
    };

    // Извлекаем температуры
    const temperatures = data.map(d => d.temperature);

    // Создаем гистограмму
    const histogram = d3.histogram()
      .domain(d3.extent(temperatures) as [number, number])
      .thresholds(10);

    const bins = histogram(temperatures);

    // Шкалы
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(temperatures) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([innerHeight, 0]);

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
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', colors.text);

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.text);

    // Столбцы гистограммы
    g.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0 || 0))
      .attr('y', d => yScale(d.length))
      .attr('width', d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1))
      .attr('height', d => innerHeight - yScale(d.length))
      .attr('fill', colors.bars)
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'chart-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <div>Диапазон: ${Math.round(d.x0 || 0)}°C - ${Math.round(d.x1 || 0)}°C</div>
            <div>Количество: ${d.length}</div>
          `);

        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.selectAll('.chart-tooltip').remove();
        d3.select(this).attr('opacity', 0.7);
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
      .text('Частота');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.text)
      .text('Температура (°C)');

  }, [data, isDark, width, height]);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}