import { app } from "../../js/config/db-config.js";
import { checkAuth } from "./auth/check-receptAuth.js"
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';



const auth = getAuth();



onAuthStateChanged(auth, (user) => {

    if (user && user.uid == localStorage.getItem("uid")) {
        checkAuth();

        queryPatientData();

    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});

async function queryPatientData() {
    const dbRef = ref(getDatabase());
    try {
        const snapshot = await get(child(dbRef, `patients`));
        if (snapshot.exists()) {

            let patientData = Object.values(snapshot.val());

            loadDataIntoTable(patientData);

            document.querySelector(".Spinner").classList.add("hide-spinner");

            document.getElementById("SEARCH_INPUT").addEventListener("change", () => { searchFun(patientData); })


        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error getting data:", error);
        alert("Failed to load doctor data.");
    }
}

function loadDataIntoTable(patientData) {

    const tableBody = document.getElementById("TBL_BODY");
    tableBody.innerHTML = '';

    patientData.forEach(e => {
        // console.log(e);
        tableBody.innerHTML += `
            <tr>
                <td>${e.name}</td>
                <td>${e.email}</td>
                <td>${e.mobile}</td>
                <td>${e.password}</td>
            </tr>
        `;

    });


    // logging :-
    console.groupCollapsed("Patients = "); console.log(patientData); console.groupEnd();
}



function searchFun(cardArray) {

    let search = document.getElementById("SEARCH_INPUT").value;
    // let search = "tushar";

    if (search.trim() != "") {

        let searchData = cardArray.filter((e) => {

            for (const itr in e) {

                if (e[itr].toLowerCase().includes(search.toLowerCase())) {

                    return true;
                }
            }
        });

        loadDataIntoTable(searchData);
    } else {
        loadDataIntoTable(cardArray);;
    }

}