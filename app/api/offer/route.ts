import { BigQuery } from "@google-cloud/bigquery"
import { NextResponse } from "next/server"
import SQLString from 'sqlstring'

export const parametersNames = [
  'nbRooms',
  'minSurface',
  'maxSurface',
  'minPrice',
  'maxPrice',
  'maxSchoolDistance',
  'maxShopDistance',
  'minMuseumNumber',
]

async function executeSelectQuery(query:string) {
  const client = new BigQuery({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: process.env.PRIVATE_KEY
    }
  })

  // Run the query as a job
  const [job] = await client.createQueryJob({
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'europe-west1'
  });

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  return rows;
}

export function getOffers(size:number) {
  const query = SQLString.format("SELECT Title, Address, Description, Price, Type, NbRooms, Surface, Management, ImageUrls, AddressPrecise, ST_X(Coordinate), ST_Y(Coordinate) FROM `tb-datalake-v1.offers_data_set.t_offers` LIMIT ?", [size])
  return executeSelectQuery(query);
}

// Get offers based on the different parameters
export function getOffersFiltered(nbRooms:number, minSurface:number, maxSurface:number, minPrice:number, maxPrice:number, maxSchoolDistance:number, maxShopDistance:number) {
  let query = "SELECT Title, Address, Description, Price, Type, NbRooms, Surface, Management, ImageUrls, AddressPrecise, ST_X(Coordinate), ST_Y(Coordinate), Shops, ARRAY_LENGTH(Schools) SchoolNumber, PublicTransports, InterestPoints FROM `tb-datalake-v1.offers_data_set.t_offers`";
  let parameters = [];

  let firstParamPassed = false;

  function addAnd(queryParam:string) {
    if (firstParamPassed) {
      query += "AND " + queryParam + " ";
    } else {
      query += " WHERE " + queryParam + " ";
      firstParamPassed = true;
    }
  }

  if (nbRooms != -1) {
    addAnd("NbRooms = ?");
    parameters.push(nbRooms);
  }
  if (minSurface != -1) {
    addAnd("Surface >= ?");
    parameters.push(minSurface);
  }
  if (maxSurface != -1) {
    addAnd("Surface <= ?");
    parameters.push(maxSurface);
  }
  if (minPrice != -1) {
    addAnd("Price >= ?");
    parameters.push(minPrice);
  }
  if (maxPrice != -1) {
    addAnd("Price <= ?");
    parameters.push(maxPrice);
  }
  if (maxSchoolDistance != -1) {
    addAnd("EXISTS (SELECT 1 FROM UNNEST(schools) AS school WHERE school.distance <= ? AND (school.name LIKE '%primaire%' OR school.name LIKE '%Primaire%' ))");
    parameters.push(maxSchoolDistance);
  }
  if (maxShopDistance != -1) {
    addAnd("EXISTS (SELECT 1 FROM UNNEST(shops) AS shop WHERE shop.distance <= ?)");
    parameters.push(maxShopDistance);
  }
  /*if (minMuseumNumber != -1) {
    addAnd("( SELECT COUNTIF(interestpoint.type = 'Musée') >= ? FROM UNNEST(InterestPoints) AS interestpoint )");
    parameters.push(minMuseumNumber);
  }*/


  query = SQLString.format(query, parameters);

  return executeSelectQuery(query);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nbRooms = searchParams.get(parametersNames[0])??-1;
  const minSurface = searchParams.get(parametersNames[1])??-1;
  const maxSurface = searchParams.get(parametersNames[2])??-1;
  const minPrice = searchParams.get(parametersNames[3])??-1;
  const maxPrice = searchParams.get(parametersNames[4])??-1;
  const maxSchoolDistance = searchParams.get(parametersNames[5])??-1;
  const maxShopDistance = searchParams.get(parametersNames[6])??-1;
  const rows = await getOffersFiltered(+nbRooms, +minSurface, +maxSurface, +minPrice, +maxPrice, +maxSchoolDistance, +maxShopDistance);

  return NextResponse.json(rows);
}
