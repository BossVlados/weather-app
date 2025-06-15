import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WeatherChartProps {
  data: Array<{
    time: string;
    temperature: number;
    humidity: number;
  }>;
  type: 'temperature' | 'humidity';
  title: string;
}

export function WeatherChart({ data, type, title }: WeatherChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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
      .range([0, width]);

    const yValue = type === 'temperature' ? 'temperature' : 'humidity';
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(processedData, d => d[yValue]) as [number, number])
      .nice()
      .range([height, 0]);

    // Линия
    const line = d3
      .line<typeof processedData[0]>()
      .x(d => xScale(d.parsedTime))
      .y(d => yScale(d[yValue]))
      .curve(d3.curveMonotoneX);

    // Сетка
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => '')
      );

    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      );

    // Оси
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(formatTime));

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale));

    // Линия графика
    g.append('path')
      .datum(processedData)
      .attr('class', type === 'temperature' ? 'temperature-line' : 'humidity-line')
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
      .attr('fill', type === 'temperature' ? '#3b82f6' : '#10b981')
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
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text(type === 'temperature' ? 'Температура (°C)' : 'Влажность (%)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Время');

  }, [data, type]);

  return (
    <div className="chart-container p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}