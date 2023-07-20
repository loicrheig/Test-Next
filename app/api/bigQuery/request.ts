import { BigQuery } from "@google-cloud/bigquery"

/**
 * Exécute une requête de type SELECT sur BigQuery
 * @param query 
 * @returns les résultats de la requête
 */
export async function executeSelectQuery(query:string) {
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