import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://sygvufrlenrorzqazkns.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Z3Z1ZnJsZW5yb3J6cWF6a25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODMzNjYsImV4cCI6MjA1OTk1OTM2Nn0.U4Ml03Bz8TvlTPLWYXKDiqCiG1eCAXk-I9xBYAII9Jc'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const submitButton = document.getElementById("submitButton");
/* IF THE SUBMIT BUTTON IS CLICKED */
submitButton.addEventListener('click', async function searchPeople(event) {

    event.preventDefault();

/* GET THE SEARCH INPUT VALUES */
    const name = document.getElementById("name").value.trim();
    const license = document.getElementById("license").value.trim();
  
    const messageDiv = document.getElementById("message")
    const resultsDiv = document.getElementById("results");

/* RESET THE RESULTS AND MESSAGE */
    messageDiv.innerText = '';
    resultsDiv.innerHTML = '';

/* SEND AN ERROR MESSAGE IF BOTH FIELDS AND EMPTY OR BOTH FIELDS ARE FILLED */
    if ((!name && !license)|| (name && license)) {
      messageDiv.innerText = "Error";
      return;
    }

/* START WITH BASIC QUERY */

    let query = supabase.from("People").select("*");
  
/* If the user entered a name, search by name (case-insensitive, partial match) */
    if (name) {
      query = query.ilike("Name", `%${name}%`);
    }
  
/* If the user entered a license number, search by license number */
    if (license) {
      query = query.ilike("LicenseNumber", `%${license}%`);
    }

/* Perform the search query */
    const { data, error } = await query;

/* If search does not match anyone */
    if ((data.length == 0)) {
      messageDiv.innerText = "No result found";
      return;
    }else{
      resultsDiv.classList.add("active");
    }

    messageDiv.innerText = 'Search successful'

    data.forEach(person => {
      const resultDiv = document.createElement('div');
      resultDiv.classList.add('search-result');

/* Create and append the content inside the resultDiv */
      resultDiv.innerHTML = `
        <strong>Name:</strong> ${person.Name}<br>
        <strong>Address:</strong> ${person.Address}<br>
        <strong>Date of Birth:</strong> ${person.DOB}<br>
        <strong>License Number: </strong>${person.LicenseNumber}<br>
        <strong>Expiry Date:</strong> ${person.ExpiryDate}
      `;

/* Append the result div to the main results container */
      resultsDiv.appendChild(resultDiv);
    })
})
