import { Outlet } from "react-router-dom";
import GlobalState from "@/GlobalState";

const Root = () => {
  return (
    <GlobalState>
      <Outlet></Outlet>
    </GlobalState>
  );
};

export default Root;
