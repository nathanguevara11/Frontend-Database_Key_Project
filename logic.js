const emp_dropdown = document.getElementById("emp_id");
const building_dropdown = document.getElementById("building_id");
const key_dropdown = document.getElementById("key_id");
const check_in_btn = document.getElementById('check_in_key');
const check_out_btn = document.getElementById('check_out_key');
const confirm_building_btn = document.getElementById('confirm_building_btn');
const confirm_key_btn = document.getElementById('confirm_checkin_btn');
const checked_in_mess = document.getElementById('checked_in_message');
const checked_out_mess = document.getElementById('checked_out_message');
const checked_in_mess_2 = document.getElementById('checked_in_message_2');
const checked_out_mess_2 = document.getElementById('checked_out_message_2');
const box2 = document.querySelector(".b-stuff");
const key_status_list_conatiner = document.getElementById('key_status_list_container');


//debuggers off chatgpt--------------------------------------------------
function initializeBuildingDropdown() {
    building_dropdown.innerHTML = '';
 
    // Placeholder option (empty value)
    const placeholder = document.createElement('option');
    placeholder.value = "";
    placeholder.textContent = "Select your building";
    building_dropdown.appendChild(placeholder);

    // Default building option that will always be there
    const defaultBuilding = document.createElement('option');
    defaultBuilding.value = "Main Building";
    defaultBuilding.textContent = "Main Building";
    building_dropdown.appendChild(defaultBuilding);
}
function initializeKeyDropdown() {
    key_dropdown.innerHTML = '';

    // Placeholder option (empty value)
    const placeholder = document.createElement('option');
    placeholder.value = "";
    placeholder.textContent = "Select a key";
    placeholder.disabled = true;  // optional: prevents selecting placeholder again
    placeholder.selected = true;  // shows this initially
    key_dropdown.appendChild(placeholder);

    // Default key that is always available
    const defaultKey = document.createElement('option');
    defaultKey.value = "Master Key";
    defaultKey.textContent = "Master Key";
    key_dropdown.appendChild(defaultKey);
}
//debuggers offf chatgpt----------------------------------------------------

//loads employees from database ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    try{
        const result = await fetch('/get_the_employee_ids_from_the_database');
        const employees = await result.json(); 
        emp_dropdown.innerHTML = ''; 
        if (employees.length === 0){
            emp_dropdown.innerHTML = '<option value ="">No employees available</option>'
            return; 
        }
        else{

            employees.forEach(employee => {
                    const list_element= document.createElement('option');
                    list_element.value = employee.name; 
                    list_element.textContent = `${employee.name}`;
                    emp_dropdown.appendChild(list_element); 
                })
        }

    }
    catch(err){
        console.log(err);
    }
});
//-----------------------------------------------------------------------


//load information about keys ----------------------------------------------------
async function KeyInfo(){
    try {
        const result = await fetch('/database_key_status'); 
        const keys = await result.json(); 

        const list = document.getElementById('key_status_list');
        list.innerHTML = ''; 
        if(keys.length === 0){
            key_status_list_conatiner.style.display = 'inline-block';
            list.innerHTML = '<li>No keys available for check out</li>'; 
            return; 
        }
        else{
            key_status_list_conatiner.style.display = 'inline-block';
            keys.forEach(key => {
                const list_element= document.createElement('li');
                list_element.textContent = `${key.name} has been checked out by ${key.emp_id}`;
                list.appendChild(list_element); 
            })
        } 
    }
    catch(err){
        console.log(err); 

    }
}
//--------------------------------------------------------------------


