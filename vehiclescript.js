import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://sygvufrlenrorzqazkns.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Z3Z1ZnJsZW5yb3J6cWF6a25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODMzNjYsImV4cCI6MjA1OTk1OTM2Nn0.U4Ml03Bz8TvlTPLWYXKDiqCiG1eCAXk-I9xBYAII9Jc'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const submitButton = document.getElementById("submitButton");
submitButton.addEventListener('click', async function searchVehicle(event) {

    event.preventDefault();

    // Get the search input values
    const rego = document.getElementById("rego").value.trim();
  
    const messageDiv = document.getElementById("message")
    const resultsDiv = document.getElementById("results");
  
    messageDiv.innerText = '';
    resultsDiv.innerHTML = '';

    if (!rego){
      messageDiv.innerText = "Error";
      return;
    }

    // Start with a basic query to the "People" table
    let query = supabase.from("Vehicles").select("*");
  
    // If the user entered a name, search by name (case-insensitive, partial match)
    if (rego) {
      query = query.ilike("VehicleID", `%${rego}%`);
    }

    // Perform the search query
    const { data: vehicleData, error: vehicleError } = await query;

    if ((vehicleData.length == 0)) {
      messageDiv.innerText = "No result found";
      return;
    }else{
      resultsDiv.classList.add("active");
    }
  
      messageDiv.innerText = 'Search successful'

  for(const vehicle of vehicleData){
    let ownerName ='Unknown'
    const ownerId = vehicle.OwnerID;  // Assuming you want to use the owner_id from the first result
    
    if(ownerId){
    const { data: ownerData, error: ownerError } = await supabase
        .from("People")
        .select("Name")
        .eq("PersonID", ownerId)
        ownerName = ownerData[0].Name
    }

      const resultDiv = document.createElement('div');
      resultDiv.classList.add('search-result');  // Add a class for styling if needed

      // Create and append the content inside the resultDiv
      resultDiv.innerHTML = `
        <strong>VehicleID:</strong> ${vehicle.VehicleID}<br>
        <strong>Make:</strong> ${vehicle.Make}<br>
        <strong>Model:</strong> ${vehicle.Model}<br>
        <strong>Colour: </strong>${vehicle.Colour}<br>
        <strong>Owner:</strong> ${ownerName}
      `;

      // Append the result div to the main results container
      resultsDiv.appendChild(resultDiv);
    }

})
