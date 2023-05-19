import { getTitle } from "../api/offer/route";

// Temps de survie dans le cache
export const revalidate = 60;
async function getData() {
    return getTitle(10);
}
  
export default async function Offer() {
    const data = await getData();
  
    return <main>
        <h1>Titre des offres</h1>
        <ul>
            {data.map((item, id) => (
                <li key={id}>{item.Title}</li>
            ))}
        </ul>
    </main>;
}