//loads buildings from the database ----------------------------------------------------
async function loadAvailableBuildings(){
    try{
        const building_result = await fetch('/available_buildings', {
                    method: "POST", 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({emp_id: emp_dropdown.value})
                });        
        const building_data = await building_result.json(); 

        if(!building_data.success){
                alert(building_data.message);
                return false; 
            }
            else if(building_data.buildings.length === 0){
                alert("No buildings in database available");
                return false; 
            }
            else{
                building_data.buildings.forEach((building)=> {
                    const option = document.createElement('option');
                    option.value = building; 
                    option.textContent =building; 
                    building_dropdown.appendChild(option);
                })
            }
            return true; 
    }
    catch(err){
        console.log(err);
        return false; 
    }
}
//---------------------------------------------------------------------  


//loads keys from database ----------------------------------------------------
async function loadAvailableKeys(){
    try{

        let emp_id = emp_dropdown.value; 
        let building_id = building_dropdown.value;

        const key_result = await fetch('/available_keys', {
                method: "POST", 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({emp_id: emp_id, building_id: building_id })
            }); 

        const key_data = await key_result.json(); 
        
        if(!key_data.success){
            alert(key_data.message);
            return false; 
        }
        else if(key_data.keys.length === 0){
            alert("No keys in database available");
            return false; 
        }
        else{
            key_data.keys.forEach((key)=> {
                const option = document.createElement('option');
                option.value = key; 
                option.textContent =key; 
                key_dropdown.appendChild(option);
            })
        } 
        return true;
    }
    catch(err){
        console.log(err);
        return false; 
    }
}
//---------------------------------------------------------------------


//loads keys already checked out in database ----------------------------------------------------
async function loadCheckedOutKeys(){
    try{
        const key_result = await fetch('/returnable_keys_for employee', {
                    method: "POST", 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({emp_id: emp_dropdown.value})
                }); 

            const key_data = await key_result.json(); 
            
            if(!key_data.success){
                alert(key_data.message);
                return; 
            }
            else if (key_data.keys.length === 0){
                check_out_btn.disabled = true; 
            }
            else{
                key_data.keys.forEach((key)=> {
                    const option = document.createElement('option');
                    option.value = key; 
                    option.textContent =key; 
                    key_dropdown.appendChild(option);
                })
            }
    }
    catch(err){
        console.log(err);
        return false; 
    }
}
//----------------------------------------------------------------------


//confirms the building the user chooses to take keys from ----------------------------------------------------
async function confirmBuilding(){
    let emp_id = emp_dropdown.value; 
    let building_id = building_dropdown.value; 

    if (!emp_id || !building_id ){
        alert("Please check employee or building.");
        return;  
    }

    check_in_btn.style.display = 'none';
    building_dropdown.disabled = true; 
    confirm_building_btn.hidden = true; 

    initializeKeyDropdown(); 
    key_dropdown.style.display = "inline-block";
    // emp_dropdown.value = ''; 

    // let check_in_time = new Date().toISOString();
    // console.log(check_in_time)
    try { 

        const keyLoads = await loadAvailableKeys(); 
        if (!keyLoads){
            return; 
        } 
        confirm_key_btn.hidden = false; 
    }
    catch(err){
        console.error(err);
    } 
}
//----------------------------------------------------------------------


//confirms the keys the user wants to take ----------------------------------------------------
async function confirmCheckin(){
    let emp_id = emp_dropdown.value; 
    let building_id = building_dropdown.value; 
    const keys_array = [...document.getElementById("key_id").options].filter(option => option.selected && option.value).map(selected => selected.value); 

    if (!emp_id || !building_id || keys_array.length === 0){
        alert("Please check in a key or employee or building.");
        return;  
    }

    let check_in_time = new Date().toISOString();
    console.log(check_in_time)
    try { 
        const result = await fetch('/check_in_keys', {
            method: "POST", 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({emp_id: emp_id, building_id: building_id, keys_array: keys_array, check_in_time: check_in_time})
        }); 

        const data = await result.json(); 
        
        if(!data.success){
            alert(data.message);
            return; 
        }
        else{
            checked_in_mess.style.display = 'inline-block';
            checked_in_mess.innerHTML = `${emp_id} has now checked in key from building ${building_id} at ${check_in_time}!`
            checked_in_mess_2.style.display = 'inline-block';
            checked_in_mess_2.innerHTML = `<p>${data.message}</p>`;
        }
    }
    catch(err){
        console.error(err);
    } 
}
//----------------------------------------------------------------------


