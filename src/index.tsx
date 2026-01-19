import { staticClasses } from "@decky/ui";
import { definePlugin } from "@decky/api";
import { FaTerminal } from "react-icons/fa";
import { CommandList } from "./components/CommandList";

export default definePlugin(() => {
  console.log("ExeKawaii plugin initializing");

  return {
    name: "ExeKawaii",
    titleView: <div className={staticClasses.Title}>ExeKawaii</div>,
    content: <CommandList />,
    icon: <FaTerminal />,
    onDismount() {
      console.log("ExeKawaii plugin unloading");
    },
  };
});
