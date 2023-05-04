import { BigQuery } from "@google-cloud/bigquery"
import { NextResponse } from "next/server";
import SQLString from 'sqlstring';


export async function getTitle(size:number) {
  console.log('dffs ', process.env.CLIENT_ID)
  const client = new BigQuery({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: process.env.PRIVATE_KEY
    }
  })



  const query = SQLString.format("SELECT Title FROM `tb-datalake-v1.data_set_scraping.test` LIMIT ?", [size])

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size')??10;

  const rows = await getTitle(+size);
  return NextResponse.json(rows);
}