//resets the page layout ----------------------------------------------------
function resetPage() {
    emp_dropdown.value = '';
    building_dropdown.innerHTML = '';
    building_dropdown.value = ''; 
    building_dropdown.disabled = false; 
    
    key_dropdown.innerHTML = '';
    [...key_dropdown.options].forEach(choice => choice.selected = false); 
    key_dropdown.selectedIndex = -1; 

    
    box2.style.display = 'none';
    check_in_btn.style.display = 'none';
    check_out_btn.style.display = 'none';

    key_dropdown.style.display = "none"; 
    building_dropdown.style.display = "none";  
    confirm_key_btn.hidden = true; 
    confirm_building_btn.hidden = true; 

    checked_in_mess.style.display = 'none';
    checked_in_mess_2.style.display = 'none';
    checked_out_mess.style.display = 'none';
    checked_out_mess_2.style.display = 'none';
}
//--------------------------------------------------------------------


//Event listener for which employee is getting keys----------------------------------------------------
emp_dropdown.addEventListener('change', async function(){
   try {
        key_dropdown.innerHTML = ``;
        checked_in_mess.style.display = 'none';
        checked_in_mess.innerHTML = ``
        checked_out_mess.style.display = 'none';
        checked_out_mess.innerHTML = ``

        if (!emp_dropdown.value){
            resetPage(); 
            return; 
        }
            
        box2.style.display = "flex"; 
        check_in_btn.style.display = 'inline-block';
        check_out_btn.style.display = 'inline-block';
 
    }
    catch(err){
        console.error(err);
    } 
});
//-----------------------------------------------------------------

//user chooses this or check otu key button to start the process------------------------
check_in_btn.addEventListener('click', async function() {
    initializeBuildingDropdown(); 
    building_dropdown.style.display = "inline-block";
    const avalBuilding = await loadAvailableBuildings(); 
    
    check_in_btn.style.display = 'none'; 
    check_out_btn.style.display = 'none';
    if (avalBuilding){

    }  
});
//------------------------------------------------------------------

//Event listener for what building the user wants keys selection from ----------------------------------------------------
building_dropdown.addEventListener("change", async function () {
    try{
        if(building_dropdown.value){
            confirm_building_btn.hidden = false;
        } 
    }
        catch(err){
            console.log(err); 
        }
});
building_dropdown.addEventListener("click", async function () {
    try{
        if(building_dropdown.value){
            confirm_building_btn.hidden = false;
        }
    }
        catch(err){
            console.log(err); 
        }
});

//sends the builing chosen by thte user to the java server-------------------------------
confirm_building_btn.addEventListener('click', async () =>{
            try { 
                await confirmBuilding()
            }
            catch(err){
                console.log(err); 
            }
            
            // building_dropdown.style.display = 'none'; 
            confirm_building_btn.hidden = true; 
});
//--------------------------------------------------------------------

