import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://sygvufrlenrorzqazkns.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Z3Z1ZnJsZW5yb3J6cWF6a25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODMzNjYsImV4cCI6MjA1OTk1OTM2Nn0.U4Ml03Bz8TvlTPLWYXKDiqCiG1eCAXk-I9xBYAII9Jc'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ownerInput = document.getElementById('owner')
const checkButton = document.getElementById('checkButton');
const newOwner = document.getElementById('newOwnerButton');
const resultsDiv = document.getElementById('owner-results');
const superResults = document.getElementById('results');
const messageDiv = document.getElementById('message-owner');
const vehicleMessage = document.getElementById('message-vehicle')

ownerInput.addEventListener('input', () => {
  checkButton.disabled = ownerInput.value.trim() === '';
});

/* IF CHECK OWNER BUTTON IS PRESSED*/
checkButton.addEventListener('click', async function checkOwner()
{
  const ownerName = ownerInput.value.trim();

  resultsDiv.innerHTML = '';
  messageDiv.innerText = '';

  const { data, error } = await supabase
    .from('People')
    .select('*')
    .ilike('Name', `%${ownerName}%`);

    superResults.classList.add("active");

    if (data.length > 0) {
      resultsDiv.classList.add("active");

  } else {
      resultsDiv.classList.remove("active");
  }

/*PRINT EACH OWNER"S DETAILS*/
    data.forEach(owner => {
      const resultDiv = document.createElement('div');
      resultDiv.classList.add('search-result');
      resultDiv.innerHTML = `
        <strong>Name:</strong> ${owner.Name}<br>
        <strong>Address:</strong> ${owner.Address}<br>
        <strong>Date of Birth:</strong> ${owner.DOB}<br>
        <strong>License Number: </strong>${owner.LicenseNumber}<br>
        <strong>Expiry Date:</strong> ${owner.ExpiryDate}<br>
        <button type='button' class='selectButton' data-owner-id='${owner.PersonID}'>Select Owner</button>
      `;
      resultsDiv.appendChild(resultDiv);
    });
/*IF SELECT OWNER IS PRESSED*/
    resultsDiv.addEventListener('click', async (event) => {
      if (event.target && event.target.classList.contains('selectButton')) {
        const selectedOwnerId = event.target.getAttribute('data-owner-id');

/*COLLECT DATA ABOUT THE OWNER*/        
        const { data: selectedOwner, error } = await supabase
          .from('People')
          .select('*')
          .eq('PersonID', selectedOwnerId)
          .single(); // .single() ensures only one owner is returned
    
        if (error) {
          console.error('Error fetching owner:', error);
        }     
          messageDiv.innerText = `Owner Selected: ${selectedOwner.Name}`;

          window.selectedOwner = selectedOwner.PersonID;
      }
    });

    newOwner.style.display = 'inline-block';
});

const addVehicleButton = document.getElementById('addVehicle');
addVehicleButton.addEventListener('click', async () => {

  const rego = document.getElementById('rego').value.trim()
  const make = document.getElementById('make').value.trim()
  const model = document.getElementById('model').value.trim()
  const colour = document.getElementById('colour').value.trim()

  /*IF ANY FIELDS ARE EMPTY*/
  if(!rego||!make||!model||!colour){
    vehicleMessage.innerText = "Error: All fields must be completed"
    return;
  }
  /*IF COLOUR ENTERED IS A NUMBER*/
  if (!isNaN(colour)) {
    vehicleMessage.innerText = 'Error: Colour field cannot be a number';
    return;
  }
  
  document.getElementById('rego').value = '';
  document.getElementById('make').value = '';
  document.getElementById('model').value = '';
  document.getElementById('colour').value = '';

  console.log(window.selectedOwner, rego, make, model, colour )

  const { error: insertError2 } = await supabase
  .from('Vehicles')
  .insert({
    VehicleID: rego,
    Make: make,
    Model: model,
    Colour: colour,
    OwnerID: window.selectedOwner
  });


if (insertError2) {
  vehicleMessage.innerText = 'Error: Could not add vehicle';
} else {
  vehicleMessage.innerText = 'Vehicle added successfully';
}
})


/*IF NEW OWNER BUTTON IS PRESSED*/
newOwner.addEventListener('click', async function addNewOwner(){
  resultsDiv.innerHTML = '';
  newOwner.style.display = 'none';

  const newForm = document.createElement('form');
  newForm.innerHTML = `
    <label for="name">Enter owner name:</label>
    <input id="name" name="name"><br>
    <label for="address">Enter address:</label>
    <input id="address" name="address"><br>
    <label for="dob">Enter date of birth:</label>
    <input id="dob" name="dob"><br>
    <label for="license">Enter license:</label>
    <input id="license" name="license"><br>
    <label for="expire">Enter expiring date:</label>
    <input id="expire" name="expire"><br>
    <button type="button" id="addOwner">Add owner</button>
  `;
  resultsDiv.appendChild(newForm);
  const addOwnerButton = document.getElementById('addOwner');

  addOwnerButton.addEventListener('click', async () =>{
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const license = document.getElementById('license').value.trim();
    const expire = document.getElementById('expire').value.trim();

    /* IF ONE OF THE FIELDS IS EMPTY*/
   if (!name || !address || !dob || !license || !expire) {
      messageDiv.innerText = "Error: All fields must be completed";
      return;
    }
    
    /*IF DOB OR EXPIRY DATE IS NOT IN CORRECR FORMAT*/
  if (!datePattern.test(dob) || !datePattern.test(expire)) {
    messageDiv.innerText = 'Error: Dates must be in the correct format';
    return;
  }
  /*IF DOB IS NOT IN THE PAST*/
  const today = new Date().toISOString().split('T')[0];
  if (dob >= today) {
    messageDiv.innerText = 'Error: DOB must be in the past';
    return;
  }
  /*IF EXPIRY IS NOT IN FUTURE*/
  if (expire <= today) {
    messageDiv.innerText = 'Error: Licence expiry must be in the future';
    return;
  }
    const { data: existing, error: existingError } = await supabase
      .from('People')
      .select('*')
      .eq('Name', name)
      .eq('Address', address)
      .eq('DOB', dob)
      .eq('LicenseNumber', license)
      .eq('ExpiryDate', expire);

      if (existingError) {
        messageDiv.innerText = 'Error: Could not check for duplicates';
        return;
      }

      /*IF THERE IS A DUPLICATE*/
      if (existing.length > 0) {
        messageDiv.innerText = 'Error: This owner already exists';
        return;
      }

      const { error: insertError } = await supabase
      .from('People')
      .insert({
        Name: name,
        Address: address,
        DOB: dob,
        LicenseNumber: license,
        ExpiryDate: expire
      });

    if (insertError) {
      console.error('Insert error details:', insertError.message);
      messageDiv.innerText = 'Error: Could not add owner';
    } else {
      messageDiv.innerText = 'Owner added successfully';
    }

})

})


