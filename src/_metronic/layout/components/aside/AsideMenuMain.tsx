import {useEffect, useMemo, useState} from "react";
import {useIntl} from "react-intl";
import {Link, useLocation} from "react-router-dom";
import {AsideMenuItemWithSub} from "./AsideMenuItemWithSub";
import {AsideMenuItem} from "./AsideMenuItem";
import {KTIcon, toAbsoluteUrl} from "../../../helpers";
import {useAuth} from "../../../../app/modules/auth/core/Auth";
import "./Aside.css";
import { DynamicCompanyMenu } from "./DynamicCompanyMenu";

export function AsideMenuMain() {
  const intl = useIntl();
  const {currentUser} = useAuth();
  const {pathname} = useLocation();
  const isKumonosRoute = pathname.startsWith("/kumonos");
  const isSystoryRoute = pathname.startsWith("/systory");

  const [forKumonos, setForKumonos] = useState(false);
  const [forWorker, setForWorker] = useState(false);
  const [forSystory, setForSystory] = useState(false);
  const [forEmpty, setForEmpty] = useState(false);

  // keys for localStorage (namespaced)
  const LS_KEYS = useMemo(() => ({
    kumonos: "aside.open.kumonos",
    systory: "aside.open.systory",
  }), []);

  const [openKumonos, setOpenKumonos] = useState<boolean>(() =>
    localStorage.getItem("aside.open.kumonos") === "true"
  );
  const [openSystory, setOpenSystory] = useState<boolean>(() =>
    localStorage.getItem("aside.open.systory") === "true"
  );

  // evaluate roles/segments
  useEffect(() => {
    if (currentUser?.segment === "kumonos") {
      setForKumonos(true);
      setForSystory(true);
      setForWorker(false);
      setForEmpty(false);
    } else if (currentUser?.segment === "systory" && currentUser?.role === "administrator") {
      setForSystory(true);
      setForWorker(false);
      setForKumonos(false);
      setForEmpty(false);
    } else if (
      currentUser?.segment === "systory" &&
      (currentUser?.role === "normal_user" || currentUser?.role === "management")
    ) {
      setForSystory(true);
      setForWorker(true);
      setForKumonos(false);
      setForEmpty(false);
    } else {
      setForEmpty(true);
      setForKumonos(false);
      setForSystory(false);
      setForWorker(false);
    }
  }, [currentUser]);

  // persist state
  const setAndStore = (key: string, value: boolean, setter: (v: boolean)=>void) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  // accordion mode: open one at a time
  const toggleKumonos = () => {
    const next = !openKumonos;
    setAndStore(LS_KEYS.kumonos, next, setOpenKumonos);
    if (next) setAndStore(LS_KEYS.systory, false, setOpenSystory);
  };
  const toggleSystory = () => {
    const next = !openSystory;
    setAndStore(LS_KEYS.systory, next, setOpenSystory);
    if (next) setAndStore(LS_KEYS.kumonos, false, setOpenKumonos);
  };

  // auto-open based on current route
  useEffect(() => {
    if (isKumonosRoute) {
      setAndStore(LS_KEYS.kumonos, true, setOpenKumonos);
      setAndStore(LS_KEYS.systory, false, setOpenSystory);
    } else if (isSystoryRoute) {
      setAndStore(LS_KEYS.systory, true, setOpenSystory);
      setAndStore(LS_KEYS.kumonos, false, setOpenKumonos);
    }
  }, [isKumonosRoute, isSystoryRoute, LS_KEYS]);

  // clear section state if user segment changes (optional safety)
  useEffect(() => {
    // if you store previous segment in context, compare and clear; here we just ensure consistency
    if (!forKumonos && !isKumonosRoute) setAndStore(LS_KEYS.kumonos, false, setOpenKumonos);
    if (!forSystory && !isSystoryRoute) setAndStore(LS_KEYS.systory, false, setOpenSystory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forKumonos, forSystory, isKumonosRoute, isSystoryRoute]);

  return (
    <>
      {forSystory && !forKumonos && (
        <>
          <Link to="/dashboard">
            <img
              src={toAbsoluteUrl("media/logos/kumonos_logo.png")}
              alt="logo"
              className="h-35px mb-12"
            />
          </Link>
          <AsideMenuItem
            to="/dashboard"
            icon="color-swatch"
            title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
            fontIcon="bi-app-indicator"
          />
        </>
      )}

      {(forKumonos || isKumonosRoute) && (
        <>
          <Link to="/kumonos/">
            <img
              src={toAbsoluteUrl("media/logos/kumonos_logo.png")}
              alt="logo"
              className="h-35px mb-12"
            />
          </Link>

          {/* <AsideMenuItemWithSub
            to="/kumonos"
            title="Kumonos"
            icon="abstract-20"
            isOpen={openKumonos}
            onClick={toggleKumonos}
          >
            <AsideMenuItem to="kumonos/kanban-board" title="Kanban Board" icon="element-6" />
            <AsideMenuItem to="kumonos/calendar" title="Calendar" icon="calendar" />
            <AsideMenuItem to="kumonos/User-management" title="User management" icon="profile-circle" />
            <AsideMenuItem to="kumonos/Complete-project" title="Complete project" icon="abstract-14" />
          </AsideMenuItemWithSub>

          <AsideMenuItemWithSub
            to="/systory"
            title="Systory"
            icon="abstract-44"
            isOpen={openSystory}
            onClick={toggleSystory}
          >
            <AsideMenuItem to="systory/systory-tasks" title="Systory Tasks" icon="graph-up" />
            {currentUser?.role === "administrator" && (
              <AsideMenuItem to="systory/request" title="Request" icon="add-files" />
            )}
            <AsideMenuItem to="systory/user-management" title="User management" icon="profile-circle" />
            <AsideMenuItem to="systory/calendar" title="Calendar" icon="calendar" />
          </AsideMenuItemWithSub> */}

          {/* Dynamic 3-level menu: Company -> Project -> Leaf */}
          <DynamicCompanyMenu />
        </>
      )}

      
    </>
  );
}
