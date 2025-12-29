import {FC, KeyboardEvent, MouseEventHandler, ReactNode} from "react";
import clsx from "clsx";
import { useLocation } from "react-router";
import { checkIsActive, KTIcon, WithChildren } from "../../../helpers";
import { useLayout } from "../../core";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasBullet?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
  actions?: ReactNode;
};

const AsideMenuItemWithSub: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
  isOpen = false,
  onClick,
  onContextMenu,
  actions,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const { config } = useLayout();
  const { aside } = config;

  const handleKey = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={clsx("menu-item menu-accordion", {
        "here show": isOpen,
        active: isActive,
      })}
      onContextMenu={onContextMenu}
      // note: metronic usually uses data-kt-menu-trigger; we’re controlling via React
    >
      <span
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`submenu-${title}`}
        className="menu-link d-flex align-items-center"
        onClick={onClick}
        onKeyDown={handleKey}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {hasBullet && (
          <span className="menu-bullet">
            <span className="bullet bullet-dot"></span>
          </span>
        )}

        {icon && aside.menuIcon === "svg" && (
          <span className="menu-icon">
            <KTIcon iconName={icon} className="fs-2" />
          </span>
        )}

        {fontIcon && aside.menuIcon === "font" && (
          <i className={clsx("bi fs-3", fontIcon)}></i>
        )}

        <span className="menu-title ms-3 me-2 flex-grow-1 text-truncate" style={{ minWidth: 0 }}>
          {title}
        </span>
        {actions && (
          <span
            className="ms-2 me-3 d-flex align-items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </span>
        )}

        {/* use metronic arrow for consistent alignment */}
        <span className="menu-arrow ms-2" aria-hidden></span>
      </span>

      {/* animated collapse area */}
      <div
        id={`submenu-${title}`}
        className={clsx("menu-sub menu-sub-accordion collapse-content", {
          open: isOpen,
          "menu-active-bg": true,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export { AsideMenuItemWithSub };
