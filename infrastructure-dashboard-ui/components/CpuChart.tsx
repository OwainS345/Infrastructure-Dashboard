"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

export interface CpuPoint {
  date: string;   
  value: number;  
}

export default function CpuChart({ data }: { data: CpuPoint[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear old chart

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Parse dates
    const parsedData = data.map((d) => ({
      date: new Date(d.date),
      value: d.value,
    }));

    // X Scale (Time)
    const x = d3
      .scaleTime()
      .domain(
        d3.extent(parsedData, (d) => d.date) as [Date, Date]
      )
      .range([margin.left, width - margin.right]);

    // Y Scale (CPU %)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.value)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Line generator
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Draw X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(7)
          .tickFormat(d3.timeFormat("%d %b") as any)
      );

    // Draw Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Draw line
    svg
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 2)
      .attr("d", line);

  }, [data]);

  return (
    <svg
      ref={svgRef}
      width={500}
      height={300}
      className="border rounded bg-white shadow text-black"
    ></svg>
  );
}
