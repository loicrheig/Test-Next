import Map from '../../components/Map/index.js';
import { getOffers } from "../api/offer/route";

async function getData() {
  return getOffers(1);
}

export default async function Home() {
  const data = await getData();
  return (
      <Map 
        offers={data}
      />
  )
}
