import React from "react";
import { TaskItemProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
  const taskBlack = "#98A0A8";

  const barColor = isSelected
    ? taskBlack
    : taskBlack
  const processColor = isSelected
    ? task.styles.progressSelectedColor
    : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;

  return (
  <g className={styles.projectWrapper}>
    <foreignObject x={task.x1} y={task.y} width={projectWith} height={task.height}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "5px",
          backgroundColor: "#EBF4FD",
          borderRadius: "5px",
        }}
      >
      </div>
    </foreignObject>
    <rect
      fill={barColor}
      x={task.x1}
      width={projectWith}
      y={task.y}
      height={task.height}
      rx={task.barCornerRadius}
      ry={task.barCornerRadius}
      className={styles.projectBackground}
    />
    <rect
      x={task.progressX}
      width={task.progressWidth}
      y={task.y}
      height={task.height}
      ry={task.barCornerRadius}
      rx={task.barCornerRadius}
      fill={processColor}
    />
  </g>
  );
};
