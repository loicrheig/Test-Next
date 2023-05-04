import { getTitle } from "../api/hello/route";

// Temps de survie dans le cache
export const revalidate = 60;
async function getData() {
    return getTitle(10);
  }
  
export default async function Home() {
    const data = await getData();
  
    return <main>
        <h1>Home</h1>
        <ul>
            {data.map((item, id) => (
                <li key={id}>{item.Title}</li>
            ))}
        </ul>
    </main>;
}