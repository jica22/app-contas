import { useState, KeyboardEvent, useEffect } from "react";
import { Conta } from "./types/conta";
import { ContaListItem } from "./components/ContaListItem";
import "./output.css";
import { getAllGroups, tryGetValuesInMonthAndYearFrame } from "./scripts/writeFile";

export function ContasList() {

  const today = new Date();

  const [month, setMonth] = useState(today.getUTCMonth().toString())
  const [year, setYear] = useState(today.getFullYear().toString())
  const [contas, setContas] = useState<Conta[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [groupsSortedWithContas, setGroupsSortedWithContas] = useState<{ [key: string]: Conta[] }>({});
  const [total, setTotal] = useState(0)

  const sortGroups = () => {
    const sortedGroups = contas.reduce((acc: { [key: string]: Conta[] }, conta) => {
      if (!acc[conta.Group]) {
        acc[conta.Group] = [];
      }
      acc[conta.Group].push(conta);
      return acc;
    }, {});

    setGroupsSortedWithContas(sortedGroups);
  }

  useEffect(() => {
    sortGroups()
    console.log(groupsSortedWithContas)
  }, [groups, contas])

  const onClick = async () => {
    setContas(await tryGetValuesInMonthAndYearFrame(month, year));
    setGroups(await getAllGroups());
    setTotal(0);
    let calculTotal = 0
    tryGetValuesInMonthAndYearFrame(month, year).then((thisContas) => {
      thisContas.map((c) => {
        // console.log(Number(c.Value))
        calculTotal += Number(c.Value)
      })
      setTotal(Number(calculTotal.toFixed(2)))
    })
    sortGroups()
    console.log(groupsSortedWithContas)
  }

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onClick()
    }
  }

  return (
    <div className="font-poppins mt-10 col-span-2">
      <div className="flex flex-col space-x-4">
        <div className="flex flex-col pl-20 pr-20">
          <label htmlFor="month">Mês</label>
          <input onKeyDown={onKeyPress} type="text" name="month" id="month" placeholder="Mês" className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" onChange={
            (e) => {
              setMonth(e.target.value)
            }
          } value={month} />
          <label htmlFor="year">Ano</label>
          <input onKeyDown={onKeyPress} type="text" name="year" id="year" placeholder="Mês" className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" onChange={
            (e) => {
              setYear(e.target.value)
            }
          } value={year} />
          <button className="h-10 m-4 bg-gray-300 font-bold rounded-md p-2 hover:bg-white transition-colors hover:border-2 border-black" onClick={onClick}>Filtrar</button>
          <p className={`font-bold ${total.toString().includes("-") ? "text-red-700" : "text-green-700"}`
          }>Total: {total.toString().includes("-") ? "-" : ""}R${total.toString().replace("-", "")}</p>
        </div>
        <div className="mt-8 w-full h-[60vh] overflow-auto">
          <div>
            {Object.entries(groupsSortedWithContas).map(([groupName, contas]) => {
              const thisTotal = contas.reduce((sum, conta) => sum + parseFloat(conta.Value || '0'), 0).toFixed(2);
              return (<div className="flex flex-row items-start mb-4" key={groupName}>
                <div className="w-[200px] flex-col flex-shrink-0 text-center bg-gray-200 p-4 rounded-md flex items-center justify-center h-[100px]">
                  <h2 className="font-bold text-lg">{groupName}</h2>
                  <p className={thisTotal.toString().includes("-") ? "text-red-700" : "text-green-700"}>Total: {thisTotal.toString().includes("-") ? "-" : ""}R${thisTotal.toString().replace("-", "")}</p>
                </div>
                <div className="flex flex-shrink-0 h-[100px]">
                  {contas.map((conta) => (
                    <div >
                      {<ContaListItem Name={conta.Name} Value={conta.Value} Date={conta.Date} Group={conta.Group} OnDelete={onClick}></ContaListItem>}
                    </div>
                  ))}
                </div>
              </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
