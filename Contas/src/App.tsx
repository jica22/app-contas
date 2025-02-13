import { useState } from "react";
import "./output.css";
import { Sidebar } from "./components/Sidebar";
import { When } from "react-if";
import { CreateConta } from "./CreateConta";
import { ContasList } from "./ContasList";

function App() {

  const [currentTab, setCurrentTab] = useState(true);

  const onChange = (isTrue: boolean) => {
    setCurrentTab(isTrue)
    console.log(currentTab)
  }

  return (
    <div className="grid grid-cols-4">
      <Sidebar onChange={onChange}></Sidebar>
      <When condition={currentTab === true}>
        <CreateConta></CreateConta>
      </When>
      <When condition={currentTab === false}>
        <ContasList></ContasList>
      </When>
    </div>
  );
}
export default App;
