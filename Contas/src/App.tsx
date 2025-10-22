import { useState } from "react";
import "./output.css";
import { Sidebar } from "./components/Sidebar";
import { When } from "react-if";
import { CreateConta } from "./CreateConta";
import { ContasList } from "./ContasList";
import { ExcelPage } from "./ExcelPage";

function App() {

  const [currentTab, setCurrentTab] = useState("");

  const onChange = (tab: string) => {
    setCurrentTab(tab)
  }

  return (
    <div className="grid grid-cols-4">
      <Sidebar onChange={onChange}></Sidebar>
      <When condition={currentTab === "Criar"}>
        <CreateConta></CreateConta>
      </When>
      <When condition={currentTab === ""}>
        <ContasList></ContasList>
      </When>
      <When condition={currentTab === "Excel"}>
        <ExcelPage />
      </When>
    </div>
  );
}
export default App;
