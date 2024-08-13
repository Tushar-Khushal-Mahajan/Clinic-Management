import { app } from "../../js/config/db-config.js";
import { checkAuth } from "./auth/dr-auth.js"
import { getDatabase, query, ref, get, child, update, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';


const auth = getAuth();



onAuthStateChanged(auth, async (user) => {

    if (user && user.uid == localStorage.getItem("uid")) {

        // check authorization

        checkAuth();

        // ---------

        let aptData = await getAptsByDId(user.uid);

        // --- log the data
        console.groupCollapsed("Apt data = "); console.log(aptData); console.groupEnd();
        // ---

        document.getElementById("SEARCH_INPUT").addEventListener("change", () => { searchData(aptData) });
        insertDataIntoTable(aptData);

    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});


async function getPatientByPId(pId) {
    const dbRef = ref(getDatabase());
    let snapshot = await get(child(dbRef, `patients/${pId}`));

    if (snapshot.exists()) {

        return {
            name: snapshot.val().name,
            email: snapshot.val().email,
            mobile: snapshot.val().mobile
        }
    } else {
        console.log("No data available");
    }

}

// Gets Appointments by Doctor Id
async function getAptsByDId(dId) {
    const dbRef = ref(getDatabase(), 'appointments'); // Reference to the correct path in the database
    const queryRef = query(dbRef, orderByChild('dId'), equalTo(dId));

    let Aptdata = [];

    let snapshot = await get(queryRef);
    if (snapshot.exists()) {

        const promises = Object.entries(snapshot.val()).map(async (aptObj) => {

            let patientObj = await getPatientByPId(aptObj[1].pId);

            if (aptObj[1].status != "Complete") {
                let obj = {
                    aId: aptObj[0],
                    dId: aptObj[1].dId,
                    pId: aptObj[1].pId,
                    date: aptObj[1].date,
                    status: aptObj[1].status,
                    action: aptObj[1].Action,
                    ...patientObj
                };

                Aptdata.push(obj);
            }

        });

        await Promise.all(promises);

        return Aptdata;

    } else {
        return [];
    }
}

// search function

function searchData(aptData) {

    let search = document.getElementById("SEARCH_INPUT").value;

    if (search.trim() != "") {

        let searchData = aptData.filter((e) => {

            for (const itr in e) {

                if (e[itr].toLowerCase().includes(search.toLowerCase())) {

                    return true;
                }
            }
        });


        insertDataIntoTable(searchData);
    } else {
        insertDataIntoTable(aptData);
    }
}


// cancle appointment btn
function cancleApt(aId) {

    let ch = confirm("Do you want to cancle this appointment");

    if (ch) {

        const db = getDatabase();
        const appointmentRef = ref(db, `appointments/${aId}`);

        const updates = {
            status: "Cancle",
            Action: "Cancle By Doctor"
        };

        update(appointmentRef, updates)
            .then(() => {
                console.log('Appointment Cancled successfully');
                alert("Appointment Cancled");

                window.location.reload();
            })
            .catch((error) => {
                console.error('Error Cancling appointment:', error);
            });
    }

}


// Insert data into table
function insertDataIntoTable(aptData) {


    let tblBody = document.getElementById("TBL_BODY");
    tblBody.innerHTML = "";

    aptData.forEach(element => {

        console.log(element);

        let action;

        if (element.status == "Pending") {
            action = `    <button class="form-group warn cacle-btn" data-id="${element.aId}">Cancle</button> &nbsp;
                          <a href="../../common UI/apt-details.html?appointment=${element.aId}&doctor=${element.dId}&patient=${element.pId}" class="btn success "> Prescribe</a>
                    `;
        }
        else {
            action = `<span style="background-color:var(--warning);">${element.action}</span>`;
        }

        tblBody.innerHTML += `
            <tr>
                <td>${element.name}</td>
                <td>${element.email}</td>
                <td>${element.mobile}</td>
                <td>${element.date}</td>
                <td>${action}</td>
            </tr>
        `;

    });
    document.querySelector(".Spinner").classList.add("hide-spinner");

    // Event Listener for cancle appointment btn
    document.querySelectorAll(".cacle-btn").forEach(e => {
        let aptId = e.getAttribute("data-id");

        e.addEventListener("click", () => { cancleApt(aptId); });
    });
}
