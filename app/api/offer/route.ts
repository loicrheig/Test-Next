import { NextResponse } from "next/server"
import SQLString from 'sqlstring'
import { executeSelectQuery } from "../bigQuery/request"

export const parametersDefault = {
  nbRooms : 0,
  minPrice : 0,
  maxPrice : 0,
  minSurface : 0,
  maxSurface : 0,
  maxSchoolDistance : 0,
  maxShopDistance : 0,
  transportType : 'Tous',
  transportDistance : 0,
}

export const parametersNames = Object.keys(parametersDefault);

export function getOffers(size:number) {
  const query = SQLString.format("SELECT Title, Address, Description, Price, Type, NbRooms, Surface, Management, ImageUrls, AddressPrecise, ST_X(Coordinate), ST_Y(Coordinate) FROM `tb-datalake-v1.offers_data_set.t_offers` LIMIT ?", [size])
  return executeSelectQuery(query);
}

// Get offers based on the different parameters
export function getOffersFiltered(nbRooms:number, minSurface:number, maxSurface:number, minPrice:number, maxPrice:number, maxSchoolDistance:number, maxShopDistance:number, transportType:string, transportDistance:number, limit:number, offset:number) {
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
  if (transportDistance != -1) {
    if (transportType == 'Tous') {
      addAnd("EXISTS (SELECT 1 FROM UNNEST(publicTransports) AS publicTransport WHERE publicTransport.distance <= ?)");
      parameters.push(transportDistance);
    }
    else {
      addAnd("EXISTS (SELECT 1 FROM UNNEST(publicTransports) AS publicTransport WHERE publicTransport.distance <= ? AND publicTransport.type = ?)");
      parameters.push(transportDistance);
      parameters.push(transportType);
    }
  }

  if (limit != -1) {
    query += "LIMIT ? ";
    parameters.push(limit);
  }

  if (offset != -1) {
    query += "OFFSET ? ";
    parameters.push(offset);
  }

  query = SQLString.format(query, parameters);

  return executeSelectQuery(query);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nbRooms = searchParams.get(parametersNames[0])??-1;
  const minPrice = searchParams.get(parametersNames[1])??-1;
  const maxPrice = searchParams.get(parametersNames[2])??-1;
  const minSurface = searchParams.get(parametersNames[3])??-1;
  const maxSurface = searchParams.get(parametersNames[4])??-1;
  const maxSchoolDistance = searchParams.get(parametersNames[5])??-1;
  const maxShopDistance = searchParams.get(parametersNames[6])??-1;
  const transportType = searchParams.get(parametersNames[7])??"Tous";
  const transportDistance = searchParams.get(parametersNames[8])??-1;
  const limit = searchParams.get('limit')??-1;
  const offset = searchParams.get('offset')??-1;
  const rows = await getOffersFiltered(+nbRooms, +minSurface, +maxSurface, +minPrice, +maxPrice, +maxSchoolDistance, +maxShopDistance, transportType, +transportDistance, +limit, +offset);

  return NextResponse.json(rows);
}
