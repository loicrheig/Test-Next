import { NextResponse } from "next/server"
import SQLString from 'sqlstring'
import { executeSelectQuery } from "../bigQuery/request"

/**
 * Dictionnaire contenant tous les filtres possibles pour les offres
 * avec leur valeur par défaut
 */
export let parametersDefault: { [key: string]: any } = {};
parametersDefault = {
  nbRooms : 0,
  minPrice : 0,
  maxPrice : 0,
  minSurface : 0,
  maxSurface : 0,
  maxSchoolDistance : 0,
  maxShopDistance : 0,
  transportType : 'Tous',
  transportDistance : 0,
  boundingBoxUpperLeft : '46.56310942959972, 6.589736938476563',
  boundingBoxLowerRight : '46.47688154071965, 6.678314208984376',
}

export const parametersNames = Object.keys(parametersDefault);

/**
 * Récupère un nombre limité d'offres
 * @param size Le nombre d'offres à récupérer
 * @returns Les offres récupérées
 */
export function getOffers(size:number) {
  const query = SQLString.format("SELECT Title, Address, Description, Price, Type, NbRooms, Surface, Management, ImageUrls, AddressPrecise, ST_X(Coordinate), ST_Y(Coordinate) FROM `tb-datalake-v1.offers_data_set.t_offers` LIMIT ?", [size])
  return executeSelectQuery(query);
}

/**
 * Récupère les offres en fonction des filtres passés en paramètre.
 * Prend aussi en compte la limite et l'offset afin de pouvoir découper une requête en plusieurs requêtes plus petites.
 * @param nbRooms Nombre de pièces
 * @param minSurface Surface minimale
 * @param maxSurface Surface maximale
 * @param minPrice Prix minimal
 * @param maxPrice Prix maximal
 * @param maxSchoolDistance Distance maximale d'une école
 * @param maxShopDistance Distance maximale d'un commerce
 * @param transportType Type de transport pour le prochain filtre
 * @param transportDistance Distance maximale d'un transport de type transportType
 * @param limit Nombre d'offres à récupérer
 * @param offset Depuis quelle offre on récupère les offres
 * @returns 
 */