key_dropdown.addEventListener("change", async function()
{
    confirm_key_btn.hidden = false; 
}); 
//confirm the keys the user wants to take-----------------------------
confirm_key_btn.addEventListener("click", async function (){
    const final_confirmation = await confirmCheckin();
    setTimeout(resetPage, 3000); 
});
//sends the keys checked out by the user------------------------------
check_out_btn.addEventListener('click', async function() {
    await loadCheckedOutKeys();
 
    if(document.getElementById('Confirm_Checkout_btn')){
        alert("Please confirm key.");
        return; 
    }
    const confirm_checkout_btn = document.createElement('button');
    confirm_checkout_btn.id = "Confirm_Checkout_btn"
    confirm_checkout_btn.textContent = 'Confirm Key Checkout';
    box2.appendChild(confirm_checkout_btn);


    let emp_id = emp_dropdown.value; 
    let key_id = key_dropdown.value; 
    if (!emp_id || !key_id){
        alert("Please check in a key or employee.");
        return;  
    }
    check_out_btn.style.display = 'none';
    emp_dropdown.value = ''; 

    let check_out_time = new Date().toISOString();
    console.log(check_out_time)
    try { 
        const result = await fetch('/check_out_keys', {
            method: "POST", 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({emp_id: emp_id, key_id: key_id, check_out_time: check_out_time})
        }); 

        const data = await result.json(); 
        
        if(!data.success){
            alert(data.message);
            return; 
        }
        else{
            checked_out_mess.style.display = 'inline-block';
            checked_out_mess.innerHTML = `${emp_id} has now checked out key at ${check_out_time}!`
            checked_out_mess_2.style.display = 'inline-block';
            checked_out_mess_2.innerHTML = `<p>${data.message}</p>`;
        }
        KeyInfo(); 

        setTimeout(resetPage, 3000); 
        }
        catch(error){
            console.log(error);
        }
        
});
//--------------------------------------------------------------------------


//ARCHIVE OF REMOVED CHANGES--------------------------------------------------
//
    // const building_id = building_dropdown.value; 
    // const result = await fetch('/check_in_keys', {
    //         method: "POST", 
    //         headers: {'Content-Type': 'application/json'}, 
    //         body: JSON.stringify({emp_id: emp_id, building_id: building_id})
    //     }); 
//});

// key_dropdown.addEventListener("change", async function()
//  {
//     const keys_array = [...document.getElementById("key_id").options].filter(option => option.selected && option.value).map(selected => selected.value);
//  }); 

// function refresh() 
// {
//     fetch('/api/').then(response => response.json()).then(data => 
//         {
//             // emp_dropdown.innerHTML = "<option value = ''> Not an employee</option>"; 

//         data.forEach(id => {
//             const options = document.createElement('option');
//             options.value = id;
//             options.textContent = id; 
//             emp_dropdown.appendChild(options);  
//         })

//         })
// }

// localStorage.clear()


// emp_dropdown.addEventListener('change', function() 
// {
//     clocked_in_mess.style.display = 'none';
//     clocked_in_mess.innerHTML = ``
//     clocked_out_mess.style.display = 'none';
//     clocked_out_mess.innerHTML = ``

//     if (emp_dropdown.value)
//         {
//             box2.style.display = "flex"; 
//             check_in_btn.style.display = 'inline-block';
//             clock_out_btn.style.display = 'inline-block';
//             setTimeout(function () {
//                 location.reload();
//             }, 8000); 
//         }  
// } );

// const emp_dropdown = document.getElementById("emp_id");
// const key_dropdown = document.getElementById("key_id");
// const check_in_btn = document.getElementById('check_in_key');
// const check_out_btn = document.getElementById('check_out_key');
// const checked_in_mess = document.getElementById('checked_in_message');
// const checked_out_mess = document.getElementById('checked_out_message');
// const checked_in_mess_2 = document.getElementById('checked_in_message_2');
// const checked_out_mess_2 = document.getElementById('checked_out_message_2');
// const box2 = document.querySelector(".b-stuff");
// const key_status_list_conatiner = document.getElementById('key_status_list_container');


// document.addEventListener('DOMContentLoaded', async function () {
//     try{
//         const result = await fetch('/get_the_employee_ids_from_the_database');
//         const employees = await result.json(); 
//         emp_dropdown.innerHTML = ''; 
//         if (employees.length === 0){
//             emp_dropdown.innerHTML = '<li>No employees available for check out</li>'
//             return; 
//         }
//         else{

//             employees.forEach(employee => {
//                     const list_element= document.createElement('option');
//                     list_element.value = employee.name; 
//                     list_element.textContent = `${employee.name}`;
//                     emp_dropdown.appendChild(list_element); 
//                 })
//         }

