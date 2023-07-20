import { getOffers } from "../api/offer/route";

/**
 * Ce fichier est déprécié, il est cependant conservé pour montrer la possibilité
 * de récupérer des données en appelant directement la fonction getOffers depuis le serveur.
 */

// Temps de survie dans le cache
export const revalidate = 60;

async function getData() {
    return getOffers(10);
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