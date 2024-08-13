import { app } from "../../js/config/db-config.js";
import { checkAuth } from "./auth/check-receptAuth.js"
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged, } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';


const auth = getAuth();

onAuthStateChanged(auth, (user) => {

    if (user) {

        checkAuth();

    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});

// start execution from here..
(async () => {
    try {
        const appointments = await getAppointments();

        if (!appointments) {
            console.log('No appointments available.');
            return;
        }

        let appointmentsArray = Object.entries(appointments);

        let cardPromises = appointmentsArray.map(async (element) => {
            let getPatient = await getPatientByPid(element[1].pId);

            let doctor = await getDoctorByDid(element[1].dId);


            // in case dr name is not avl i.e, deleted
            let drName = (doctor != null) ? doctor.name : "NOT AVL..";

            // console.log(element);

            return {
                pId: getPatient.pId,
                pName: getPatient.name,
                dName: drName,
                aId: element[0],
                date: element[1].date,
                status: element[1].status
            };
        });

        // Wait for all promises to resolve
        let cardArray = await Promise.all(cardPromises);

        // Load data into cards after all promises are resolved
        loadDataIntoTable(cardArray);
        document.querySelector(".Spinner").classList.add("hide-spinner");


        document.getElementById("SEARCH_INPUT").addEventListener("change", () => {
            searchFun(cardArray);
        });


        console.groupCollapsed("data = "); console.log(cardArray); console.groupEnd();

    } catch (error) {
        console.error('Error processing appointments:', error);
    }
})();


// get appointments
async function getAppointments() {
    const dbRef = ref(getDatabase());
    try {
        const snapshot = await get(child(dbRef, `appointments`));
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            return snapshot.val();  // Return the data directly
        } else {
            console.log("No data available");
            return null;  // Return null if no data exists
        }
    } catch (error) {
        console.error("Error getting data:", error);
        throw new Error("Failed to load data");  // Throw an error to be handled by the caller
    }
}

// get Patient By pId
async function getPatientByPid(pId) {
    const dbRef = ref(getDatabase());
    try {
        const dbRef = ref(getDatabase());
        let snapshot = await get(child(dbRef, `patients/${pId}`));
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            return snapshot.val();
        } else {
            // console.log("No data available");
            return null;
        }

    } catch (error) {
        console.error("Error getting data:", error);
        throw new Error("Failed to load data");  // Throw an error to be handled by the caller
    }
}

// get Doctor By dId
async function getDoctorByDid(dId) {
    const dbRef = ref(getDatabase());
    try {
        const dbRef = ref(getDatabase());
        let snapshot = await get(child(dbRef, `doctors/${dId}`));
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            return snapshot.val();
        } else {
            // console.log("No data available");
            return null;
        }

    } catch (error) {
        console.error("Error getting data:", error);
        throw new Error("Failed to load data");  // Throw an error to be handled by the caller
    }
}


// Load data into table
function loadDataIntoTable(cardArray) {
    // clear table data
    document.getElementById("TBL_BODY").innerHTML = "";

    // add data into table
    cardArray.forEach(element => {

        document.getElementById("TBL_BODY").innerHTML += `
            <tr>
                    <td>${element.pName}</td>
                    <td>${element.dName}</td>
                    <td>${element.date}</td>
                    <td>${element.status}</td>
                    <td><div class="view"><a href="../../common UI/apt-details.html?appointment=${element.aId}&patient=${element.pId}">VIEW</a></div></td>
            </tr>
        `;
    });
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