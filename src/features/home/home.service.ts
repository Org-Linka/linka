import type { HomeCategory, HomeHighlight } from "./home.types";

export function listHomeCategories(): HomeCategory[] {
  return [
    { id: "1", nome: "Projetos", icone: "bulb-outline" },
    { id: "2", nome: "Vagas", icone: "briefcase-outline" },
    { id: "3", nome: "Oportunidades", icone: "business-outline" },
    { id: "4", nome: "Eventos", icone: "calendar-outline" },
  ];
}

export function listHomeHighlights(): HomeHighlight[] {
  return [
    { id: "1", titulo: "Semana de Tecnologia", local: "Unisuam / Bonsucesso", data: "12 Out" },
    { id: "2", titulo: "Hackathon Linka", local: "Remoto", data: "20 Out" },
    { id: "3", titulo: "Hackathon Bradesco", local: "Centro / Av. Rio Branco", data: "30 Dec" },
    { id: "4", titulo: "Palestra de Cyber Security", local: "Remoto", data: "15 Mai" },
  ];
}
