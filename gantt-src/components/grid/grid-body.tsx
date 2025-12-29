import React, { ReactChild, useEffect, useState } from "react";
import { Task } from "../../types/public-types";
import { addToDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  weekendColor:string;
  holidayColor: string; 
  holidays: string[];
  rtl: boolean;
};
export const GridBody: React.FC<GridBodyProps> = ({
  tasks,
  dates,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  weekendColor,
  holidayColor,
  holidays,
  rtl,
}) => {
  // console.log(tasks);
  
  let y = 0;
  const gridRows: ReactChild[] = [];
  const rowLines: ReactChild[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];
  for (const task of tasks) {
    gridRows.push(
      <rect
        key={"Row" + task.id}
        x="0"
        y={y}
        width={svgWidth}
        height={rowHeight}
        className={styles.gridRow}
      />
    );
    rowLines.push(
      <line
        key={"RowLine" + task.id}
        x="0"
        y1={y + rowHeight}
        x2={svgWidth}
        y2={y + rowHeight}
        className={styles.gridRowLine}
      />
    );
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks: ReactChild[] = [];
  let today: ReactChild = <rect />;
  const weekendRects: ReactChild[] = [];
  const holidayRects: ReactChild[] = []; 
  let j = 1;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dateHoliday = dates[j];
    const isWeekend = dates[i].getDay() === 0 || dates[i].getDay() === 6; 
    // console.log(dateHoliday);
    let isHoliday = false;
    if (dateHoliday) {
      
       isHoliday = holidays.includes(dateHoliday.toISOString().split('T')[0]);
    }
j++
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />
    );
    if (isWeekend || isHoliday) {
      const fillColor = isWeekend ? weekendColor : holidayColor; 
      const rectElement = (
        <rect
          key={date.getTime()}
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={fillColor}
          opacity={0.5}
        />
      );

      if (isWeekend) {
        weekendRects.push(rectElement);
      } else {
        holidayRects.push(rectElement);
      }
    }
    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          "millisecond"
        ).getTime() >= now.getTime())
    ) {
      today = (
        <rect
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="weekends">{weekendRects}</g>
      <g className="holidays">{holidayRects}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
    </g>
  );
};
