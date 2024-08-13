import { app } from "../../js/config/db-config.js";
import { checkAuth } from "./auth/check-receptAuth.js"
import { getDatabase, ref, set, get, child, update, query, remove } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';


const auth = getAuth();



onAuthStateChanged(auth, (user) => {

    if (user) {

        // check user auth
        checkAuth();


        queryDoctorsData();

    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});

async function queryDoctorsData() {
    const dbRef = ref(getDatabase());
    try {
        const snapshot = await get(child(dbRef, `doctors`));
        if (snapshot.exists()) {

            let doctorData = Object.values(snapshot.val());

            putDataIntoTable(doctorData);

            document.querySelector(".Spinner").classList.add("hide-spinner");

            // addEventListener
            document.getElementById("SEARCH_INPUT").addEventListener("change", () => { searchData(doctorData); });

        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error getting data:", error);
        alert("Failed to load doctor data.");
    }
}

function putDataIntoTable(doctorData) {
    const tableBody = document.getElementById("TBL_BODY");
    tableBody.innerHTML = ''; // Clear existing rows

    doctorData.forEach(e => {
        // console.log(e);


        tableBody.innerHTML += `
        <tr>
            <td>${e.name}</td>
            <td>${e.specification}</td>
            <td>${e.email}</td>
            <td>${e.password}</td>
            <td>${e.fees}</td>
            <td><button class="actionBtn" data-id="${e.dId}">Delete</button></td>
            </tr>
        `;
    });

    // Add event listener for delete buttons
    tableBody.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('actionBtn')) {
            const doctorId = event.target.getAttribute('data-id');
            deleteDr(doctorId);
        }
    });


    // logging the info
    console.groupCollapsed("Doctors = "); console.log(doctorData); console.groupEnd();
}


function searchData(doctorData) {

    let search = document.getElementById("SEARCH_INPUT").value;

    if (search.trim() != "") {

        let searchData = doctorData.filter((e) => {

            for (const itr in e) {

                if (e[itr].toLowerCase().includes(search.toLowerCase())) {

                    return true;
                }
            }
        });


        putDataIntoTable(searchData);
    } else {
        putDataIntoTable(doctorData);
    }
}



async function deleteDr(doctorId) {
    try {
        const db = getDatabase();
        const doctorRef = ref(db, `doctors/${doctorId}`);


        let ch = confirm("Are you want to delete the dr..");

        if (ch) {
            // Remove the doctor record
            await remove(doctorRef);

            // Optionally, you can refresh the table data after deletion
            alert("Doctor record deleted successfully.");
            document.getElementById("TBL_BODY").innerHTML = ''; // Clear the table body
            queryDoctorsData(); // Reload the table data
        }

    } catch (error) {
        console.error("Error deleting doctor record:", error);
        alert("Failed to delete doctor record.");
    }
}
