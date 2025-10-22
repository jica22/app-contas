import { useState, KeyboardEvent } from "react";
import "./output.css";
import { exportMonthAndYearToExcel } from "./scripts/writeFile";

export function ExcelPage() {

  const today = new Date();

  const [month, setMonth] = useState((today.getMonth() + 1).toString())
  const [year, setYear] = useState(today.getFullYear().toString())
  const [error, setError] = useState("")

  const onClick = async () => {
    exportMonthAndYearToExcel(month, year).then((value: string | void) => {
      console.log(value)
      if (value) {
        setError(value);
      } else {
        setError("");
      }
    })

  }

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onClick()
    }
  }

  return (
    <div className="font-poppins mt-10 col-span-2 h-[100vh] w-[100vw] flex flex-col justify-center items-center">
      <div className="flex flex-col space-x-4">
        <div className="flex flex-col">
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
          <button className="h-10 m-4 bg-gray-300 font-bold rounded-md p-2 hover:bg-white transition-colors hover:border-2 border-black" onClick={onClick}>Exportar para Excel</button>
          <p className="text-red-700">{error}</p>
        </div>
      </div>

    </div>
  );
}