export function getOffersFiltered(nbRooms:number, minSurface:number, maxSurface:number, minPrice:number, maxPrice:number, maxSchoolDistance:number, maxShopDistance:number, transportType:string, transportDistance:number, boundingBoxUpperLeft:number[], boundingBoxLowerRight:number[], limit:number=-1, offset:number=-1) {
  let parameters = [];
  let query = `SELECT Title, Address, Description, Price, Type, NbRooms, Surface, Management, ImageUrls, 
              AddressPrecise, ST_X(Coordinate), ST_Y(Coordinate), 
              ARRAY(
                SELECT AS STRUCT
                  ST_X(Shop.Position),
                  ST_Y(Shop.Position),
                  Shop.Name AS Name,
                  Shop.Distance AS Distance,
                FROM UNNEST(Shops) AS Shop
              ) AS Shops, 
              ARRAY_LENGTH(Schools) SchoolNumber, 
              ARRAY(
                SELECT AS STRUCT
                  ST_X(School.Position),
                  ST_Y(School.Position),
                FROM UNNEST(Schools) AS School
              ) AS Schools,
              ARRAY(
                SELECT AS STRUCT
                  ST_X(PublicTransport.Position),
                  ST_Y(PublicTransport.Position),
                  PublicTransport.Name AS Name,
                  PublicTransport.Distance AS Distance,
                  PublicTransport.Type AS Type,
                FROM UNNEST(PublicTransports) AS PublicTransport
              ) AS PublicTransports,
              ARRAY(
                SELECT AS STRUCT
                  ST_X(InterestPoint.Position),
                  ST_Y(InterestPoint.Position),
                  InterestPoint.Name AS Name,
                  InterestPoint.Distance AS Distance,
                  InterestPoint.Type AS Type,
                FROM UNNEST(InterestPoints) AS InterestPoint
              ) AS InterestPoints 
              FROM \`tb-datalake-v1.offers_data_set.t_offers_experimental\``;

  // Si on a au moins un filtre, on ajoute le WHERE et pour les suivants on ajoute le AND
  let firstParamPassed = false;
  function addAnd(queryParam:string) {
    if (firstParamPassed) {
      query += "AND " + queryParam + " ";
    } else {
      query += " WHERE " + queryParam + " ";
      firstParamPassed = true;
    }
  }

  // La valeur -1 signifie que le filtre n'est pas utilisé
  // Sauf pour le transportType qui est une string

  if (nbRooms != parametersDefault.nbRooms) {
    addAnd("NbRooms = ?");
    parameters.push(nbRooms);
  }
  if (minSurface != parametersDefault.minSurface) {
    addAnd("Surface >= ?");
    parameters.push(minSurface);
  }
  if (maxSurface != parametersDefault.maxSurface) {
    addAnd("Surface <= ?");
    parameters.push(maxSurface);
  }
  if (minPrice != parametersDefault.minPrice) {
    addAnd("Price >= ?");
    parameters.push(minPrice);
  }
  if (maxPrice != parametersDefault.maxPrice) {
    addAnd("Price <= ?");
    parameters.push(maxPrice);
  }
  // Vérifie qu'il existe au moins une école à moins de maxSchoolDistance mètres et qui contient "primaire" dans son nom
  if (maxSchoolDistance != parametersDefault.maxSchoolDistance) {
    addAnd("EXISTS (SELECT 1 FROM UNNEST(schools) AS school WHERE school.distance <= ? AND (school.name LIKE '%primaire%' OR school.name LIKE '%Primaire%' ))");
    parameters.push(maxSchoolDistance);
  }
  // Vérifie qu'il existe au moins un commerce à moins de maxShopDistance mètres
  if (maxShopDistance != parametersDefault.maxShopDistance) {
    addAnd("EXISTS (SELECT 1 FROM UNNEST(shops) AS shop WHERE shop.distance <= ?)");
    parameters.push(maxShopDistance);
  }
  // Vérifie qu'il existe au moins un transport à moins de transportDistance mètres et qui est de type transportType
  if (transportDistance != parametersDefault.transportDistance) {
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

    // Check si le champ coordinate est dans la bounding box
    addAnd("ST_Y(Coordinate) < " + boundingBoxUpperLeft[0]);
    addAnd("ST_X(Coordinate) > " + boundingBoxUpperLeft[1]);
    addAnd("ST_Y(Coordinate) > " + boundingBoxLowerRight[0]);
    addAnd("ST_X(Coordinate) < " + boundingBoxLowerRight[1]);

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

/**
 * Fonction appelée lorsqu'un utilisateur accède à la route /offers
 * @param request La requête envoyée par l'utilisateur avec si besoin les paramètres de filtre
 * @returns Les offres respectants les filtres
*/
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nbRooms = searchParams.get(parametersNames[0])??parametersDefault[parametersNames[0]];
  const minPrice = searchParams.get(parametersNames[1])??parametersDefault[parametersNames[1]];
  const maxPrice = searchParams.get(parametersNames[2])??parametersDefault[parametersNames[2]];
  const minSurface = searchParams.get(parametersNames[3])??parametersDefault[parametersNames[3]];
  const maxSurface = searchParams.get(parametersNames[4])??parametersDefault[parametersNames[4]];
  const maxSchoolDistance = searchParams.get(parametersNames[5])??parametersDefault[parametersNames[5]];
  const maxShopDistance = searchParams.get(parametersNames[6])??parametersDefault[parametersNames[6]];
  const transportType = searchParams.get(parametersNames[7])??parametersDefault[parametersNames[7]];
  const transportDistance = searchParams.get(parametersNames[8])??parametersDefault[parametersNames[8]];
  const limit:string|null|number = searchParams.get('limit');
  const offset:string|null|number = searchParams.get('offset');

  const boundingBoxUpperLeft = searchParams.get(parametersNames[9])??parametersDefault[parametersNames[9]];
  const boundingBoxLowerRight = searchParams.get(parametersNames[10])??parametersDefault[parametersNames[10]];

  // parse bounding box to get an number array
  const boundingBoxUpperLeftArray = boundingBoxUpperLeft.split(',').map(Number);
  const boundingBoxLowerRightArray = boundingBoxLowerRight.split(',').map(Number);

  let rows;

  if (limit != null && !isNaN(+limit) && offset != null && !isNaN(+offset)) {
    rows = await getOffersFiltered(+nbRooms, +minSurface, +maxSurface, +minPrice, +maxPrice, +maxSchoolDistance, +maxShopDistance, transportType, +transportDistance, boundingBoxUpperLeftArray, boundingBoxLowerRightArray, +limit, +offset);
  }
  else{
    rows = await getOffersFiltered(+nbRooms, +minSurface, +maxSurface, +minPrice, +maxPrice, +maxSchoolDistance, +maxShopDistance, transportType, +transportDistance , boundingBoxUpperLeftArray, boundingBoxLowerRightArray);
  }

  return NextResponse.json(rows);
}
