import React, { useEffect, useRef, useState } from "react";
import { BarTask } from "../../types/bar-task";
import { GanttContentMoveAction } from "../../types/gantt-task-actions";
import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
import { Project } from "./project/project";
import { useAuth } from "../../../src/app/modules/auth";
import axios from "axios";

interface User {
  user: string;
  user_image: string;
  img: string;
}

let init = {
  _id: "",
  username: "",
  display_name: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  segment: "",
  __v: 0,
};

export type TaskItemProps = {
  task: BarTask;
  arrowIndent: number;
  taskHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  rtl: boolean;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
};

export const TaskItem: React.FC<TaskItemProps> = (props) => {
  const { task, isDelete, isSelected, onEventStart } = {
    ...props,
  };

  const [taskItem, setTaskItem] = useState<JSX.Element>(<div />);
  const taskContainerRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuth();
  const [userLogin, setUserLogin] = useState<any>(init);
  const [workerId, setWorkerId] = useState("");
  const [systoryStatus, setSystoryStatus] = useState("");
  const [kumonosStatus, setKumonosStatus] = useState("");
  
  useEffect(() => {
    setUserLogin(currentUser);
    if (userLogin.segment == "systory" && userLogin.role == "worker") {
      setWorkerId(userLogin._id);
      setSystoryStatus(userLogin.role);
    } else if (
      userLogin.segment == "systory" &&
      userLogin.role == "administrator"
    ) {
      setSystoryStatus(userLogin.role);
    } else if (
      userLogin.segment == "kumonos" &&
      userLogin.role == "administrator"
    ) {
      setKumonosStatus(userLogin.role);
    } else if (
      (userLogin.segment == "kumonos" && userLogin.role == undefined) ||
      (userLogin.segment == "kumonos" && userLogin.role == "worker")
    ) {
      setKumonosStatus("worker");
    }
  }, [currentUser, userLogin]);

  useEffect(() => {
    if (taskContainerRef.current) {
      const width = Math.floor(
        taskContainerRef.current.getBoundingClientRect().width
      );
    }
  }, [task]);

  useEffect(() => {
    switch (task.typeInternal) {
      case "milestone":
        setTaskItem(<Milestone {...props} />);
        break;
      case "project":
        setTaskItem(<Project {...props} />);
        break;
      case "smalltask":
        setTaskItem(<BarSmall {...props} />);
        break;
      default:
        setTaskItem(<Bar {...props} />);
        break;
    }
  }, [task, isSelected]);

  const projectWith = task.x2 - task.x1;
  // console.log("🥩🥩",task);
  
  return (
    <g
      onKeyDown={(e) => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) onEventStart("delete", task, e);
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseLeave={(e) => {
        onEventStart("mouseleave", task, e);
      }}
      onDoubleClick={(e) => {
        onEventStart("dblclick", task, e);
      }}
      onClick={(e) => {
        onEventStart("click", task, e);
      }}
      onFocus={() => {
        onEventStart("select", task);
      }}
    >
      {taskItem}
      <foreignObject
        x={task.x1}
        y={task.y}
        width={projectWith}
        height={task.height}
      >
        <div
          style={{
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            display: "flex",
            padding: "5px",
            alignItems: "center",
            borderRadius: "5px",
            color: "white",
            cursor: "pointer",
          }}
          className="task-continer"
          ref={taskContainerRef}
        >
          <div
            style={{ display: "flex", width: "100%" }}
            className="task-start"
          >
            {task.type == "project" && (
              <>
                {/* {(task.mainproject_img || []).map((worker, index) => (
                  <div className="task-image-personInchang" key={index}>
                    {worker != null && (
                      <img
                        style={{ borderRadius: "50%", marginTop: "4px", marginLeft: "1px" }}
                        src={`https://trimble.systory.la/public/images/users/${worker}`}
                        width={23}
                        height={23}
                      />
                    )}
                  </div>
                ))} */}
                {userLogin.segment == "systory" && (
                  <>
                    <div
                      style={{
                        height: "30px",
                        width: "100%",
                        marginLeft: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="task-projectName"
                    >
                      <div style={{ fontSize: "12px" }} className="projectName">
                        {task.subProjectName}         
                      </div>
                    </div>
                  </>
                )}
                {userLogin.segment == "kumonos" && (
                  <>
                    <div
                      style={{
                        height: "30px",
                        width: "100%",
                        marginLeft: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="task-projectName"
                    >
                      <div style={{ fontSize: "12px" }} className="projectName">
                        {task.mainProjectName}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {task.type == "task" && (
              <>
                {(
                  (task.workerProgrees as {
                    user: any;
                    user_image: string;
                  }[]) || []
                ).map((worker, index) => (
                  <div className="task-image-personInchang" key={index}>
                    {worker?.user != null && (
                      <img
                        style={{
                          borderRadius: "50%",
                          marginTop: "4px",
                          marginLeft: "1px",
                        }}
                        src={`https://trimble.systory.la/public/images/users/${worker?.user.img}`}
                        width={23}
                        height={23}
                      />
                    )}
                  </div>
                ))}
                {(
                  (task.checkerProgress as {
                    user: any;
                    user_image: string;
                  }[]) || []
                ).map((checker, index) => (
                  <div className="task-image-personInchang" key={index}>
                    {checker?.user != null && (
                      <img
                        style={{
                          borderRadius: "50%",
                          marginTop: "4px",
                          marginLeft: "1px",
                        }}
                        src={`https://trimble.systory.la/public/images/users/${checker.user.img}`}
                        width={23}
                        height={23}
                      />
                    )}
                  </div>
                ))}
                <div
                  style={{
                    height: "30px",
                    width: "100%",
                    marginLeft: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  className="task-projectName"
                >
                  <div style={{ fontSize: "12px" }} className="projectName">
                    {task.name}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{ color: "#fff", fontSize: "12px" }}
              className="projectName fw-bold"
            >
              {task.progress}%
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
