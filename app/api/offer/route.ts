import { BigQuery } from "@google-cloud/bigquery"
import { NextResponse } from "next/server"
import SQLString from 'sqlstring'

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
  const query = SQLString.format("SELECT Title, Address, ST_X(Coordinate), ST_Y(Coordinate) FROM `tb-datalake-v1.data_set_scraping.test` LIMIT ?", [size])
  return executeSelectQuery(query);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size')??10;
  const rows = await getOffers(+size);
  return NextResponse.json(rows);
}
