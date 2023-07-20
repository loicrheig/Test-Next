import { NextResponse } from "next/server"
import SQLString from 'sqlstring'
import { executeSelectQuery } from "../bigQuery/request"

/**
 * Récupère les types de transports
 * @returns Les types de transports
 */
function getTransportTypes() {
    const query = SQLString.format("SELECT DISTINCT publicTransport.Type FROM `tb-datalake-v1.offers_data_set.t_offers`, UNNEST(PublicTransports) AS publicTransport WHERE publicTransport.type IS NOT NULL")
    return executeSelectQuery(query);
}

/**
 * Récupère les types de transports
 * @returns Les types de transports
*/
export async function GET(request: Request) {
    const rows = await getTransportTypes();
    return NextResponse.json(rows);
}