//     }
//     catch(err){
//         console.log(err);
//     }
// });


// async function KeyInfo(){
//     try {
//         const result = await fetch('/database_key_status'); 
//         const keys = await result.json(); 

//         const list = document.getElementById('key_status_list');
//         list.innerHTML = ''; 
//         if(keys.length === 0){
//             key_status_list_conatiner.style.display = 'inline-block';
//             list.innerHTML = '<li>No keys available for check out</li>'; 
//             return; 
//         }
//         else{
//             key_status_list_conatiner.style.display = 'inline-block';
//             keys.forEach(key => {
//                 const list_element= document.createElement('li');
//                 list_element.textContent = `${key.name} has been checked out by ${key.emp_id}`;
//                 list.appendChild(list_element); 
//             })
//         } 
//     }
//     catch(err){
//         console.log(err); 

//     }
// }

// async function loadAvailableKeys(){
//      const key_result = await fetch('/available_keys', {
//                 method: "POST", 
//                 headers: {'Content-Type': 'application/json'}, 
//                 body: JSON.stringify({emp_id: emp_dropdown.value})
//             }); 

//         const key_data = await key_result.json(); 
        
//         if(!key_data.success){
//             alert(key_data.message);
//             return; 
//         }
//         else{
//             key_data.keys.forEach((key)=> {
//                 const option = document.createElement('option');
//                 option.value = key; 
//                 option.textContent =key; 
//                 key_dropdown.appendChild(option);
//             })
//         } 
// }

// async function loadCheckedOutKeys(){
//     const key_result = await fetch('/returnable_keys_for employee', {
//                 method: "POST", 
//                 headers: {'Content-Type': 'application/json'}, 
//                 body: JSON.stringify({emp_id: emp_dropdown.value})
//             }); 

//         const key_data = await key_result.json(); 
        
//         if(!key_data.success){
//             alert(key_data.message);
//             return; 
//         }
//         else if (data.keys.length === 0){
//             check_out_btn.disabled = true; 
//         }
//         else{
//             key_data.keys.forEach((key)=> {
//                 const option = document.createElement('option');
//                 option.value = key; 
//                 option.textContent =key; 
//                 key_dropdown.appendChild(option);
//             })
//         } 
// }

// async function confirmCheckin(){
//     let emp_id = emp_dropdown.value; 
//     let key_id = key_dropdown.value; 

//     if (!emp_id || !key_id){
//         alert("Please check in a key or employee.");
//         return;  
//     }

//     check_in_btn.style.display = 'none';
//     emp_dropdown.value = ''; 

//     let check_in_time = new Date().toISOString();
//     console.log(check_in_time)
//     try { 
//         const result = await fetch('/check_in_keys', {
//             method: "POST", 
//             headers: {'Content-Type': 'application/json'}, 
//             body: JSON.stringify({emp_id: emp_id, key_id: key_id, check_in_time: check_in_time})
//         }); 

//         const data = await result.json(); 
        
//         if(!data.success){
//             alert(data.message);
//             return; 
//         }
//         else{
//             checked_in_mess.style.display = 'inline-block';
//             checked_in_mess.innerHTML = `${emp_id} has now checked in key ${key_id} at ${check_in_time}!`
//             checked_in_mess_2.style.display = 'inline-block';
//             checked_in_mess_2.innerHTML = `<p>${data.message}</p>`;
//         }
//         KeyInfo(); 
//         setTimeout(resetPage, 3000);
//     }
//     catch(err){
//         console.error(err);
//     } 
// }


// function resetPage() {
//     emp_dropdown.value = ''; 
//     key_dropdown.innerHTML = ''; 

//     box2.style.display = 'none';

//     check_in_btn.style.display = 'none';
//     check_out_btn.style.display = 'none';

