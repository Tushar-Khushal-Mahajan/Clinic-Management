import { app } from "../../js/config/db-config.js";
import { getDatabase, query, ref, get, child, update, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';

// Collecting the url parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const aId = urlParams.get('appointment');
const dId = urlParams.get('doctor');
const pId = urlParams.get('patient');


if (aId == null || pId == null) {
    alert("Important parameters are missing !..");
    history.back(-1);
}

console.groupCollapsed("Url Parameters = ");
console.log("patient id = ", pId);
console.log("doctor id ", dId);
console.log("appointment id = ", aId);
console.groupEnd();


//=========================================================================



const auth = getAuth();

onAuthStateChanged(auth, async (user) => {

    if (user && user.uid == localStorage.getItem("uid")) {

        // getting patient info
        let ptObj = await getPatientById(pId);

        // getting apt info
        let aObj = await getAppointById(aId);

        if (ptObj != null && aObj != null) {

            // ------ add event listener into view hisotry btn
            document.getElementById("VIEW_HISTORY").addEventListener("click", () => {
                window.location.href = `./apt-history.html?patient=${aObj.pId}`;
            });
            // -----

            // combile patient and appointment object
            let aptObj = { ...ptObj, ...aObj };

            console.groupCollapsed("Appointment Obj = "); console.log(aptObj); console.groupEnd();

            // fill data into table
            fillDataIntoPage(aptObj);

            // show prescription details if doctors open this page
            if (aptObj.status === "Pending" && aptObj.dId == dId & aptObj.pId == pId) {
                showPrescriptionArea(aId);
            }

        } else {
            alert("Important Parameter Missing  \n Or may be Incorrect");
            history.back();
        }


    } else {
        alert("You are not logged In");
        window.location.replace("../login-register.html");
    }
});

document.getElementById("BACK_BTN").addEventListener("click", () => {
    history.back();
});


// Fill data Into page
function fillDataIntoPage(aptObj) {
    document.getElementById("P_NAME").innerText = aptObj.name;
    document.getElementById("P_EMAIL").innerText = aptObj.email;
    document.getElementById("P_MOBILE").innerText = aptObj.mobile;
    document.getElementById("APT_ID").innerText = aptObj.aId;
    document.getElementById("APT_DATE").innerText = aptObj.date;
    document.getElementById("P_MSG").innerText = aptObj.message;
    document.getElementById("PRESCRIPTION").innerText = aptObj.prescription || "";

    document.querySelector(".Spinner").classList.add("hide-spinner");
}




/**
 * This functions the Appointment details by appointment-id
 */
async function getAppointById(aId) {
    const dbRef = ref(getDatabase());
    let snapshot = await get(child(dbRef, `appointments/${aId}`));

    if (snapshot.exists()) {


        return {
            aId: aId,
            pId: snapshot.val().pId,
            dId: snapshot.val().dId,
            date: snapshot.val().date,
            status: snapshot.val().status,
            message: snapshot.val().message,
            prescription: snapshot.val().prescription
        }
    } else {
        console.log("No data available");
    }
}

/**
 * This function returns the patient details by the patient-id
 */
async function getPatientById(pId) {
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


// show textarea and submit btn on a screen
function showPrescriptionArea(aId) {
    document.getElementById("TBL_FOOTER").innerHTML = `
    <tr>
        <td colspan="2">
            <textarea id="PRESECIPTION_AREA" class="form-control" rows="5"></textarea>
        </td>
    </tr>
    <tr>
        <td colspan="2"> <button class="btn btn-success form-control" id="SAVE_BTN">Save</button> </td>
    </tr>
    `;


    // when submit btn get's clicked
    document.getElementById("SAVE_BTN").addEventListener("click", () => {
        let prescription = document.getElementById("PRESECIPTION_AREA").value;

        console.log("prescription = ", prescription);

        let ch = confirm("Do you want to save this Prescription");

        if (ch) {

            const db = getDatabase();
            const appointmentRef = ref(db, `appointments/${aId}`);

            const updates = {
                status: "Complete",
                Action: "Prescribe",
                prescription
            };

            update(appointmentRef, updates)
                .then(() => {
                    alert('Prescribe successfully');

                    window.location.reload();
                })
                .catch((error) => {
                    console.error('Error Cancling appointment:', error);
                });
        }
    });
}