import { exportAllToExcel } from "../scripts/writeFile";
import "../output.css";

export interface Props {
    onChange: (value: boolean) => void
}
export const Sidebar: React.FC<Props> = ({ onChange }) => {

    return (
        <div className="font-poppins flex flex-col justify-center w-80 h-[100vh] bg-gray-200">
            <button onClick={() => {
                onChange(true)
            }} className="h-10 m-4 bg-gray-300 font-bold rounded-md p-2 hover:bg-white transition-all" >Adicionar conta</button>
            <button onClick={() => {
                onChange(false)
            }} className="h-10 m-4 bg-gray-300 font-bold rounded-md p-2 hover:bg-white transition-all" >Ver contas</button>
            <button onClick={() => {
                exportAllToExcel()
            }} className="h-10 m-4 bg-gray-300 font-bold rounded-md p-2 hover:bg-white transition-all" >Exportar contas para Excel</button>
        </div >
    );
}