//     checked_in_mess.style.display = 'none';
//     checked_in_mess_2.style.display = 'none';
//     checked_out_mess.style.display = 'none';
//     checked_out_mess_2.style.display = 'none';
// }

// emp_dropdown.addEventListener('change', async function(){
//    try {
//         key_dropdown.innerHTML = ''; 
//         checked_in_mess.style.display = 'none';
//         checked_in_mess.innerHTML = ``
//         checked_out_mess.style.display = 'none';
//         checked_out_mess.innerHTML = ``

//         if (!emp_dropdown.value){
//             resetPage(); 
//             return; 
//         }
            
//         box2.style.display = "flex"; 
//         check_in_btn.style.display = 'inline-block';
//         check_out_btn.style.display = 'inline-block';
 
//     }
//     catch(err){
//         console.error(err);
//     } 
// });


// check_in_btn.addEventListener('click', async function() {
//     await loadAvailableKeys(); 
//     confirm_checkin_btn.id = "Confirm_Checkin_btn"
//     confirm_checkin_btn.textContent = 'Confirm Key Check-in';
//     box2.appendChild(confirm_checkin_btn);

//     confirm_checkin_btn.addEventListener('click', async () =>{
//         try { 
//             await confirmCheckin()
//         }
//         catch(err){
//             console.log(err); 
//         }
        
//         confirm_checkin_btn.remove();
//     });        
// });


// check_out_btn.addEventListener('click', async function() {
//     await loadCheckedOutKeys();
 
//     const confirm_checkout_btn = document.createElement('button');
//     confirm_checkout_btn.textContent = 'Confirm Key Checkout';
//     box2.appendChild(confirm_checkout_btn);


//     let emp_id = emp_dropdown.value; 
//     let key_id = key_dropdown.value; 
//     if (!emp_id || !key_id){
//         alert("Please check in a key or employee.");
//         return;  
//     }
//     check_out_btn.style.display = 'none';
//     emp_dropdown.value = ''; 

//     let check_out_time = new Date().toISOString();
//     console.log(check_out_time)
//     try { 
//         const result = await fetch('/check_out_keys', {
//             method: "POST", 
//             headers: {'Content-Type': 'application/json'}, 
//             body: JSON.stringify({emp_id: emp_id, key_id: key_id, check_out_time: check_out_time})
//         }); 

//         const data = await result.json(); 
        
//         if(!data.success){
//             alert(data.message);
//             return; 
//         }
//         else{
//             checked_out_mess.style.display = 'inline-block';
//             checked_out_mess.innerHTML = `${emp_id} has now checked out key at ${check_out_time}!`
//             checked_out_mess_2.style.display = 'inline-block';
//             checked_out_mess_2.innerHTML = `<p>${data.message}</p>`;
//         }
//         KeyInfo(); 

//         setTimeout(resetPage, 3000); 
//         }
//         catch(error){
//             console.log(error);
//         }
        
// } );


// function refresh() 
// {
//     fetch('/api/').then(response => response.json()).then(data => 
//         {
//             // emp_dropdown.innerHTML = "<option value = ''> Not an employee</option>"; 

//         data.forEach(id => {
//             const options = document.createElement('option');
//             options.value = id;
//             options.textContent = id; 
//             emp_dropdown.appendChild(options);  
//         })

//         })
// }

// localStorage.clear()


// emp_dropdown.addEventListener('change', function() 
// {
//     clocked_in_mess.style.display = 'none';
//     clocked_in_mess.innerHTML = ``
//     clocked_out_mess.style.display = 'none';
//     clocked_out_mess.innerHTML = ``

//     if (emp_dropdown.value)
//         {
//             box2.style.display = "flex"; 
//             check_in_btn.style.display = 'inline-block';
//             clock_out_btn.style.display = 'inline-block';
//             setTimeout(function () {
//                 location.reload();
//             }, 8000); 
//         }  
// } );
