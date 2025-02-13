import { KeyboardEvent, useEffect, useState } from "react";
import "./output.css";
import { addToContaFile, addToGroupFile, deleteGroupByName, getAllGroups } from "./scripts/writeFile";

export function CreateConta() {

    const today = new Date();
    const thisDate = today.toISOString().split('T')[0];

    const [value, setValue] = useState('');
    const [date, setDate] = useState(thisDate);
    const [name, setName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [groupToAdd, setGroupToAdd] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [groupToDelete, setGroupToDelete] = useState('');

    const getGroups = async () => {
        const groups = await getAllGroups()
        setGroups(groups)
        setSelectedGroup(groups[0])
    }
    useEffect(() => {
        getGroups()
    }, [])

    const onSubmit = (isPositive: boolean) => {
        if (selectedGroup === '') {
            return
        }
        addToContaFile({ Name: name, Value: isPositive ? value : "-" + value, Date: date, Group: selectedGroup })
        setName('')
        setValue('')
    }

    const createGroup = () => {
        addToGroupFile(groupToAdd);
        if (selectedGroup === '') {
            setSelectedGroup(groupToAdd)
        }
        setGroups([...groups, groupToAdd])
        setGroupToAdd('');
    }

    const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (value === '') {
            return
        }
        if (e.key === '+') {
            e.preventDefault()
            onSubmit(true)
        } else if (e.key === '-' || e.key === 'Enter') {
            e.preventDefault()
            onSubmit(false)
        }
    }

    const onKeyPressForGroup = (e: KeyboardEvent<HTMLInputElement>) => {
        if (groupToAdd === '') {
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            createGroup()
        }
    }

    return (
        <div className="font-poppins col-start-2 col-span-3">
            <div className="h-[100vh] flex justify-center">
                <form className="flex flex-col justify-center align-middle w-80 h-100" action="">
                    <label htmlFor="name">Nome (Opcional)</label>
                    <input type="text" name="name" id="name" placeholder="Nome (Opcional)" className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" onChange={
                        (e) => {
                            setName(e.target.value)
                        }
                    } value={name} />
                    <label htmlFor="date">Data</label>
                    <input type="date" name="date" id="date" className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" defaultValue={thisDate} onChange={
                        (e) => {
                            setDate(e.target.value)
                        }
                    } />
                    <label htmlFor="value">Valor</label>
                    <input type="number" name="value" id="value" className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" onKeyDown={onKeyPress} placeholder="Valor" onChange={
                        (e) => {
                            setValue(e.target.value)
                        }
                    } value={value} />
                    <label htmlFor="group">Grupo</label>
                    <select className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" name="group" id="group" onChange={(e) => {
                        setSelectedGroup(e.target.value)
                    }}>
                        {groups.map((group) => {
                            return (
                                <option value={group}>{group}</option>
                            )
                        })}
                    </select>
                </form>
                <div className="flex flex-col justify-center ml-20">
                    <label htmlFor="addGroup">Adicionar Grupo</label>
                    <input className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" type="text" name="addGroup" id="addGroup" placeholder="Grupo" onKeyDown={onKeyPressForGroup} onChange={
                        (e) => {
                            setGroupToAdd(e.target.value)
                        }
                    } value={groupToAdd} />
                    <label className="mt-10" htmlFor="removeGroup">Remover Grupo</label>
                    <div className="flex flex-row items-center">
                        <select className="border-black border-2 rounded-xl p-2 hover:bg-gray-200 transition-all duration-200" name="removeGroup" id="removeGroup" onChange={(e) => {
                            setGroupToDelete(e.target.value)
                        }}>
                            {groups.map((group) => {
                                return (
                                    <option value={group}>{group}</option>
                                )
                            })}
                        </select>
                        <button
                            onClick={() => {
                                deleteGroupByName(groupToDelete)
                                getGroups()
                            }} className=" ml-2 rounded-full border-red-500 border-2 bg-red-700 size-10 hover:bg-red-800 text-red-500 transition-all duration-200 hover:text-red-700 focus:outline-none text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-9">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>

                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
