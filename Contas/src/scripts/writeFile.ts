import { Conta } from "@/types/conta";
import * as XLSX from "xlsx";

type fileReturn = {
    contas: Conta[]
    groups: string[]
}

type FileReturn = { contas: Conta[] };

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
        const contas = fileReturn.contas.filter(c => c.Date.split("-")[1].includes(month) && c.Date.split("-")[0].includes(year));

        return contas;
    } catch (e) {
        console.error('Erro ao recuperar valores:', e);
        return [];
    }
}

function createPivotByDayAndGroup(
    filename = "contas.xlsx",
    contas: Conta[]
) {
    if (!contas || contas.length < 1) {
        return "Não há contas para exportar nesse mês.";
    }

    // ---- Helpers ----
    const toNumber = (v: string | number): number =>
        typeof v === "number" ? v : Number(String(v).replace(",", "."));

    const parseDate = (d: string | Date): Date => {
        if (d instanceof Date) return d;

        // Se for formato ISO yyyy-mm-dd, cria localmente (sem UTC)
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            const [yyyy, mm, dd] = d.split('-').map(Number);
            return new Date(yyyy, mm - 1, dd); // local, sem conversão de fuso
        }

        // Se for formato dd/mm/yyyy
        const m = String(d).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) {
            const [_, dd, mm, yyyy] = m;
            return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        }

        // Caso genérico — tenta parse normal
        const generic = new Date(d);
        if (!isNaN(generic.getTime())) return generic;

        throw new Error(`Data inválida: ${d}`);
    };


    const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
    const fmtBR = (dt: Date) => `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
    const ymd = (dt: Date) => `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;

    // ---- Descobrir o mês-alvo a partir da primeira data válida ----
    let baseDate: Date | null = null;
    for (const c of contas) {
        try {
            const d = parseDate(c.Date);
            baseDate = d;
            break;
        } catch { }
    }
    if (!baseDate) return "Não foi possível determinar o mês das contas.";

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth(); // 0-11
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // ---- Listar todos os grupos (ordenados) ----
    const groups = Array.from(new Set(contas.map(c => c.Group))).sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );

    // ---- Mapa de soma por dia (YYYY-MM-DD) e grupo ----
    const sumsByDayGroup = new Map<string, Map<string, number>>();

    for (const c of contas) {
        let d: Date;
        try {
            d = parseDate(c.Date);
        } catch {
            continue;
        }

        // Ignora registros fora do mês detectado
        if (d.getFullYear() !== year || d.getMonth() !== month) continue;

        const valor = toNumber(c.Value);
        if (isNaN(valor)) continue;

        // Agora considera despesas (negativas) e lucros (positivas) — soma líquida
        const dayKey = ymd(d);
        console.log(dayKey + "T00:00:00")
        if (!sumsByDayGroup.has(dayKey)) sumsByDayGroup.set(dayKey, new Map());
        const inner = sumsByDayGroup.get(dayKey)!;
        inner.set(c.Group, (inner.get(c.Group) || 0) + valor);
    }

    // ---- Montar AOA: cabeçalho + linhas por dia + linha de total ----
    // Cabeçalho: Data, ...grupos, Total do Dia
    const header = ["Data", ...groups, "Total do Dia"];
    const aoa: (string | number)[][] = [header];

    // Totais por grupo (para a linha final)
    const totalPorGrupo = new Map<string, number>();
    for (const g of groups) totalPorGrupo.set(g, 0);

    // Linhas por dia
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const key = ymd(d);
        const line: (string | number)[] = [fmtBR(d)];

        let totalDia = 0;
        for (const g of groups) {
            const v = sumsByDayGroup.get(key)?.get(g) || 0;
            line.push(v);
            totalDia += v;
            totalPorGrupo.set(g, (totalPorGrupo.get(g) || 0) + v);
        }
        line.push(totalDia);
        aoa.push(line);
    }

    // Linha de total do mês
    const totalGeral = Array.from(totalPorGrupo.values()).reduce((a, b) => a + b, 0);
    const totalRow: (string | number)[] = ["Total do Mês"];
    for (const g of groups) totalRow.push(totalPorGrupo.get(g) || 0);
    totalRow.push(totalGeral);
    aoa.push(totalRow);

    // ---- Gerar planilha com SheetJS ----
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Ajuste simples de largura
    const colWidths = header.map(h => ({ wch: Math.max(12, String(h).length + 2) }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Resumo por Dia");
    XLSX.writeFile(wb, filename);
}

function createValuesToExcel(filename = "contas.xlsx", contas: Conta[]) {
    console.log(contas.length)
    if (contas.length < 1) {
        return "Não há contas para exportar nesse mês."
    }

    const rows = contas.map((c) => ({
        Data: c.Date,
        Nome: c.Name,
        Valor: Number(c.Value) < 0 ? `-R$${c.Value.replace("-", "")}` : `R$${c.Value}`,
        Grupo: c.Group,
        Total: ""
    }));

    const total = contas.reduce((sum, c) => sum + Number(c.Value), 0);
    rows[0] = {
        Data: rows[0].Data,
        Nome: rows[0].Nome,
        Valor: rows[0].Valor,
        Grupo: rows[0].Grupo,
        Total: total < 0 ? `-R$${Math.abs(total).toFixed(2)}` : `R$${total.toFixed(2)}`,
    };

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

    XLSX.utils.sheet_add_aoa(ws, [["Data", "Nome", "Valor", "Grupo", "Total"]], { origin: "A1" });

    XLSX.utils.book_append_sheet(wb, ws, "Contas");

    XLSX.writeFile(wb, filename);
}

export function exportAllToExcel(filename = "contas.xlsx") {
    const existingData = localStorage.getItem("db");
    if (!existingData) {
        console.warn("Nada para exportar: localStorage 'db' vazio.");
        return;
    }

    let parsed: FileReturn;
    try {
        parsed = JSON.parse(existingData);
    } catch (e) {
        console.error("JSON inválido em 'db':", e);
        return;
    }

    const contas = parsed?.contas ?? [];
    if (!Array.isArray(contas) || contas.length === 0) {
        console.warn("Nenhuma conta para exportar.");
        return;
    }

    createValuesToExcel(filename, contas)
}

export async function exportMonthAndYearToExcel(month: string, year: string) {
    const data = await tryGetValuesInMonthAndYearFrame(month, year);
    const filename = `Contas_${month}_${year}.xlsx`

    return createPivotByDayAndGroup(filename, data)

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

