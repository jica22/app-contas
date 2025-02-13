import { Conta } from "@/types/conta";

type fileReturn = {
    contas: Conta[]
    groups: string[]
}

export async function addToContaFile(conta: Conta) {
    let contas: Conta[] = [];

    const existingData = localStorage.getItem('db');
    if (existingData) {
        try {
            const parsedData: fileReturn = JSON.parse(existingData);
            contas = parsedData.contas;
        } catch (e) {

            localStorage.setItem('db', JSON.stringify({ contas: [] }));
        }
    }

    contas.push(conta);

    localStorage.setItem('db', JSON.stringify({ contas }));
}

export async function addToGroupFile(group: string) {
    let groups: string[] = [];

    const existingData = localStorage.getItem('group');
    if (existingData) {
        try {
            const parsedData: fileReturn = JSON.parse(existingData);
            groups = parsedData.groups;
        } catch (e) {

            localStorage.setItem('group', JSON.stringify({ groups: [] }));
        }
    }

    groups.push(group);

    localStorage.setItem('group', JSON.stringify({ groups }));
}

export async function tryGetValuesInMonthAndYearFrame(month: string, year: string): Promise<Conta[]> {
    try {
        const existingData = localStorage.getItem('db');
        if (!existingData) {
            return [];
        }

        const fileReturn: fileReturn = JSON.parse(existingData);
        const contas = fileReturn.contas.filter(c => c.Date.includes(month) && c.Date.includes(year));

        return contas;
    } catch (e) {
        console.error('Erro ao recuperar valores:', e);
        return [];
    }
}

export async function getAllGroups(): Promise<string[]> {
    try {
        const existingData = localStorage.getItem('group');
        if (!existingData) {
            return [];
        }

        const fileReturn: fileReturn = JSON.parse(existingData);
        const groups = fileReturn.groups;

        return groups;
    } catch (e) {
        console.error('Erro ao recuperar valores:', e);
        return [];
    }
}

export async function deleteContaByNameValueAndDateAndGroup(name: string, value: string, date: string, group: string): Promise<boolean> {
    try {
        const existingData = localStorage.getItem('db');
        if (!existingData) {
            return false;
        }

        const fileReturn: fileReturn = JSON.parse(existingData);
        const indexToRemove = fileReturn.contas.findIndex(
            c => c.Name === name && c.Value === value && c.Date === date && c.Group === group
        );

        if (indexToRemove === -1) {
            return false; // Nenhuma conta encontrada para deletar
        }

        const contas = fileReturn.contas
        contas.splice(indexToRemove, 1);


        localStorage.setItem('db', JSON.stringify({ contas }));
        return true;
    } catch (e) {
        console.error('Erro ao deletar conta:', e);
        return false;
    }
}

export async function deleteGroupByName(name: string): Promise<boolean> {
    try {
        const existingData = localStorage.getItem('group');
        if (!existingData) {
            return false;
        }

        const fileReturn: fileReturn = JSON.parse(existingData);
        const groups = fileReturn.groups.filter(c => c !== name);

        if (fileReturn.groups.length === groups.length) {
            return false;
        }

        localStorage.setItem('group', JSON.stringify({ groups }));
        return true;
    } catch (e) {
        console.error('Erro ao deletar grupo:', e);
        return false;
    }
}

